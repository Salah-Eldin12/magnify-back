const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { ProjectSc } = require("../src/models/ProjectSc");

// get the project folder name
const uploadFolder = path.join(
  __dirname,
  "..",
  "..",
  "..",
  "var/" + "www/" + "magnify/" + "client/" + "projects/"
);
// allowed types
const allowedTypes = ["application/zip", "application/x-zip-compressed"];
// storage for Missing Data
const UploadProjectStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const projectID = req.params.id;
    const project = await ProjectSc.findById(projectID).populate("owner");
    const ToEmail = project.owner.email;
    if (project.accessUser.length >= 1) {
      const CcEmails = project.accessUser.map((user) => user.email);
      req.CcEmails = CcEmails;
    }
    req.ToEmail = ToEmail;
    if (req.query.date) {
      const DateExsit = project.subDate.find(
        (date) => new Date(date).toISOString().split("T")[0] === req.query.date
      );
      if (!DateExsit) {
        return cb("date not found", false);
      }
    }

    const projectOwner = project.owner.userName;
    const projectName = project.name;
    const projectDate = req.query.date;
    const newFolder = path.join(
      uploadFolder,
      projectOwner,
      projectName,
      projectDate ? projectDate : ""
    );

    if (fs.existsSync(newFolder)) fs.rmSync(newFolder, { recursive: true });

    fs.mkdirSync(newFolder, { recursive: true });

    cb(null, newFolder);
  },

  filename: (req, file, cb) => {
    const filname = `${file.originalname}`;
    cb(null, filname);
  },
});

const UploadProject = multer({
  storage: UploadProjectStorage,
  fileFilter: (req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return cb("file type not supported", false);
    }
    cb(null, true);
  },
});

module.exports = { UploadProject };

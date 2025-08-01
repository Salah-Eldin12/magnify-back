const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { ProjectSc } = require("../src/models/ProjectSc");

// get the project folder name
const uploadFolder = path.join(__dirname, process.env.UPLOAD_PROJECTS_PATH);
// allowed types
const allowedTypes = ["application/zip", "application/x-zip-compressed"];
// storage for Missing Data
const UploadProjectStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const projectID = req.params.id;
    const project = await ProjectSc.findById(projectID).populate("owner");
    const ToEmail = project.owner.email;
    // send email to admin & user that the project uploaded
    if (project.accessUser.length >= 1) {
      const CcEmails = project.accessUser.map((user) => user.email);
      req.CcEmails = CcEmails;
    }

    // check if the project date is exist or not
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

    req.ToEmail = ToEmail;
    req.userName = projectOwner;
    req.projectName = projectName;
    req.projectDate = projectDate ? projectDate : "";

    if (fs.existsSync(newFolder)) fs.rmSync(newFolder, { recursive: true });

    fs.mkdirSync(newFolder, { recursive: true });

    return cb(null, newFolder);
  },

  filename: (req, file, cb) => {
    const filname = `${file.originalname}`;
    return cb(null, filname);
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

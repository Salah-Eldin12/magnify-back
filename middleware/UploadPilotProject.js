const multer = require("multer");
const path = require("path");
const fs = require("fs");

// get the project folder name
const uploadFolder = path.join(__dirname, process.env.UPLOAD_PROJECTS_PATH);
// allowed types
const allowedTypes = ["application/zip", "application/x-zip-compressed"];

const PilotProjectStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const project_name = file.originalname.split(".")[0];

    const newFolder = path.join(uploadFolder, "pilot_projects/", project_name);

    if (fs.existsSync(newFolder)) fs.rmSync(newFolder, { recursive: true });

    fs.mkdirSync(newFolder, { recursive: true });

    cb(null, newFolder);
  },

  filename: (req, file, cb) => {
    const filename = `${file.originalname}`;
    cb(null, filename);
  },
});

const UploadPilotProject = multer({
  storage: PilotProjectStorage,
  fileFilter: (req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return cb("file type not supported", false);
    }
    cb(null, true);
  },
});

module.exports = { UploadPilotProject };

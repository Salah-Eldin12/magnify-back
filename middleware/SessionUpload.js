const maxSize = 100 * 1024 * 1024; // 100MB
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadFolder = path.join(__dirname, "..", "..", "photo_session_data"); // Move up one directory from the current folder
const allowedTypes = [
  "video/mp4",
  "video/3gp",
  "video/webm",
  "video/mkv",
  "video/quicktime",
];


// Ensure the directory exists before saving the file
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

const SessionStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    const filname = `${file.originalname}`;
    cb(null, filname);
  },
});

const SessionUpload = multer({
  storage: SessionStorage,
  fileFilter: (req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return cb("file type not supported", false);
    }
    cb(null, true);
  },
  limits: { fileSize: maxSize },
});

module.exports = SessionUpload;

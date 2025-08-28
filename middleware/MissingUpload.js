import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const maxSize = 100 * 1024 * 1024; // 100MB

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadFolder = path.join(__dirname, "..", "..", "missing_photo"); // Move up one directory from the current folder
const allowedTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
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

// storage for Missing Data
const MissingStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    const filname = `${file.originalname}`;
    cb(null, filname);
  },
});

const MissingUpload = multer({
  storage: MissingStorage,
  fileFilter: (req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return cb("file type not supported", false);
    }
    cb(null, true);
  },
  limits: { fileSize: maxSize },
});

export default MissingUpload;

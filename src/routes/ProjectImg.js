import express from "express";
import multer from "multer";
import { VerifyTokenAdmin } from "../../middleware/verifyToken.js";
import asyncHandler from "express-async-handler";
import { ProjectSc } from "../models/ProjectSc.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
const uploadFolder = path.join(__dirname, "..", "..", "public/images", );
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

// file filter
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: async function (req, file, cb) {
    const project = await ProjectSc.findById(req.params.id).select("name");
    const newName =
      "magnify" + new Date().getMilliseconds() + project.name + "-image.webp";
    cb(null, newName);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 },
  fileFilter: (req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return cb("file type not supported", false);
    }
    cb(null, true);
  },
});

/**
 * @desc upload project image
 * @route /upload-project-img"
 * @method POST
 * @access public
 */
router.post(
  "/:id",
  VerifyTokenAdmin,
  upload.single("project-img"),
  asyncHandler(async (req, res) => {
    const file = req.file;

    if (!file) {
      return res.status(400).send({ message: "no file choose" });
    }
    const project = await ProjectSc.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          img: {
            name: file.filename,
            path: `${process.env.SERVER_IMAGES_PATH}${file.filename}`,
          },
        },
      },
      { new: true }
    );

    res.status(200).send({
      message: "image uploaded and saved",
      img: project.img,
    });
  })
);

export default router;

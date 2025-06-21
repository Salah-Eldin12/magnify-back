const express = require("express");
const router = express.Router();
const multer = require("multer");
const { VerifyTokenAdmin } = require("../../middleware/verifyToken");
const asyncHandler = require("express-async-handler");
const { ProjectSc } = require("../models/ProjectSc");
const path = require("path");
const fs = require("fs");

const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
const uploadFolder = path.join(__dirname, "..", "..", "public", "images"); // Move up one directory from the current folder
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
      res.status(400).send({ message: "no file choose" });
    }
    const project = await ProjectSc.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          img: {
            name: file.filename,
            path: `${process.env.WEBSITE_URL_API_IMAGES_PATH}${file.filename}`,
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

module.exports = router;

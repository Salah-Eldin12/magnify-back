import express from "express";
import SessionUpload from "../../middleware/SessionUpload.js";
import MissingUpload from "../../middleware/MissingUpload.js";
import { SendEmail } from "../../middleware/SendEmail.js";

const router = express.Router();

/**
 * @desc upload files to session-data
 * @route /api/upload-files/session-upload
 * @method POST
 * @access public
 */
router.post(
  "/session-upload",
  SessionUpload.array("file", 20),
  SendEmail,
  (req, res) => {
    res.status(200).json({ message: "files uploaded" });
  }
);

/**
 * @desc upload files to missing-data
 * @route /api/upload-files/missing-upload
 * @method POST
 * @access public
 */
router.post(
  "/missing-upload",
  MissingUpload.array("file", 20),
  SendEmail,
  (req, res) => {
    res.status(200).json({ message: "files uploaded" });
  }
);

export default router;

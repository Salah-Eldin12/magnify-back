const express = require("express");
const SessionUpload = require("../../middleware/SessionUpload");
const MissingUpload = require("../../middleware/MissingUpload");
const router = express.Router();
const { SendEmail } = require("../../middleware/SendEmail");

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

module.exports = router;

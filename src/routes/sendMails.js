const express = require("express");
const {
  sendVerify,
  sendResetPassword,
} = require("../controllers/sendMailsController");
const { SendEmail } = require("../../middleware/SendEmail");
const router = express.Router();

// send verify email
router.post("/send-verify-email", sendVerify, SendEmail);

// send reset password
router.post("/send-reset-password", sendResetPassword, SendEmail);

module.exports = router;

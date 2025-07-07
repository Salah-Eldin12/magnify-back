const express = require("express");
const {
  createUser,
  Report,
  loginWithEmail,
  loginWithPhone,
  VerifyOtp,
} = require("../controllers/authController");
const { VerifyTokenAdmin } = require("../../middleware/verifyToken");
const router = express.Router();

// create user
router.post("/create-user", createUser);

// user login
router.post("/email-login", loginWithEmail);
router.post("/phone-login", loginWithPhone);
router.post("/phone-login/verify", VerifyOtp);

// report user
router.post("/report", Report);
module.exports = router;

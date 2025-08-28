import express from "express";
import {
  createUser,
  loginWithEmail,
  loginWithPhone,
  VerifyOtp,
} from "../controllers/authController.js";
import { VerifyTokenAdmin } from "../../middleware/verifyToken.js";
import { SendEmail } from "../../middleware/SendEmail.js";

const router = express.Router();

// create user
router.post("/create-user", VerifyTokenAdmin, createUser, SendEmail);

// user login
router.post("/email-login", loginWithEmail);
router.post("/phone-login", loginWithPhone);
router.post("/phone-login/verify", VerifyOtp);

export default router;

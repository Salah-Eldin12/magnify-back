import express from "express";
import {
  sendVerify,
  sendResetPassword,
} from "../controllers/sendMailsController.js";
import { SendEmail } from "../../middleware/SendEmail.js";

const router = express.Router();

// send verify email
router.post("/send-verify-email", sendVerify, SendEmail);

// send reset password
router.post("/send-reset-password", sendResetPassword, SendEmail);

export default router;

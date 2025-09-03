import express from "express";
import {
  getUser,
  updatePass,
  getUsers,
  getUserVerify,
  deleteUser,
  updateUser,
  getUserByUserName,
  getUsersEmails,
} from "../controllers/userController.js";
import { VerifyTokenAdmin } from "../../middleware/verifyToken.js";

const router = express.Router();

// get all users
router.get("/", VerifyTokenAdmin, getUsers);
router.get("/users_email", VerifyTokenAdmin, getUsersEmails);
// get user verify
router.get("/verify/:verifyLink", getUserVerify);

// get user by id
router.get("/:id", getUser);
// get user by userName
router.get("/client/:userName", getUserByUserName);
// update user password
router.put("/update-password/:id", updatePass);
// update user
router.put("/update-user/:userName", VerifyTokenAdmin, updateUser);
// delete user
router.delete("/delete-user/:id", VerifyTokenAdmin, deleteUser);

export default router;

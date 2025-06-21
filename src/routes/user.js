const express = require("express");
const router = express.Router();
const {
  getUser,
  updatePass,
  getUsers,
  getUserVerify,
  deleteUser,
  updateUser,
  getUserByUserName,
} = require("../controllers/userController");
const { VerifyTokenAdmin } = require("../../middleware/verifyToken");

// get all users
router.get("/", VerifyTokenAdmin, getUsers);
router.get("/verify/:verifyLink", getUserVerify);
// get user by id
router.get("/:id", getUser);
// get user by userName
router.get("/client/:userName", getUserByUserName);
// update user password
router.put("/update-password/:id", updatePass);
// update user
router.put("/update-user/:userName", updateUser);
// delete user
router.delete("/delete-user/:id", VerifyTokenAdmin, deleteUser);

module.exports = router;

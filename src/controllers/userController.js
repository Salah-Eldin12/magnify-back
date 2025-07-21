const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  UserSc,
  ValidateUpdatePass,
  ValidateUpdateData,
} = require("../models/UsersSc");
const { ProjectSc } = require("../models/ProjectSc");

/**
 * @desc get all users
 * @route /api/user/
 * @method GET
 * @access public
 */
const getUsers = asyncHandler(async (req, res) => {
  const usersSearch = await UserSc.find({ isAdmin: { $ne: true } })
    .sort({ fname: 1 })
    .populate("projectsData")
    .select("-password -createdAt -__v -updatedAt -verifyLink ");

  // user pagination
  const page = parseInt(req.query.page) || 1; // الصفحة الحالية
  const limit = parseInt(req.query.limit) || 50; // عدد العناصر لكل صفحة
  const skip = (page - 1) * limit;
  const totalUsers = await UserSc.countDocuments({ isAdmin: { $ne: true } });
  const users = await UserSc.find({ isAdmin: { $ne: true } })
    .skip(skip)
    .limit(limit)
    .sort({ fname: 1 })
    .populate("projectsData")
    .select("-password -createdAt -__v -updatedAt -verifyLink ");

  const totalPages = Math.ceil(totalUsers / limit);
  const next = page < totalPages ? page + 1 : null;
  const prev = page > 1 ? page - 1 : null;

  if (!users || users.length === 0) {
    return res.status(404).json({ message: "No users found" });
  }

  res.status(200).json({ users, next, prev, totalPages, page, usersSearch });
});

/**
 * @desc get verification link
 * @route /api/user/verify/:verifyLink
 * @method GET
 * @access public
 */
const getUserVerify = asyncHandler(async (req, res) => {
  let user = await UserSc.findOne({
    verifyLink: req.params.verifyLink,
  }).select("userName fname lname email verifyLink phone isAdmin verified");

  if (!user) {
    return res.status(400).send({ message: "User not found" });
  }

  jwt.verify(user.verifyLink, process.env.TOKEN_VERIFY_KEY, async (err) => {
    if (err && err.message === "jwt expired") {
      user.verifyLink = "";
      await user.save();
      return res.status(400).send({ message: "Link is expired" });
    } else {
      return res.status(200).send(user);
    }
  });
});

/**
 * @desc get
 * @route /api/user/:id
 * @method GET
 * @access public
 */
const getUser = asyncHandler(async (req, res) => {
  const verifyToken = jwt.verify(
    req.params.id,
    process.env.TOKEN_LOGIN_KEY,
    (err, data) => {
      if (err) {
        return res.status(400).send({ message: "Session ended" });
      } else {
        return data;
      }
    }
  );

  // Fetch the user excluding sensitive fields
  let user = await UserSc.findById(verifyToken.id)
    .select(
      "-password -createdAt -__v -updatedAt -verifyLink -otp -phone -verified"
    )
    .populate("projectsData");

  // Exclude sensitive fields in the response
  res.status(200).send(user);
});

/**
 * @desc get
 * @route /api/user/client/:userName
 * @method GET
 * @access public
 */
const getUserByUserName = asyncHandler(async (req, res) => {
  const token = req.headers.token;
  jwt.verify(token, process.env.TOKEN_LOGIN_KEY, (err) => {
    if (err && err.message === "jwt expired") {
      return res.status(400).send({ message: "Session ended" });
    }
  });
  let user = await UserSc.findOne({ userName: req.params.userName })
    .select("-password -createdAt -__v -updatedAt -verifyLink")
    .populate("projectsData");

  if (!user) {
    return res.status(400).send({ message: "User not found" });
  }

  res.status(200).send(user);
});

/**
 * @desc update password
 * @route /api/user/update-password/:id
 * @method PUT
 * @access private only the same user
 */
const updatePass = asyncHandler(async (req, res) => {
  jwt.verify(req.params.id, process.env.TOKEN_VERIFY_KEY, (err, data) => {
    if (err && err.message === "jwt expired") {
      return res.status(400).send({ message: "Session ended" });
    } else {
      return data;
    }
  });

  const { password } = req.body;

  const { error } = ValidateUpdatePass(req.body);
  if (error) {
    return res.status(404).json({ message: error.details[0].message });
  }
  const hashPass = await bcrypt.hash(password, 10);

  let user = await UserSc.findOneAndUpdate(
    { _id: req.params.id },
    {
      $set: {
        password: hashPass,
        verified: true,
        verifyLink: "",
      },
    },
    { new: true }
  );

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  res.status(200).json({ message: "password updated" });
});

/**
 * @desc update user
 * @route /api/user/update-user/:userName
 * @method PUT
 * @access private only the same user
 */
const updateUser = asyncHandler(async (req, res) => {
  const updateFields = { ...req.body };
  const { error } = ValidateUpdateData(req.body);
  const lang = req.headers.lang;
  const getText = (enText, arText) => {
    return lang === "en" || !lang ? enText : arText;
  };

  if (error) {
    return res.status(404).json({ message: error.details[0].message });
  }

  let user = await UserSc.findOne({ userName: req.params.userName });

  const checkEmail = await UserSc.find({
    email: updateFields.email,
    userName: { $ne: req.params.userName },
  }).countDocuments();

  if (checkEmail >= 1) {
    return res.status(400).send({
      message: getText("Email is already exist", "الايميل مستخدم بالفعل"),
    });
  }
  ////////

  // Check if email has changed
  if (user.email !== updateFields.email) {
    user.verified = false;
    user.password = "User1234";
  }

  user = await UserSc.findOneAndUpdate(
    { userName: req.params.userName },
    {
      $set: {
        ...updateFields,
        verified: user.verified,
        password: user.password,
      },
    },
    { new: true }
  );

  res.send({ user, message: getText("Data Saved", "تم حفظ التعديلات ") });
});

/**
 * @desc delete user
 * @route /api/user/delete-user/:id
 * @method DELETE
 * @access private only the same user
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await UserSc.findById(req.params.id);
  if (!user) {
    return res.status(200).send({ message: "User not found" });
  }

  const projects = user.projectsData;

  if (projects) {
    projects.map(async (project) => {
      let projectData = await ProjectSc.findById(project);
      if (projectData.owner.toString() === req.params.id) {
        await ProjectSc.findByIdAndDelete(project);
        await UserSc.updateMany(
          { projectsData: project },
          { $pull: { projectsData: project } }
        );
      } else {
        const emailIndex = projectData.accessUser.findIndex(
          (email) => email.email === user.email
        );

        if (emailIndex !== -1) projectData.accessUser.splice(emailIndex, 1);
        await projectData.save();
      }
    });
  }

  await UserSc.findByIdAndDelete(req.params.id);
  res.status(200).send({ message: "User deleted successfully" });
});

module.exports = {
  getUser,
  updatePass,
  getUsers,
  getUserVerify,
  updateUser,
  deleteUser,
  getUserByUserName,
};

const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const { UserSc } = require("../models/UsersSc");

/**
 * @desc verify email
 * @route /api/send-mail/send-verify-email
 * @method post
 * @access private only the same user
 */
const sendVerify = asyncHandler(async (req, res, next) => {
  const user = await UserSc.findOne({ email: req.body.email }).select(
    "fname verifyLink email"
  );

  const PassToken = jwt.sign({ id: user._id }, process.env.TOKEN_VERIFY_KEY);

  user.verifyLink = PassToken;
  await user.save();
  req.verifyLink = PassToken;
  req.userEmail = user.email;
  req.userName = user.fname;
  next();
});

/**
 * @desc reset password
 * @route /api/send-mail/send-reset-password
 * @method post
 * @access private only the same user
 */
const sendResetPassword = asyncHandler(async (req, res, next) => {
  const user = await UserSc.findOne({ email: req.body.email }).select(
    "verified fname email verifyLink"
  );
  const lang = req.headers.lang;
  const getText = (enText, arText) => {
    return lang === "en" || !lang ? enText : arText;
  };

  if (!user) {
    return res.status(400).json({
      message: getText("Email not found", "البريد الالكتروني غير موجود"),
    });
  }
  if (!user.verified) {
    return res
      .status(400)
      .json({ message: getText("User not verified", "يجب تفعيل الحساب اولا") });
  }
  // create token expird in 20m
  const passToken = jwt.sign({ id: user._id }, process.env.TOKEN_VERIFY_KEY, {
    expiresIn: "10m",
  });

  user.verifyLink = passToken;
  await user.save();
  req.verifyLink = passToken;
  req.userEmail = user.email;
  req.userName = user.fname;
  next();
});

module.exports = { sendVerify, sendResetPassword };

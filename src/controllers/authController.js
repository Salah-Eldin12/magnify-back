const asyncHandler = require("express-async-handler");
const jwi = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { UserReport } = require("../models/UserReport");
const twilio = require("twilio");

const {
  UserSc,
  ValidatePhoneLogin,
  ValidateEmailLogin,
  ValidateCreateUser,
} = require("../models/UsersSc");

// Twilio configuration
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * @desc creates a new user
 * @route /api/auth/create-user
 * @method POST
 * @access private only admin
 */
const createUser = asyncHandler(async (req, res) => {
  const { email, userName } = req.body;
  const { error } = ValidateCreateUser(req.body);

  const lang = req.headers.lang;
  const getText = (enText, arText) => {
    return lang === "en" || !lang ? enText : arText;
  };

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  let user = await UserSc.findOne({ email });
  if (user) {
    return res.status(400).json({
      message: getText(
        "Email already registered",
        "البريد الالكتروني مستخدم بالفعل"
      ),
    });
  }
  user = await UserSc.findOne({ userName });
  if (user) {
    return res.status(400).json({
      message: getText(
        "User Name already taken",
        "تم اختيار اسم المستخدم من قبل"
      ),
    });
  }

  user = new UserSc(req.body);

  const { password, ...other } = user._doc;
  await user.save();
  res.status(200).json({
    ...other,
    message: getText("User Created Successfully", "تم انشاء التمستخدم بنجاح"),
  });
});

/**
 * @desc email login
 * @route /api/auth/email-login
 * @method POST
 * @access public
 */
const loginWithEmail = asyncHandler(async (req, res) => {
  const { error } = ValidateEmailLogin(req.body);

  const lang = req.headers.lang;
  const getText = (enText, arText) => {
    return lang === "en" || !lang ? enText : arText;
  };

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const { email } = req.body;
  // email checker
  let user = await UserSc.findOne({ email });
  if (!user) {
    return res.status(400).json({
      message: getText("Email not registered", "البريد الالكتروني غير مسجل"),
    });
  }
  // password changed
  const verified = user.verified;
  // password checker
  const passCheck = await bcrypt.compare(req.body.password, user.password);
  if (verified) {
    if (!passCheck) {
      return res.status(400).json({
        message: getText(
          "Email or password is incorrect",
          "البريد الالكتروني او كلمة المرور غير صحيحة"
        ),
      });
    }
  } else if (req.body.password !== user.password) {
    return res.status(400).json({
      message: getText(
        "Email or password is incorrect",
        "البريد الالكتروني او كلمة المرور غير صحيحة"
      ),
    });
  }
  const token = jwi.sign({ id: user._id }, process.env.TOKEN_LOGIN_KEY, {
    expiresIn: "10h",
  });
  const { password, ...other } = user._doc;
  res.status(200).json({ token, user: { ...other } });
});

/**
 * @desc phone login
 * @route /api/auth/phone-login
 * @method POST
 * @access public
 */
const loginWithPhone = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  const { error } = ValidatePhoneLogin({ phone });

  const lang = req.headers.lang;
  const getText = (enText, arText) => {
    return lang === "en" || !lang ? enText : arText;
  };

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // email checker
  let user = await UserSc.findOne({ phone }).select("-password");

  if (!user) {
    return res.status(400).send({
      message: getText("phone number not exist", "رقم الهاتف غير مسجل"),
    });
  }
  // Generates a 6-digit OTP
  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };
  const otpGenerator = generateOTP();

  twilioClient.verify.v2
    .services(process.env.TWILIO_SERVICE_SID)
    .verifications.create({
      to: `+${phone}`,
      channel: "sms",
      customCode: otpGenerator,
    })
    .then(async () => {
      const PassToken = jwi.sign(
        { id: user._id },
        process.env.TOKEN_VERIFY_KEY
      );
      user.verifyLink = PassToken;
      user.otp = otpGenerator;
      await user.save();

      res.status(200).json({
        message: "OTP sent successfully",
        verifyLink: user.verifyLink,
      });
    })
    .catch((error) => {
      console.error(error);
      return res.status(400).send({
        message: getText(
          "There is a problem with this service now, please try again later",
          "يوجد مشكلة في الخدمة الان, يرجى المحاولة لاحقا"
        ),
      });
    });
});

/**
 * @desc verify otp
 * @route /api/auth/phone-login/verify
 * @method POST
 * @access public
 */
const VerifyOtp = asyncHandler(async (req, res) => {
  const { phoneNumber, otpVal } = req.body;
  const lang = req.headers.lang;
  const getText = (enText, arText) => {
    return lang === "en" || !lang ? enText : arText;
  };
  let user = await UserSc.findOne({ phone: phoneNumber }).select("-password");

  if (Number(otpVal) !== user.otp) {
    return res
      .status(400)
      .send({ message: getText("Invalid OTP", "الرمز غير صحيح") });
  }

  twilioClient.verify.v2
    .services(process.env.TWILIO_SERVICE_SID)
    .verificationChecks.create({
      code: otpVal,
      to: `+${phoneNumber}`,
    })
    .then(async () => {
      const token = jwi.sign({ id: user._id }, process.env.TOKEN_LOGIN_KEY, {
        expiresIn: "1d",
      });
      user.verifyLink = "";
      user.otp = "";

      await user.save();
      res.status(200).send({ message: "verified", token, user });
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

/**
 * @desc logout time spent
 * @route /api/auth/report
 * @method POST
 * @access public
 */
const Report = asyncHandler(async (req, res) => {
  const userReport = new UserReport(req.body);
  await userReport.save();
  res.status(200).json({ message: "done" });
});

module.exports = {
  createUser,
  loginWithEmail,
  Report,
  loginWithPhone,
  VerifyOtp,
};

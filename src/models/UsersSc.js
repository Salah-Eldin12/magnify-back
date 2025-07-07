const mongoose = require("mongoose");
const joi = require("joi");
const valid = require("validator");

const NewUserSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      minLength: 3,
      maxLength: 30,
      required: true,
      trim: true,
      unique: true,
    },
    fname: {
      type: String,
      minLength: 3,
      maxLength: 15,
      required: true,
      trim: true,
    },
    lname: {
      type: String,
      minLength: 3,
      maxLength: 15,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      required: true,
      trim: true,
      unique: true,
      match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      validate: {
        validator: (val) => {
          return valid.isEmail(val);
        },
        message: `Email not valid`,
      },
    },
    password: {
      type: String,
      minLength: 8,
      maxLength: 16,
      trim: true,
      default: "User1234",
    },
    phone: { type: Number },
    otp: { type: Number, minLength: 6, maxLength: 6 },
    verified: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    verifyLink: {
      type: String,
      trim: true,
    },
    projectsData: [{ type: mongoose.Schema.Types.ObjectId, ref: "project" }],
  },
  { timestamps: true }
);

const UserSc = mongoose.model("usersData", NewUserSchema);

const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

const userValidate = {
  userName: joi.string().trim().required().min(3).max(30).messages({
    "string.min": `User Name must be at least 3 characters`,
    "any.required": "User Name is required",
  }),
  fname: joi.string().trim().required().min(3).max(15).messages({
    "string.min": `First Name must be at least 3 characters`,
    "any.required": "First Name is required",
  }),
  lname: joi.string().trim().required().min(3).max(15).messages({
    "string.min": `Last Name must be at least 3 characters`,
    "any.required": "Last Name is required",
  }),
  email: joi.string().trim().required().lowercase().regex(emailRegex).messages({
    "any.required": "Email is required",
    "string.pattern.base": "Invalid E-mail",
  }),
  phone: joi.number().integer(),
  projectsData: joi.array().items(),
  isAdmin: joi.boolean(),
};

const ValidateCreateUser = (obj) => {
  const schema = joi.object().keys(userValidate);
  return schema.validate(obj);
};

const ValidateEmailLogin = (obj) => {
  const schema = joi.object({
    email: joi.string().trim().required().regex(emailRegex).messages({
      "any.required": "Email is required",
      "string.pattern.base": "Invalid email",
    }),
    password: joi.string().trim().min(8).max(16),
  });
  return schema.validate(obj);
};

const ValidatePhoneLogin = (obj) => {
  const schema = joi.object({
    phone: joi.string().trim().required().messages({
      "any.required": "phone number is required",
    }),
  });
  return schema.validate(obj);
};

const ValidateUpdatePass = (obj) => {
  const schema = joi.object({
    password: joi
      .string()
      .trim()
      .min(8)
      .max(16)
      .required()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d[\]{};:=<>_+^#$@!%*?&]{8,16}$/
      )
      .messages({
        "string.min": `Password must be at least 8 characters`,
        "any.required": "Password is required",
        "string.pattern.base": "Password is weak; choose a stronger one",
      }),
  });
  return schema.validate(obj);
};

const ValidateUpdateData = (obj) => {
  const schema = joi.object().keys(userValidate);
  return schema.validate(obj);
};

module.exports = {
  UserSc,
  ValidateCreateUser,
  ValidateEmailLogin,
  ValidatePhoneLogin,
  ValidateUpdatePass,
  ValidateUpdateData,
};

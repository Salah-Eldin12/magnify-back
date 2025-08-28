import mongoose from "mongoose";
import Joi from "joi";
import valid from "validator";

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
  userName: Joi.string().trim().required().min(3).max(30).messages({
    "string.min": `User Name must be at least 3 characters`,
    "any.required": "User Name is required",
  }),
  fname: Joi.string().trim().required().min(3).max(15).messages({
    "string.min": `First Name must be at least 3 characters`,
    "any.required": "First Name is required",
  }),
  lname: Joi.string().trim().required().min(3).max(15).messages({
    "string.min": `Last Name must be at least 3 characters`,
    "any.required": "Last Name is required",
  }),
  email: Joi.string()
    .trim()
    .required()
    .lowercase()
    .pattern(emailRegex)
    .messages({
      "any.required": "Email is required",
      "string.pattern.base": "Invalid E-mail",
    }),
  phone: Joi.number().integer(),
  projectsData: Joi.array().items(),
  isAdmin: Joi.boolean(),
};

const ValidateCreateUser = (obj) => {
  const schema = Joi.object().keys(userValidate);
  return schema.validate(obj);
};

const ValidateEmailLogin = (obj) => {
  const schema = Joi.object({
    email: Joi.string().trim().required().pattern(emailRegex).messages({
      "any.required": "Email is required",
      "string.pattern.base": "Invalid email",
    }),
    password: Joi.string().trim().min(8).max(16),
  });
  return schema.validate(obj);
};

const ValidatePhoneLogin = (obj) => {
  const schema = Joi.object({
    phone: Joi.string().trim().required().messages({
      "any.required": "phone number is required",
    }),
  });
  return schema.validate(obj);
};

const ValidateUpdatePass = (obj) => {
  const schema = Joi.object({
    password: Joi.string()
      .trim()
      .min(8)
      .max(16)
      .required()
      .pattern(
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
  const schema = Joi.object().keys(userValidate);
  return schema.validate(obj);
};

export {
  UserSc,
  ValidateCreateUser,
  ValidateEmailLogin,
  ValidatePhoneLogin,
  ValidateUpdatePass,
  ValidateUpdateData,
};

const mongoose = require("mongoose");
const Joi = require("joi");
const valid = require("validator");

// Email regex pattern
const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

// Define Mongoose Schema
const ProjectSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "usersData" },
    date: { type: Date, trim: true },
    subDate: [{ type: Date, trim: true }],
    number: { type: String, trim: true },
    name: { type: String, trim: true },
    location: { type: String, trim: true },
    area: { type: String, trim: true },
    height: { type: String },
    consultant: { type: String, trim: true },
    duration: { type: String },
    img: {
      name: { type: String },
      path: { type: String },
    },
    status: {
      type: String,
      default: "done",
      enum: ["done", "in-progress", ""],
    },
    type: {
      type: String,
      enum: ["commercial", "residential", "industrial", "infrastructure", ""],
    },
    accessUser: [
      {
        email: {
          type: String,
          lowercase: true,
          required: true,
          trim: true,
          match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          validate: {
            validator: (val) => {
              return valid.isEmail(val);
            },
            message: `Email not valid`,
          },
        },
      },
    ],
  },
  { timestamps: true }
);

// Compile Mongoose Model
const ProjectSc = mongoose.model("project", ProjectSchema);

// Joi Validation Schema
const projectValidationSchema = Joi.object({
  owner: Joi.string(),
  number: Joi.string().label("Project Number").allow(""),
  name: Joi.string().label("Project Name").allow(""),
  location: Joi.string().label("Project Location").allow(""),
  status: Joi.string()
    .valid("done", "in-progress", "")
    .label("Project Status")
    .allow(""),
  type: Joi.string()
    .valid("commercial", "residential", "industrial", "infrastructure", "")
    .label("Project Type")
    .allow(""),
  area: Joi.string().label("Project Area").allow(""),
  height: Joi.string().label("Project Height").allow(""),
  consultant: Joi.string().label("Consultant").allow(""),
  duration: Joi.string().label("Project Duration").allow(""),
  date: Joi.date().label("Project Date").allow(""),
  subDate: Joi.array().items(Joi.date().label("Project Date").allow("")),
  img: Joi.object({
    name: Joi.string().label("Image Name").allow(""),
    path: Joi.string().label("Image Path").allow(""),
  }).label("Project Image"),
  accessUser: Joi.array().items(
    Joi.object({
      _id: Joi.string(),
      email: Joi.string()
        .pattern(emailRegex)
        .label("Email")
        .messages({
          "string.pattern.base": "Invalid E-mail format",
        })
        .allow(""),
    })
  ),
});

// Validate Project Data
const validateProjectData = (data) => {
  return projectValidationSchema.validate(data, { abortEarly: false });
};

module.exports = {
  ProjectSc,
  validateProjectData,
};

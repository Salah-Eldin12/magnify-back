const mongoose = require("mongoose");

const userReport = new mongoose.Schema({
  userName: { type: String },
  email: { type: String },
  date: { type: String },
  timeSpent: { type: String },
});

const UserReport = mongoose.model("userReport", userReport);
module.exports = { UserReport };

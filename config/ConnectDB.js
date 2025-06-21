const moogose = require("mongoose");

function ConnectDB() {
  try {
    moogose.connect(process.env.MONGO_URI);
    console.log("connect to database");
  } catch (error) {
    console.log(error);
  }
}

module.exports = ConnectDB;

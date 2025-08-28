import mongoose from "mongoose";

function ConnectDB() {
  try {
    mongoose.connect(process.env.MONGO_URI);
    console.log("connect to database");
  } catch (error) {
    console.log(error);
  }
}

export default ConnectDB;

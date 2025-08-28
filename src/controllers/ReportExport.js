// import asyncHandler from "express-async-handler";
// import { UserReport } from "../models/UserReport.js";
// import fastCsv from "fast-csv";
// import fs from "fs";

// const getReport = asyncHandler(async (req, res) => {
//   const Report = await UserReport.find().select(
//     "userName email date timeSpent -_id"
//   );
//   const csvStream = fastCsv.format({ headers: true });
//   const writableStream = fs.createWriteStream("Report.csv");

//   writableStream.on("finish", () => {
//     console.log("write to report successfully");
//     res.download("Report.csv", () => {
//       res.status(200).json({ message: "Report downloaded successfully" });
//     });
//   });

//   csvStream.pipe(writableStream);
//   Report.forEach((item) => csvStream.write(item));
//   csvStream.end();
// });

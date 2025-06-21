const asynchandler = require("express-async-handler");
const { UserReport } = require("../models/UserReport");
const fastCsv = require("fast-csv");
const fs = require("fs");
const csv = fs.createWriteStream("Report.csv");


const getReport = asynchandler(async (req, res) => {
  const Report = await UserReport.find().select(
    "userName email date timeSpent -_id"
  );
  fastCsv
    .write(Report, { headers: true })
    .on("end", () => {
      console.log("write to report successfully");
      res.download("Report.csv", () => {
        res.status(200).json({ message: "Report downloaded successfully" });
      });
    })
    .pipe(csv);
});

module.exports = getReport;

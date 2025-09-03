// middleware/CancelUpload.js
import fs from "fs";

export default function CancelUpload(req, res, next) {
  req.on("aborted", () => {
    // Multer بيحط المسار في req.file أو req.files
    if (req.file && req.file.path) {
      const parentDir = req.file.destination;
      console.log(parentDir);
      // ده اللي انشأته Multer
      fs.rm(parentDir, { recursive: true, force: true }, (err) => {
        if (err) {
          console.error("❌ Error deleting canceled folder:", err);
        } else {
          console.log("🗑️ Upload canceled, folder removed:", parentDir);
        }
      });
    }

    if (req.files && req.files.length > 0) {
      const parentDir = req.files[0].destination;
      fs.rm(parentDir, { recursive: true, force: true }, (err) => {
        if (err) {
          console.error("❌ Error deleting canceled folder:", err);
        } else {
          console.log("🗑️ Upload canceled, folder removed:", parentDir);
        }
      });
    }
  });

  next();
}

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./config/ConnectDB.js";
// import getReport from "./src/controllers/ReportExport.js";
import path from "path";
import uploadFilesRoutes from "./src/routes/uploadFiles.js";
import authRoutes from "./src/routes/auth.js";
import userRoutes from "./src/routes/user.js";
import projectRoutes from "./src/routes/project.js";
import pilotProjectRoutes from "./src/routes/pilotProject.js";
import sendMailsRoutes from "./src/routes/sendMails.js";
import projectImgRoutes from "./src/routes/ProjectImg.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to the database
connectDB();

// Middleware
const app = express();

app.use(express.json({ extended: true, limit: "10gb" }));
app.use(express.urlencoded({ extended: true, limit: "10gb" }));
app.use(
  cors({
    origin: process.env.ALLOWED_IFRAME_HOSTS.split(","),
    credentials: true,
    methods: "GET, POST, DELETE, PUT",
    allowedHeaders:
      "Content-Type, Authorization, token, isOwner, user, Access-Control-Allow-Origin,lang",
  })
);
app.use(
  "/api/public",
  express.static(path.join(__dirname, "public"), { maxAge: "1y" })
);

// Routes
app.get("/", (req, res) => {
  res.status(200).send("Hello World! Magnify Portal API is running.");
});
// app.get("/api/report", getReport);
app.use("/api/upload-files", uploadFilesRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/project", projectRoutes);
app.use("/api/pilot_project", pilotProjectRoutes);
app.use("/api/send-mail", sendMailsRoutes);
app.use("/api/upload-project-img", projectImgRoutes);

// Start the server
const port = process.env.PORT || 8001;

app.listen(port, (err) => {
  if (err) {
    console.error("Error starting server:", err);
  } else {
    console.log(`Server started on port ${port}`);
  }
});

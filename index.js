const express = require("express");
const cors = require("cors");
const connectDB = require("./config/ConnectDB");
const app = express();
const getReport = require("./src/controllers/ReportExport");
const path = require("path");

// Connect to the database
require("dotenv").config();
connectDB();

// Middleware
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
app.get("/api/report", getReport);
app.use("/api/upload-files", require("./src/routes/uploadFiles"));
app.use("/api/auth", require("./src/routes/auth"));
app.use("/api/user", require("./src/routes/user"));
app.use("/api/project", require("./src/routes/project"));
app.use("/api/send-mail", require("./src/routes/sendMails"));
app.use("/api/upload-project-img", require("./src/routes/ProjectImg"));

// Start the server
const port = process.env.PORT || 8001;
app.listen(port, (err) => {
  if (err) {
    console.error("Error starting server:", err);
  } else {
    console.log(`Server started on port ${port}`);
  }
});

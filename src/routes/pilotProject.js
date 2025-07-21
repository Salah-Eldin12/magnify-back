const express = require("express");
const router = express.Router();
const { VerifyTokenAdmin } = require("../../middleware/verifyToken");
const { UploadPilotProject } = require("../../middleware/UploadPilotProject");
const {
  createPilotProject,
  deletePilotProject,
  getPilotProjects,
  getPilotProject,
} = require("../controllers/pilotProjectController");

// upload pilot project
router.post(
  "/create-project",
  VerifyTokenAdmin,
  UploadPilotProject.single("pilot-project-folder"),
  createPilotProject
);
// get pilot project by name
router.get("/:name", getPilotProject);
// get all pilot project
router.get("/", VerifyTokenAdmin, getPilotProjects);
// delete pilot project
router.delete("/:name", VerifyTokenAdmin, deletePilotProject);

module.exports = router;

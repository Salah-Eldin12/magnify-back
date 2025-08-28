import express from "express";
import { VerifyTokenAdmin } from "../../middleware/verifyToken.js";
import { UploadPilotProject } from "../../middleware/UploadPilotProject.js";
import {
  createPilotProject,
  deletePilotProject,
  getPilotProjects,
  getPilotProject,
} from "../controllers/pilotProjectController.js";

const router = express.Router();

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

export default router;

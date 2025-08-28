import express from "express";
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  deleteAccess,
  addAccess,
  getLastAddedProjects,
  getProjectByName,
  UploadFolder,
  getProjectFolder,
} from "../controllers/projectController.js";
import { UploadProject } from "../../middleware/UploadProjectFolder.js";
import { VerifyTokenAdmin } from "../../middleware/verifyToken.js";
import { SendEmail } from "../../middleware/SendEmail.js";

const router = express.Router();

// create project
router.post("/:projectOwner", VerifyTokenAdmin, createProject);
//  get all projects
router.get("/", VerifyTokenAdmin, getProjects);
//  get all last added projects
router.get("/last-added", VerifyTokenAdmin, getLastAddedProjects);
// update project
router.put("/:id", VerifyTokenAdmin, updateProject);
// upload project files
router.post(
  "/upload-folder/:id",
  VerifyTokenAdmin,
  UploadProject.single("project-folder"),
  SendEmail,
  UploadFolder
);
// add and delete project access users
router.put("/add-access/:id", VerifyTokenAdmin, addAccess);
router.put("/delete-access/:id", VerifyTokenAdmin, deleteAccess);
// delete project
router.delete("/:id", VerifyTokenAdmin, deleteProject);
// get project by id
router.get("/:id", getProject);
// get project by project name
router.get("/projectName/:name", getProjectByName);
// get project folder
router.get("/project-folder/:folder", getProjectFolder);

export default router;

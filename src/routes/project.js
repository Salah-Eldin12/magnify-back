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
  CancelUpload,
  deleteSubProject,
  emailAccess,
} from "../controllers/projectController.js";
import { UploadProjectFiles } from "../../middleware/UploadProjectFolder.js";
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
  UploadProjectFiles,
  UploadFolder,
  SendEmail
);
// add and delete project access users
router.put("/add-access/:id", VerifyTokenAdmin, addAccess);
router.put("/delete-access/:id", VerifyTokenAdmin, deleteAccess);
router.get("/email-access/:id", VerifyTokenAdmin, emailAccess);

// delete project
router.delete("/:id", VerifyTokenAdmin, deleteProject);
// delete sub project
router.delete("/delete-sub-project/:id", VerifyTokenAdmin, deleteSubProject);
// cancel upload
router.delete("/cancel-upload/:id", VerifyTokenAdmin, CancelUpload);
// get project by id
router.get("/:id", getProject);
// get project by project name
router.get("/projectName/:name", getProjectByName);
// get project folder
router.get("/project-folder/:folder", getProjectFolder);

export default router;

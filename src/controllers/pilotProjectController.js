import asyncHandler from "express-async-handler";
import extract from "extract-zip";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import env from "../../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const public_project_folder = path.join(
  __dirname,
  "..",
  "..",
  env.UPLOAD_PROJECTS_PATH
);

const pilot_project_path = path.join(public_project_folder, "pilot_projects");

if (!fs.existsSync(pilot_project_path)) {
  fs.mkdirSync(pilot_project_path, { recursive: true });
}

/**
 * @desc create pilot project
 * @route /api/pilot_project/
 * @method POST
 * @access private only admin
 */
const createPilotProject = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: "Upload failed" });
  }

  const projectFolder = path.join(req.file.path, "..");

  // extract the zip file
  try {
    await extract(req.file.path, { dir: projectFolder });
  } catch (err) {
    return res.status(400).send({ message: "cannot extract the file" });
  }
  // remove zip file after extract
  fs.rmSync(req.file.path);

  // save project in db

  return res.status(200).send({ message: "file uploaded and extracted" });
});

/**
 * @desc get all pilot projects
 * @route /api/pilot_project
 * @method GET
 * @access private only admin
 */
const getPilotProjects = asyncHandler(async (req, res) => {
  const pilot_projects = fs.readdirSync(pilot_project_path);

  if (!pilot_projects || pilot_projects.length === 0) {
    return res.status(404).send({ message: "No pilot projects added yet" });
  }

  const projects = [...pilot_projects];

  return res.status(200).send({ projects: projects });
});
/**
 * @desc get pilot project by name
 * @route /api/pilot_project
 * @method GET
 * @access private only admin
 */
const getPilotProject = asyncHandler(async (req, res) => {
  const { name } = req.params;

  const project = fs.existsSync(path.join(pilot_project_path, name));
  if (!project) {
    return res.status(404).send("No project found with this name");
  }
  return res
    .status(200)
    .send({ message: `project ${name} is loaded successfully` });
});

/**
 * @desc delete pilot project by id
 * @route /api/pilot_project/:name
 * @method DELETE
 * @access private only admin
 */
const deletePilotProject = asyncHandler(async (req, res) => {
  const { name } = req.params;
  try {
    const projectPath = path.join(pilot_project_path, name);

    if (!fs.existsSync(projectPath)) {
      return res.status(404).send("Project no found");
    }

    fs.rmSync(projectPath, { recursive: true, force: true });
    return res.status(200).send("Project delete successfully");
  } catch (error) {
    return res.status(404).send("delete project error " + error);
  }
});

export {
  createPilotProject,
  deletePilotProject,
  getPilotProjects,
  getPilotProject,
};

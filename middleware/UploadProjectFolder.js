import multer from "multer";
import path from "path";
import fs from "fs";
import { ProjectSc } from "../src/models/ProjectSc.js";
import { fileURLToPath } from "url";
import env from "../config/env.js";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadFolder = path.join(__dirname, env.UPLOAD_PROJECTS_PATH);
const allowedTypes = ["application/zip", "application/x-zip-compressed"];

const UploadProjectStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const lang = req.headers.lang;
    const getText = (enText, arText) => {
      return lang === "en" || !lang ? enText : arText;
    };

    try {
      const projectID = req.params.id;
      const projectDate = req.query.date || "";
      const projectType = req.query.projectType;

      if (!mongoose.Types.ObjectId.isValid(projectID)) {
        return cb(new Error("Invalid project ID"), false);
      }

      const project = await ProjectSc.findById(projectID).populate("owner");
      if (!project)
        return cb(
          new Error(getText("Project not found", "المشروع غير موجود")),
          false
        );

      // create new project main folder
      const projectOwner = project.owner.userName;
      const projectName = project.name;
      const projectMainFolder = path.join(
        uploadFolder,
        projectOwner,
        projectName
      );
      // save the main folder in project db url
      project.url = projectMainFolder;
      await project.save();

      if (projectType === "date") {
        await ProjectSc.findByIdAndUpdate(projectID, {
          $unset: { subDate: 1 },
          $set: { status: "done", date: projectDate },
        });
        if (fs.existsSync(projectMainFolder)) {
          fs.rmSync(projectMainFolder, { recursive: true, force: true });
        }
      } else {
        if (fs.existsSync(projectMainFolder) && project.status === "done") {
          fs.rmSync(projectMainFolder, { recursive: true, force: true });
        }

        const existingProject = await ProjectSc.findById(projectID);
        const DateExist = existingProject.subDate?.some(
          (date) => new Date(date).toISOString().split("T")[0] === projectDate
        );
        if (DateExist) {
          return cb(
            new Error(
              getText(
                "Project date already exist, change the date and ty again",
                " تاريخ المشروع موجود بالفعل, قم بتغير تاريخ المشروع وجرب مجددا"
              )
            ),
            false
          );
        }
        const updateData = {
          $unset: { date: 1 },
          $set: { status: "in-progress" },
        };

        if (!DateExist && projectDate) {
          updateData.$push = { subDate: projectDate };
        }

        await ProjectSc.findByIdAndUpdate(projectID, updateData);
      }
      // check if project has sub date to create new folder
      const safeDate = projectDate
        ? new Date(projectDate).toISOString().split("T")[0]
        : "";
      const hasSub = projectType === "date" ? "" : safeDate;
      // create new folder for project
      const newFolder = path.join(
        uploadFolder,
        projectOwner,
        projectName,
        hasSub
      );
      if (!fs.existsSync(newFolder))
        fs.mkdirSync(newFolder, { recursive: true });

      // req variables for send email
      const ToEmail = project.owner.email;
      if (project.accessUser?.length >= 1) {
        req.CcEmails = project.accessUser.map((user) => user.email);
      }

      req.ToEmail = ToEmail;
      req.userName = projectOwner;
      req.projectName = projectName;
      req.projectDate = projectDate;

      cb(null, newFolder);
    } catch (err) {
      cb(err, false);
    }
  },

  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now();
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const UploadProjectMulter = multer({
  storage: UploadProjectStorage,
  fileFilter: (req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("File type not supported"), false);
    }
    cb(null, true);
  },
});

const UploadProjectFiles = (req, res, next) => {
  UploadProjectMulter.single("project-folder")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    next();
  });
};

export { UploadProjectFiles };

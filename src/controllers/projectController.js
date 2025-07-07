const asyncHandler = require("express-async-handler");
const { ProjectSc, validateProjectData } = require("../models/ProjectSc");
const { UserSc } = require("../models/UsersSc");
const extract = require("extract-zip");
const path = require("path");
const fs = require("fs");

/**
 * @desc get all projects
 * @route /api/project/
 * @method GET
 * @access public
 */
const getProjects = asyncHandler(async (req, res) => {
  const projects = await ProjectSc.find();
  res.status(200).send(projects);
});
/**
 * @desc get all projects
 * @route /api/project/last-added
 * @method GET
 * @access public
 */
const getLastAddedProjects = asyncHandler(async (req, res) => {
  const projects = await ProjectSc.find().sort({ _id: -1 }).limit(10);
  res.status(200).send(projects);
});

/**
 * @desc get project by id
 * @route /api/project/:id
 * @method GET
 * @access public
 */
const getProject = asyncHandler(async (req, res) => {
  const project = await ProjectSc.findById(req.params.id)
    .populate("owner", "userName")
    .select(" -__v -createdAt -updatedAt -_id -owner");

  if (!project) {
    return res.status(400).send({ message: "Project not found" });
  }
  res.status(200).send(project);
});

/**
 * @desc get project by id
 * @route /api/project/projectName/:projectName
 * @method GET
 * @access public
 */
const getProjectByName = asyncHandler(async (req, res) => {
  const projects = await ProjectSc.find({
    name: { $regex: req.params.name, $options: "i" },
  });

  if (projects.length === 0) {
    return res
      .status(404)
      .send({ message: "No projects found with the given name" });
  }

  res.status(200).send(projects);
});

/**
 * @desc get project folder
 * @route /api/project/project-folder/:folder
 * @method GET
 * @access public
 */
const getProjectFolder = asyncHandler(async (req, res) => {
  const mainFolder = path
    .join(
      __dirname,
      "..",
      process.env.UPLOAD_PROJECTS_PATH + "/" + req.params.folder
    )
    .replaceAll("|", "/");

    
  console.log("mainFolder", mainFolder);

  const folderExist = fs.existsSync(mainFolder);
  if (folderExist) {
    res.status(200).send("folder exist");
  } else {
    res.status(404).send("project not found");
  }
});

/**
 * @desc create project
 * @route /api/project/:projectOwner
 * @method POST
 * @access public
 */
const createProject = asyncHandler(async (req, res) => {
  const userID = req.params.projectOwner;

  const projectData = { ...req.body, owner: userID };
  const { error } = validateProjectData(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // check for user
  const user = await UserSc.findById(userID).select("projectsData");
  const project = new ProjectSc(projectData);
  user.projectsData.push(project);

  await project.save();
  await user.save();
  res.status(200).json({ project, message: "Project Created Successfully" });
});

/**
 * @desc update project
 * @route /api/project/:id
 * @method PUT
 * @access public
 */
const updateProject = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { error } = validateProjectData(req.body);
  const lang = req.headers.lang;
  const getText = (enText, arText) => {
    return lang === "en" || !lang ? enText : arText;
  };

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  let project = await ProjectSc.findById(req.params.id);
  if (!project) {
    return res
      .status(400)
      .send({ message: getText("Project not found", "المشورع غير موجود") });
  }
  // check for project no
  const checkProject = await ProjectSc.find({
    name: req.body.name,
    _id: { $ne: project._id },
  }).countDocuments();

  if (checkProject >= 1) {
    return res.status(400).json({
      message: getText(
        "Project with same name is exist",
        "اسم المشروع مستخدم من قبل"
      ),
    });
  }

  if (status === "done") {
    await ProjectSc.findByIdAndUpdate(req.params.id, {
      $unset: { subDate: 1 },
    });
  } else {
    await ProjectSc.findByIdAndUpdate(req.params.id, {
      $unset: { date: 1 },
    });
  }

  const { accessUser, ...other } = req.body;
  // Update the project
  project = await ProjectSc.findByIdAndUpdate(
    req.params.id,
    { $set: { ...other } },
    { new: true }
  );

  res.status(200).send({
    message: getText(
      "Project updated successfully",
      "تم تحديث بيانات المشروع بنجاح"
    ),
    project,
  });
});
/**
 * @desc update project
 * @route /api/project/upload-folder/:id
 * @method POST
 * @access public
 */
const UploadFolder = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: "Upload failed" });
  }

  const projectFolder = path.join(req.file.path, "..");

  // // extract the zip file
  await extract(req.file.path, { dir: projectFolder }, (err) => {
    res.status(400).send({ message: "cannot extract the file" });
  });
  // // remove zip file after extract
  fs.rmSync(req.file.path);

  res.status(200).send({ message: "file uploaded and extracted" });
});

/**
 * @desc add access to project
 * @route /api/project/add-access/:id
 * @method PUT
 * @access public
 */
const addAccess = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const lang = req.headers.lang;
  const getText = (enText, arText) => {
    return lang === "en" || !lang ? enText : arText;
  };

  const project = await ProjectSc.findById(req.params.id);
  const user = await UserSc.findOne({ email }).select("projectsData");

  if (!project) {
    return res.status(400).send({
      message: getText("Project not found", "لم يتم العثور علي المشروع"),
    });
  }
  if (!user) {
    return res.status(400).send({
      message: getText("User not found", "لم يتم العثور علي المستخدم"),
    });
  }

  if (project.owner.toString() === user._id.toString()) {
    return res
      .status(400)
      .send({ message: getText("You are the owner", "انت مالك المشروع") });
  }

  const projectExist = user.projectsData.includes(req.params.id);

  if (projectExist) {
    return res.status(400).send({
      message: getText(
        "The user has access already",
        "لدي المستخدم الصلاحية بالفعل"
      ),
    });
  }
  user.projectsData.push(project);
  project.accessUser.push({ email });

  await user.save();
  await project.save();

  res.status(200).send({
    message: getText("Access added to user", "تم منح الصلاحية للمستخدم"),
    accessUser: project.accessUser,
  });
});

/**
 * @desc add access to project
 * @route /api/project/add-access/:id
 * @method PUT
 * @access public
 */
const deleteAccess = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const project = await ProjectSc.findById(req.params.id);
  const user = await UserSc.findOne({ email }).select("projectsData email");

  if (!project) {
    return res.status(400).send({ message: "Project not found" });
  }
  if (!user) {
    return res.status(400).send({ message: "User not found" });
  }

  const projectIndex = user.projectsData.findIndex(
    (proj) => proj.toString() === req.params.id
  );

  if (projectIndex === -1) {
    return res
      .status(400)
      .send({ message: "User not has access in this project" });
  }

  user.projectsData.splice(projectIndex, 1);

  const emailIndex = project.accessUser.findIndex(
    (email) => email.email === user.email
  );

  if (emailIndex === -1) {
    return res
      .status(400)
      .send({ message: "Email not has the access to this project" });
  }

  project.accessUser.splice(emailIndex, 1);

  await user.save();
  await project.save();

  res.status(200).send({
    message: "Access removed from this user",
    accessUser: project.accessUser,
  });
});

/**
 * @desc delete project
 * @route /api/project/:id
 * @method DELETE
 * @access public
 */
const deleteProject = asyncHandler(async (req, res) => {
  const { id } = req.params; // Project ID
  const userID = req.headers.user; // User ID
  const isOwner = req.headers.isowner; // Ownership flag from the client (validate carefully)

  // Fetch the project
  const project = await ProjectSc.findById(id);
  if (!project) {
    return res.status(404).send({ message: "Project not found" });
  }

  // Check if the current user is the owner of the project
  const isProjectOwner = project.owner.toString() === userID;

  // If the user claims to be an owner but isn't, reject the request
  if (!isOwner && !isProjectOwner) {
    return res
      .status(403)
      .send({ message: "Unauthorized to delete this project as an owner" });
  }

  // Perform deletion logic based on ownership
  if (isProjectOwner) {
    await ProjectSc.findByIdAndDelete(project._id);
    // Remove the project reference from all users
    await UserSc.updateMany(
      { projectsData: project._id },
      { $pull: { projectsData: project._id } }
    );
  } else {
    const deletedAccessUser = await UserSc.findOne({ _id: userID }).select(
      "email"
    );
    project.accessUser.pull({ email: deletedAccessUser.email });
    // Remove the project only from the current user's data
    await UserSc.updateOne(
      { _id: userID },
      { $pull: { projectsData: project._id } }
    );
    await project.save();
  }

  res.status(200).send({ message: "Project deleted successfully" });
});

module.exports = {
  createProject,
  getProject,
  getProjects,
  updateProject,
  addAccess,
  deleteAccess,
  deleteProject,
  getLastAddedProjects,
  getProjectByName,
  UploadFolder,
  getProjectFolder,
};

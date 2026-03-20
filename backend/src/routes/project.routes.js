const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const isOwner = require("../middleware/projectowner.middleware");
const projectController = require("../controllers/project.controller");

router.post("/create",             authMiddleware, projectController.createProject);
router.get("/search",              projectController.searchProject);
router.get("/my-projects",         authMiddleware, projectController.getMyProjects);  // ✅ before /:id
router.get("/my-invites",          authMiddleware, projectController.getMyInvites);   // ✅ before /:id

router.get("/",                    projectController.getProjects);
router.put("/update/:id",          authMiddleware, isOwner, projectController.updateProject);
router.delete("/delete/:id",       authMiddleware, isOwner, projectController.deleteProject);
router.post("/request",            authMiddleware, projectController.requestToJoinProject);
router.post("/:id/respond",        authMiddleware, isOwner, projectController.respondJoin);
router.post("/:id/invite/:userId", authMiddleware, isOwner, projectController.inviteDeveloper);
router.post("/:id/invite-respond", authMiddleware, projectController.respondToInvite);
router.post("/remove-member/:id",  authMiddleware, isOwner, projectController.removeMember);

router.get("/:id",                 projectController.getProjectById);  // ✅ always last

module.exports = router;
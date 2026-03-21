const projectModel = require("../models/project.model")
const userModel = require("../models/user.model")
const ApiResponse = require("../utils/api-response")
const ApiError = require("../utils/api-error")
const asyncHandler = require("../utils/async-handler")

const createProject = asyncHandler(async (req, res, next) => {
    const { title, description, techStack, rolesNeeded } = req.body;

    const project = await projectModel.create({
        title,
        description,
        tech_stack: techStack,
        roles_needed: rolesNeeded,
        created_by: req.user.id
    });

    return res.status(201).json(new ApiResponse(201, { project }, "Project created successfully"));
});

const getProjects = asyncHandler(async (req, res, next) => {
    const projects = await projectModel.find().select("title description tech_stack roles_needed created_by members").populate("created_by", "name").populate("members.user", "name");
    if (projects.length === 0) {
        throw new ApiError(404, "Currently no projects are there")
    }
    return res.status(200).json(new ApiResponse(200, { projects }));
});

const searchProject = asyncHandler(async (req, res, next) => {
    const { q } = req.query;
    let query = {};

    if (q) {
        const regex = new RegExp(q, "i");
        query.$or = [
            { title: { $regex: regex } },
            { tech_stack: { $regex: regex } },
            { roles_needed: { $regex: regex } }
        ];
    }

    const techStack = req.query.tech_stack || req.query['tech_stack[]'];
    if (techStack) {
        const techArray = Array.isArray(techStack) ? techStack : [techStack];
        query.tech_stack = { $in: techArray };
    }

    const roles = req.query.roles || req.query['roles[]'];
    if (roles) {
        const rolesArray = Array.isArray(roles) ? roles : [roles];
        query.roles_needed = { $in: rolesArray };
    }

    if (Object.keys(query).length === 0) {
        const projects = await projectModel.find()
            .populate("created_by", "name")
            .populate("members.user", "name");
        return res.status(200).json(new ApiResponse(200, { projects }));
    }

    const projects = await projectModel.find(query)
        .populate("created_by", "name")
        .populate("members.user", "name");

    return res.status(200).json(new ApiResponse(200, { projects }));
});

const updateProject = asyncHandler(async (req, res, next) => {
    const updates = {};

    if (req.body.title !== undefined) updates.title = req.body.title;
    if (req.body.description !== undefined) updates.description = req.body.description;

    if (req.body.techStack !== undefined) updates.tech_stack = req.body.techStack;
    if (req.body.rolesNeeded !== undefined) updates.roles_needed = req.body.rolesNeeded;

    const updatedProject = await projectModel.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true }
    );

    return res.status(200).json(new ApiResponse(200, { updatedProject }, "Project updated successfully"));
});

const deleteProject = asyncHandler(async (req, res, next) => {
    const deletedProject = await projectModel.findByIdAndDelete(req.params.id);
    if (!deletedProject) throw new ApiError(404, "Project not found");
    return res.status(200).json(new ApiResponse(200, { deletedProject }, "Project deleted successfully"));
});

const requestToJoinProject = asyncHandler(async (req, res, next) => {
    const { projectId } = req.body;
    const project = await projectModel.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }
    const user = await userModel.findById(req.user.id);
    const skillMatch = project.tech_stack.some(skill =>
        user.skills.includes(skill));
    if (!skillMatch) {
        throw new ApiError(400, "You are lacking the skills required for this project");
    }
    const requested = project.join_requests.some(
        r => r.user.toString() === req.user.id
    );
    if (requested) {
        throw new ApiError(400, "You already requested to join this project");
    }
    project.join_requests.push({ user: req.user.id });
    await project.save();
    return res.status(200).json(new ApiResponse(200, null, "Request sent to project creator"));
});

const respondJoin = asyncHandler(async (req, res, next) => {
    const { userid, action } = req.body;
    const project = await projectModel.findById(req.params.id);
    if (!project) throw new ApiError(404, "Project not found");
    const request = project.join_requests.find(
        req => req.user.toString() === userid
    );
    if (!request) {
        throw new ApiError(404, "Request not found");
    }
    if (action === "accept") {
        request.status = "approved";
        project.members.push({ user: userid, role: "developer" });
    } else if (action === "reject") {
        request.status = "rejected";
    }
    await project.save();
    return res.status(200).json(new ApiResponse(200, null, "Request responded successfully"));
});

const getMyProjects = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;

    const createdProjects = await projectModel
        .find({ created_by: userId })
        .select("title tech_stack roles_needed created_by members join_requests")
        .populate("created_by", "name")
        .populate("members.user", "name")
        .populate("join_requests.user", "name");

    const joinedProjects = await projectModel
        .find({ "members.user": userId })
        .select("title tech_stack roles_needed created_by")
        .populate("created_by", "name");

    const pendingRequests = await projectModel
        .find({
            created_by: { $ne: userId },
            join_requests: {
                $elemMatch: {
                    user: userId,
                    status: "pending"
                }
            }
        })
        .select("title tech_stack roles_needed created_by")
        .populate("created_by", "name");

    const removedFromProjects = await projectModel
        .find({ "removed_members.user": userId })
        .select("title tech_stack roles_needed created_by")
        .populate("created_by", "name");

    return res.status(200).json(new ApiResponse(200, {
        createdProjects,
        joinedProjects,
        pendingRequests,
        removedFromProjects
    }));
});

const getProjectById = asyncHandler(async (req, res, next) => {
    const project = await projectModel.findById(req.params.id)
        .populate("created_by", "name")
        .populate("members.user", "name")
        .populate("join_requests.user", "name");
    if (!project) {
        throw new ApiError(404, "Project not found");
    }
    return res.status(200).json(new ApiResponse(200, { project }));
});

const removeMember = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { userId } = req.body;

    const project = await projectModel.findById(id);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    project.members = project.members.filter(m => m.user.toString() !== userId);
    
    if (!project.removed_members.some(m => m.user.toString() === userId)) {
        project.removed_members.push({ user: userId });
    }

    await project.save();

    return res.status(200).json(new ApiResponse(200, { project }, "Member removed successfully"));
});

const inviteDeveloper = asyncHandler(async (req, res, next) => {
    const { id, userId } = req.params;

    const project = await projectModel.findById(id);
    if (!project) throw new ApiError(404, "Project not found");

    if (project.members.some(m => m.user.toString() === userId)) {
        throw new ApiError(400, "User is already a member");
    }

    if (project.invites.some(i => i.user.toString() === userId && i.status === "pending")) {
        throw new ApiError(400, "User already has a pending invite");
    }

    project.invites.push({ user: userId });
    await project.save();

    return res.status(200).json(new ApiResponse(200, null, "Invite sent successfully"));
});

const respondToInvite = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { action } = req.body;
    const userId = req.user.id;

    const project = await projectModel.findById(id);
    if (!project) throw new ApiError(404, "Project not found");

    const invite = project.invites.find(
        i => i.user.toString() === userId && i.status === "pending"
    );
    if (!invite) throw new ApiError(404, "Invite not found");

    if (action === "accept") {
        invite.status = "accepted";
        project.members.push({ user: userId, role: "developer" });
    } else if (action === "decline") {
        invite.status = "declined";
    } else {
        throw new ApiError(400, "Invalid action");
    }

    await project.save();
    return res.status(200).json(new ApiResponse(200, null, `Invite ${action}ed successfully`));
});

const getMyInvites = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const projects = await projectModel
        .find({
            invites: { $elemMatch: { user: userId, status: "pending" } }
        })
        .select("title tech_stack created_by")
        .populate("created_by", "name");

    return res.status(200).json(new ApiResponse(200, { invites: projects }));
});

module.exports = {
    createProject, getProjects, searchProject, updateProject,
    deleteProject, requestToJoinProject, respondJoin,
    getMyProjects, getProjectById, removeMember,
    inviteDeveloper, respondToInvite, getMyInvites
};
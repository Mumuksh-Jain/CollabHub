const projectModel = require("../models/project.model")
const ApiError = require("../utils/api-error")
const asyncHandler = require("../utils/async-handler")

const isOwner = asyncHandler(async (req, res, next) => {
    const project = await projectModel.findById(req.params.id)
    if (!project) {
        throw new ApiError(404, "Project not found")
    }
    if (project.created_by.toString() !== req.user.id) {
        throw new ApiError(403, "You are not authorized to perform this action on this project")
    }
    next()
})

module.exports = isOwner
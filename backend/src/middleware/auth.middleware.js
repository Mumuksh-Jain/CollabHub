const jwt = require("jsonwebtoken");
const ApiError = require("../utils/api-error");
const asyncHandler = require("../utils/async-handler");

const authMiddleware = asyncHandler(async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        throw new ApiError(401, "Unauthorized");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        throw new ApiError(401, "Invalid or expired token");
    }
});

module.exports = authMiddleware;
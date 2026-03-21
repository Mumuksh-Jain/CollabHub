const userModel=require("../models/user.model")
const ApiResponse = require("../utils/api-response")
const ApiError = require("../utils/api-error")
const asyncHandler = require("../utils/async-handler")
const jwt=require("jsonwebtoken")
const bcrypt=require("bcrypt")
const isProduction = process.env.NODE_ENV === "production";

const register = asyncHandler(async (req, res, next) => {
    const { name, email, password, skills, bio, github } = req.body

    if (!email || !email.toLowerCase().endsWith("@gmail.com")) {
        throw new ApiError(400, "Only Gmail addresses are allowed");
    }

    const hash = await bcrypt.hash(password, 10)
    const userPresent = await userModel.findOne(
        {
            $or: [
                { name: name }, { email: email }
            ]
        })
    if (userPresent) {
        throw new ApiError(409, "User already exists");
    }
    const user = await userModel.create({
        name,
        email,
        password: hash,
        skills,
        bio,
        github
    })
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
    res.cookie("token", token, {
        httpOnly: true,
        secure: isProduction,           // only secure in production
        sameSite: isProduction ? "None" : "Lax", // cross-site in prod, Lax in dev
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
    return res.status(201).json(new ApiResponse(201, null, "User registered successfully"))
})
const login = asyncHandler(async (req, res, next) => {
    const { name, email, password } = req.body
    const user = await userModel.findOne(
        {
            $or: [
                { email: email },
                { name: name }
            ]
        }
    )
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const isCorrect = await bcrypt.compare(password, user.password)
    if (!isCorrect) {
        throw new ApiError(401, "Invalid credentials");
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
    res.cookie("token", token, {
        httpOnly: true,
        secure: isProduction,           // only secure in production
        sameSite: isProduction ? "None" : "Lax", // cross-site in prod, Lax in dev
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
    return res.status(200).json(new ApiResponse(200, null, "User logged in successfully"))
})
const logout = asyncHandler(async (req, res, next) => {
    res.clearCookie("token")
    return res.status(200).json(new ApiResponse(200, null, "User logged out successfully"))
})
const updateProfile = asyncHandler(async (req, res, next) => {
    const allowedFields = ["name", "skills", "bio", "github"]
    const updates = {}
    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field]
        }
    })
    const updatedUser = await userModel.findByIdAndUpdate(
        req.user.id,
        updates,
        { new: true }
    )
    return res.status(200).json(new ApiResponse(200, { user: updatedUser }, "Profile updated successfully"))
})
const getMe = asyncHandler(async (req, res, next) => {
    const user = await userModel.findById(req.user.id)
    return res.status(200).json(new ApiResponse(200, { user: user }, "User fetched successfully"))
})
const getAllUsers = asyncHandler(async (req, res, next) => {
    const users = await userModel.find().select("name skills bio github")
    return res.status(200).json(new ApiResponse(200, { users: users }, "Users fetched successfully"))
})
module.exports={register,login,logout,updateProfile,getMe,getAllUsers}
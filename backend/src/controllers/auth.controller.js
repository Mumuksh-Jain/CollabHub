const userModel=require("../models/user.model")
const jwt=require("jsonwebtoken")
const bcrypt=require("bcrypt")

async function register(req,res) {
    try {
        const {name,email,password,skills,bio,github}=req.body
        const hash=await bcrypt.hash(password,10)
        const userPresent=await userModel.findOne(
            {
                $or:[
                { name: name},{email:email}
                ]
            })
    if(userPresent)
    {
        return res.status(409).json({message:"User already exists"})
    }
        const user=await userModel.create({
            name,
            email,
            password:hash,
            skills,
            bio,
            github
        })
        const token=jwt.sign({id:user._id},process.env.JWT_SECRET)
       res.cookie("token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "None",
  maxAge: 7 * 24 * 60 * 60 * 1000
})
        return res.status(201).json({message:"User registered successfully"})
    } catch (error) {
        return res.status(500).json({message:error.message})
    }
}
async function login(req,res)
{
 
    try {
     const {name,email,password}=req.body
    const user=await userModel.findOne(
        {
            $or:[
                {email:email},
                {name:name}
            ]
        }
    )
        if(!user){
            return res.status(404).json({message:"User not found"})
        }
        const isCorrect=await bcrypt.compare(password,user.password)
        if(!isCorrect){
            return res.status(401).json({message:"Invalid credentials"})
        }
        const token=jwt.sign({id:user._id},process.env.JWT_SECRET)
        res.cookie("token",token)
        return res.status(200).json({message:"User logged in successfully"})
    } catch (error) {
        return res.status(500).json({message:error.message})
    }
}
async function logout(req,res)
{
    try {
        res.clearCookie("token")
        return res.status(200).json({message:"User logged out successfully"})
    } catch (error) {
        return res.status(500).json({message:error.message})
    }
}
async function updateProfile(req,res){
    try{
        const allowedFields = ["name","skills","bio","github"]
        const updates = {}
        allowedFields.forEach(field=>{
            if(req.body[field] !== undefined){
                updates[field] = req.body[field]
            }
        })
        const updatedUser = await userModel.findByIdAndUpdate(
            req.user.id,
            updates,
            {new:true}
        )
        return res.status(200).json({
            message:"Profile updated successfully",
            user:updatedUser
        })
    }catch(error){
        return res.status(500).json({message:error.message})
    }
}
async function getMe(req,res){
    try{
        const user = await userModel.findById(req.user.id)
        return res.status(200).json({
            message:"User fetched successfully",
            user:user
        })
    }catch(error){
        return res.status(500).json({message:error.message})
    }
}
module.exports={register,login,logout,updateProfile,getMe}
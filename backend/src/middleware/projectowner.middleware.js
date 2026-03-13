const projectModel=require("../models/project.model")
async function isOwner(req,res,next){
    try {
        const project=await projectModel.findById(req.params.id)
        if(!project){
            return res.status(404).json({message:"Project not found"})
        }
        if(project.created_by.toString()!==req.user.id){
            return res.status(401).json({message:"You are not authorized to update this project"})
        }
        next()
    } catch (error) {
        return res.status(500).json({message:error.message})
    }
}
module.exports=isOwner
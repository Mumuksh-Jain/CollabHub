    const projectModel=require("../models/project.model")
    const userModel=require("../models/user.model")
    async function createProject(req,res){
        try {
            const {title,description,tech_stack,roles_needed}=req.body
            const project=await projectModel.create({
                title,
                description,
                tech_stack,
                roles_needed,
                created_by:req.user.id
            })
            return res.status(201).json({message:"Project created successfully",project})
        } catch (error) {
            return res.status(500).json({message:error.message})
        }
    }    
    async function getProjects(req,res){
        try {   
             const projects = await projectModel.find().select("title description tech_stack roles_needed created_by members").populate("created_by","name").populate("members.user","name");
             if(projects.length===0)
             {   return res.status(404).json({message:"Currently no projects are there"})}
            return res.status(200).json({projects})
        } catch (error) {
            return res.status(500).json({message:error.message})
        }
    }   
    async function searchProject(req,res){
        try {
            const { q } = req.query;
            let query = {};

            // Handle q search
            if (q) {
                const regex = new RegExp(q, "i");
                query.$or = [
                    { title: { $regex: regex } },
                    { tech_stack: { $regex: regex } },
                    { roles_needed: { $regex: regex } }
                ];
            }

            // Handle Tech Stack (handle both tech_stack and tech_stack[])
            const techStack = req.query.tech_stack || req.query['tech_stack[]'];
            if (techStack) {
                const techArray = Array.isArray(techStack) ? techStack : [techStack];
                query.tech_stack = { $in: techArray };
            }

            // Handle Roles (handle both roles and roles[])
            const roles = req.query.roles || req.query['roles[]'];
            if (roles) {
                const rolesArray = Array.isArray(roles) ? roles : [roles];
                query.roles_needed = { $in: rolesArray };
            }

            // If no filters provided, send all projects
            if (Object.keys(query).length === 0) {
                const projects = await projectModel.find()
                    .populate("created_by", "name")
                    .populate("members.user", "name");
                return res.status(200).json({ projects });
            }

            const projects = await projectModel.find(query)
                .populate("created_by", "name")
                .populate("members.user", "name");

            return res.status(200).json({ projects });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }   
    async function updateProject(req,res){
        try {
            const allowedFields = ["title", "description", "tech_stack", "roles_needed"];
            const updates = {};
             allowedFields.forEach(field => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });
            const updatedProject=await projectModel.findByIdAndUpdate(req.params.id,updates,{new:true})
            return res.status(200).json({message:"Project updated successfully" ,
                 updatedProject
            })  
        } catch (error) {
            return res.status(500).json({message:error.message})
        }
    }   
    async function deleteProject(req,res){
        try {
            const deletedProject=await projectModel.findByIdAndDelete(req.params.id)
            return res.status(200).json({message:"Project deleted successfully" ,deletedProject})
        } catch (error) {
            return res.status(500).json({message:error.message})
        }
    }   
    async function requestToJoinProject(req,res){
    try{
        const {projectId} = req.body
        const project = await projectModel.findById(projectId)
        if(!project){
    return res.status(404).json({
        message:"Project not found"
    })}
        const user= await userModel.findById(req.user.id)
        const skillMatch = project.tech_stack.some(skill =>
            user.skills.includes(skill))
        if(!skillMatch){
            return res.status(400).json({
                message:"You are lacking the skills required for this project"
            })}
        const requested=project.join_requests.some(
            r=>r.user.toString()===req.user.id
        )
          if(requested){
            return res.status(400).json({
                message:"You already requested to join this project"
            })}
        project.join_requests.push({ user:req.user.id})
        await project.save()
        return res.status(200).json({
            message:"Request sent to project creator"
        })}
    catch(error){
        return res.status(500).json({message:error.message})}
    }
    async function respondJoin(req,res) {
            try {
                const {userid,action}=req.body
                const project=await projectModel.findById(req.params.id)
                const request=project.join_requests.find(
                    req=>req.user.toString()===userid
                )
                if(!request){
                    return res.status(404).json({message:"Request not found"})
                }
                if(action==="accept"){
                    request.status="approved"
                    project.members.push({user:userid,role:"developer"})
                }
                else if(action==="reject"){
                    request.status="rejected"
                }
                await project.save()
                return res.status(200).json({message:"Request responded successfully"})
            } catch (error) {
                return res.status(500).json({message:error.message})
            }
    }
   async function getMyProjects(req,res){
    try {

        const userId = req.user.id

        const createdProjects = await projectModel
        .find({ created_by:userId })
        .select("title tech_stack roles_needed created_by members join_requests")
        .populate("created_by","name")
        .populate("members.user","name")
        .populate("join_requests.user","name")

        const joinedProjects = await projectModel
        .find({ "members.user":userId })
        .select("title tech_stack roles_needed created_by")
        .populate("created_by","name")

        const pendingRequests = await projectModel
        .find({
            created_by:{ $ne:userId },
            join_requests:{
                $elemMatch:{
                    user:userId,
                    status:"pending"
                }
            }
        })
        .select("title tech_stack roles_needed created_by")
        .populate("created_by","name")

        const removedFromProjects = await projectModel
        .find({ "removed_members.user":userId })
        .select("title tech_stack roles_needed created_by")
        .populate("created_by","name")

        return res.status(200).json({
            createdProjects,
            joinedProjects,
            pendingRequests,
            removedFromProjects
        })

    } catch (error) {
        return res.status(500).json({message:error.message})
    }
}
async function getProjectById(req,res){
    try {
        const project = await projectModel.findById(req.params.id)
            .populate("created_by","name")
            .populate("members.user","name")
            .populate("join_requests.user","name")
        if(!project){
            return res.status(404).json({message:"Project not found"})
        }
        return res.status(200).json({project})
    } catch(error){
        return res.status(500).json({message:error.message})
    }
}
async function removeMember(req,res){
  try{
    const { id } = req.params
    const { userId } = req.body

    const project = await projectModel.findById(id)
    if(!project){
      return res.status(404).json({message:"Project not found"})
    }

    // Pull from members
    project.members = project.members.filter(m => m.user.toString() !== userId)
    
    // Add to removed_members if not already there
    if (!project.removed_members.some(m => m.user.toString() === userId)) {
      project.removed_members.push({ user: userId })
    }

    await project.save()

    if(!project){
      return res.status(404).json({message:"Project not found"})
    }

    return res.status(200).json({
      message:"Member removed successfully",
      project
    })

  }catch(error){
    return res.status(500).json({message:error.message})
  }
}
    module.exports={createProject,getProjects,searchProject,updateProject,deleteProject,requestToJoinProject,respondJoin,getMyProjects,getProjectById,removeMember}
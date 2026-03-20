const mongoose=require("mongoose")
const projectSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    tech_stack:{
        type:[String],
        required:true
    },
    created_by:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    roles_needed:{
        type:[String],
        required:true
    },
    join_requests: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
            requested_at: { type: Date, default: Date.now }
        }
    ],
    members:[
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            role: { type: String, enum: ["developer", "designer", "tester", "manager"], default: "developer" },
            joined_at: { type: Date, default: Date.now }
        }
    ],
    removed_members:[
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            removed_at: { type: Date, default: Date.now }
        }
    ],
    invites: [{
    user:       { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status:     { type: String, enum: ["pending", "accepted", "declined"], default: "pending" },
    invited_at: { type: Date, default: Date.now }
  }]
     
})

const projectModel=mongoose.model("Project",projectSchema)
module.exports=projectModel
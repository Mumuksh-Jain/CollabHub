const mongoose=require("mongoose")
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    skills:
    {type:[String],
    required:true},
    bio:{
        type:String,
        required:true
    },
    github:{
        type:String
    }
})
const userModel=mongoose.model("User",userSchema)

module.exports=userModel
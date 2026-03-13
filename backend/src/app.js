const express=require("express")
const app=express()
const cookieParser=require("cookie-parser")
const cors=require("cors")
const authRoutes=require("../src/routes/auth.route")
const projectRoutes=require("../src/routes/project.routes")
app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin: ['http://localhost:5173', "https://collab-hub1.vercel.app"],
  credentials: true
}))
app.use("/api/auth",authRoutes)
app.use("/api/project",projectRoutes)

    
module.exports=app


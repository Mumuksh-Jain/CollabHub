const express=require("express")
const app=express()
const cookieParser=require("cookie-parser")
const cors=require("cors")
const authRoutes=require("../src/routes/auth.route")
const projectRoutes=require("../src/routes/project.routes")
app.get("/api/health", (req, res) => {
  res.status(200).send("OK");
});
app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:5173",
        "https://collab-hub1.vercel.app"
      ];

      if (
        !origin || 
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);
app.use("/api/auth",authRoutes)
app.use("/api/project",projectRoutes)

    
module.exports=app


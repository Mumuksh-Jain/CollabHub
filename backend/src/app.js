const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const authRoutes    = require("../src/routes/auth.route");
const projectRoutes = require("../src/routes/project.routes");
const aiRoutes      = require("../src/routes/ai.route");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://collab-hub1.vercel.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app")
    ) {
      callback(null, true);
    } else {
      console.log("❌ CORS blocked:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());
app.options("/{*path}", cors(corsOptions)); // ✅ handle preflight
app.use(cors(corsOptions));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/auth",    authRoutes);
app.use("/api/project", projectRoutes);
app.use("/api/ai",      aiRoutes);

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ─── Global error handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${err.stack}`);
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ error: "CORS policy violation" });
  }
  res.status(err.status ?? 500).json({
    error: err.message ?? "Internal Server Error",
  });
});

module.exports = app;
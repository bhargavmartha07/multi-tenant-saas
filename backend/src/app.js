require("dotenv").config();
const express = require("express");
const cors = require("cors");

const pool = require("./db/connection");
const runMigrations = require("./db/migrate");
const runSeeds = require("./db/seed");

const authRoutes = require("./routes/authRoutes");
const tenantRoutes = require("./routes/tenantRoutes");
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const app = express();
const PORT = process.env.PORT || 5000;

// =====================
// Middleware
// =====================
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const allowedOrigins = [
  FRONTEND_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://frontend:3000"
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("CORS policy: Origin not allowed"), false);
  },
  credentials: true
}));



app.use(express.json()); // ✅ MUST be before routes

// =====================
// Routes
// =====================
app.get("/", (req, res) => {
  res.json({ message: "Multi-Tenant SaaS Backend Running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
// Mount taskRoutes under /api so routes like /api/projects/:projectId/tasks and /api/tasks/:taskId work
app.use("/api", taskRoutes);

// Health check
app.get("/api/health", async (req, res) => {
  res.json({
    status: "ok",
    database: "connected",
    timestamp: new Date().toISOString()
  });
});

module.exports = app;

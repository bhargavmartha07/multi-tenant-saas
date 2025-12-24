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
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
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
app.use("/api/tasks", taskRoutes);

// Health check
app.get("/api/health", async (req, res) => {
  res.json({
    status: "ok",
    database: "connected",
    timestamp: new Date().toISOString()
  });
});

// =====================
// Startup
// =====================
(async () => {
  try {
    await pool.query("SELECT 1");
    await runMigrations();
    await runSeeds();

    app.listen(PORT, () => {
      console.log(`Backend running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Startup failed:", err);
    process.exit(1);
  }
})();

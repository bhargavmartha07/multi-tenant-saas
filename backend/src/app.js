require("dotenv").config();
const express = require("express");
const cors = require("cors");

const pool = require("./db/connection");
const runMigrations = require("./db/migrate");
const runSeeds = require("./db/seed");

const app = express();
const PORT = process.env.PORT || 5000;

// =====================
// Middleware
// =====================
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const tenantRoutes = require("./routes/tenantRoutes");

// =====================
// App State
// =====================
let dbReady = false;

// =====================
// Routes
// =====================

// Root route (important for sanity checks)
app.get("/", (req, res) => {
  res.json({ message: "Multi-Tenant SaaS Backend Running" });
});
app.use("/api/tenants", tenantRoutes);

// Health check (MANDATORY)
app.get("/api/health", async (req, res) => {
  if (!dbReady) {
    return res.status(503).json({
      status: "error",
      database: "not_ready"
    });
  }

  res.status(200).json({
    status: "ok",
    database: "connected",
    timestamp: new Date().toISOString()
  });
});
app.use("/api/auth", authRoutes);

// =====================
// Startup Logic
// =====================
(async () => {
  try {
    // Verify DB connection
    await pool.query("SELECT 1");

    console.log("Database connected");

    // Run migrations & seeds
    await runMigrations();
    await runSeeds();

    dbReady = true;

    app.listen(PORT, () => {
      console.log(`Backend running on port ${PORT}`);
    });

  } catch (err) {
    console.error("Startup failed:", err);
    process.exit(1);
  }
})();

// =====================
// Graceful Shutdown
// =====================
process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Closing DB pool.");
  await pool.end();
  process.exit(0);
});

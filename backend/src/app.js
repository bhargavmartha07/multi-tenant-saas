require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db/connection");
const runMigrations = require("./db/migrate");
const runSeeds = require("./db/seed");


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let dbReady = false;

// Health check
app.get("/api/health", async (req, res) => {
  if (!dbReady) {
    return res.status(503).json({
      status: "error",
      database: "not_ready"
    });
  }

  res.json({
    status: "ok",
    database: "connected",
    timestamp: new Date().toISOString()
  });
});

// Start server AFTER migrations
(async () => {
  try {
    await pool.query("SELECT 1");

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


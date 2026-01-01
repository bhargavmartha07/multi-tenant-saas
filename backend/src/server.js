require("dotenv").config();
const pool = require("./db/connection");
const runMigrations = require("./db/migrate");
const runSeeds = require("./db/seed");
const app = require("./app");

const PORT = process.env.PORT || 5000;

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

const fs = require("fs");
const path = require("path");
const pool = require("./connection");

async function runSeeds() {
  // Check if super admin already exists
  const check = await pool.query(
    "SELECT 1 FROM users WHERE role = 'super_admin' LIMIT 1"
  );

  if (check.rowCount > 0) {
    console.log("Seed data already exists. Skipping seeds.");
    return;
  }

  const seedFile = path.join(__dirname, "..", "..", "seeds", "seed_data.sql");


  if (!fs.existsSync(seedFile)) {
    console.log("No seed file found, skipping seeds");
    return;
  }

  console.log("Running seed data...");
  const sql = fs.readFileSync(seedFile, "utf-8");
  await pool.query(sql);
  console.log("Seed data completed");
}

module.exports = runSeeds;

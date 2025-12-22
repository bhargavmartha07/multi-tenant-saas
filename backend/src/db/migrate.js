const fs = require("fs");
const path = require("path");
const pool = require("./connection");

async function runMigrations() {
    const migrationsDir = path.join(__dirname, "..", "..", "migrations");


  const files = fs
    .readdirSync(migrationsDir)
    .filter(file => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, "utf-8");

    console.log(`Running migration: ${file}`);
    await pool.query(sql);
  }

  console.log("All migrations completed");
}

module.exports = runMigrations;

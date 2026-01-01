const fs = require("fs");
const path = require("path");
const pool = require("./connection");

async function runMigrations() {
  const migrationsDir = path.join(__dirname, "..", "..", "migrations");

  if (!fs.existsSync(migrationsDir)) {
    throw new Error(`Migrations directory not found: ${migrationsDir}`);
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter(file => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(
      path.join(migrationsDir, file),
      "utf-8"
    );

    console.log(`🚀 Running migration: ${file}`);
    try {
      await pool.query(sql);
    } catch (err) {
      // If enum/type already exists (Postgres error code 42710), ignore and continue
      if (err && err.code === '42710') {
        console.warn(`Migration ${file} warning: ${err.message} - continuing`);
        continue;
      }
      throw err;
    }
  }

  console.log("✅ All migrations completed");
}

module.exports = runMigrations;
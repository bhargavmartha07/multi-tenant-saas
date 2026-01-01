const { Pool } = require("pg");

// Provide sane defaults to ease local development (tests already set defaults in test files)
const resolvedHost = (() => {
  // If .env was written for docker-compose (DB_HOST=database) but we're running
  // the backend on the host machine during local development, remap to localhost
  // so the host can access the DB container via the published port.
  if (process.env.DB_HOST === 'database' && process.env.IN_DOCKER !== '1') {
    console.warn("DB_HOST is 'database' — remapping to 'localhost' for local development.");
    return 'localhost';
  }
  return process.env.DB_HOST || 'localhost';
})();

const pool = new Pool({
  host: resolvedHost,
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME || 'saas_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

module.exports = pool;

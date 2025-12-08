
// db.js
require("dotenv").config();
const { Pool } = require("pg");

// Use environment variables if present, otherwise fallback to defaults
const pool = new Pool({
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "Nachos23!",
  host: process.env.PGHOST || "localhost",
  port: process.env.PGPORT || 5432,
  database: process.env.PGDATABASE || "recipe",
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
}
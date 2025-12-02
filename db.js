const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: "josselin",
  password: "newpassword",
  host: "localhost",
  port: 5432,
  database: "recipeshare"
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};


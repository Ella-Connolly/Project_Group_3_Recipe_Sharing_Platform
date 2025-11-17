const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const db = require("../db");

//post signup
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).send("Missing fields");

    const exists = await db.query(`SELECT id FROM users WHERE username = $1 OR email = $2`, [username, email]);
    if (exists.rows.length) return res.status(400).send("User exists");

    const hash = await bcrypt.hash(password, 10);
    const inserted = await db.query(
      `INSERT INTO users (username, full_name, email, password_hash) VALUES ($1,$2,$3,$4) RETURNING id`,
      [username, username, email, hash]
    );

    const userId = inserted.rows[0].id;
    return res.redirect(`/profile?userId=${userId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

//get login
router.get("/login", (req, res) => {
  res.redirect("/");
});

module.exports = router;
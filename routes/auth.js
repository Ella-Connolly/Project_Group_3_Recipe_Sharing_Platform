const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const saltRounds = 10;
const db = require("../db");

//create user session
function createUserSession(req, user) {
  req.session.user = {
    id: user.id,
    username: user.username,
    email: user.email
  };
}

//get signup page
router.get("/signup", (req, res) => {
  res.render("signup", { flash: req.flash ? req.flash() : {} });
});

//post signup
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      req.flash("error", "All fields are required.");
      return res.redirect("/auth/signup");
    }

    const exists = await db.query(
      `SELECT id FROM users WHERE username = $1 OR email = $2`,
      [username, email]
    );
    if (exists.rows.length) {
      req.flash("error", "Username or email already taken.");
      return res.redirect("/auth/signup");
    }

    const hash = await bcrypt.hash(password, saltRounds);
    const inserted = await db.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username, email`,
      [username, email, hash]
    );

    createUserSession(req, inserted.rows[0]);
    return res.redirect("/");
  } catch (err) {
    console.error("Signup error:", err);
    req.flash("error", "Server error.");
    return res.redirect("/auth/signup");
  }
});

//get login page
router.get("/login", (req, res) => {
  res.render("login", { flash: req.flash ? req.flash() : {} });
});

//post login
router.post("/login", async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;
    if (!emailOrUsername || !password) {
      req.flash("error", "All fields are required.");
      return res.redirect("/auth/login");
    }

    const result = await db.query(
      `SELECT id, username, email, password_hash
       FROM users
       WHERE email = $1 OR username = $1`,
      [emailOrUsername]
    );

    if (result.rows.length === 0) {
      req.flash("error", "Invalid credentials.");
      return res.redirect("/auth/login");
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      req.flash("error", "Invalid credentials.");
      return res.redirect("/auth/login");
    }

    createUserSession(req, user);
    return res.redirect("/");
  } catch (err) {
    console.error("Login error:", err);
    req.flash("error", "Server error.");
    return res.redirect("/auth/login");
  }
});

//logout
router.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) console.error("Logout error:", err);
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
});

module.exports = router;
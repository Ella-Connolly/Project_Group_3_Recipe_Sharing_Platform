const express = require("express");
const router = express.Router();
const db = require("../db");

//home route
router.get("/", async (req, res) => {
  let featured = [];
  try {
    const result = await db.query(
      `SELECT * FROM recipes ORDER BY created_at DESC LIMIT 6`
    );
    featured = result.rows;
  } catch (err) {
    console.error("DB error:", err);
  }

  res.render("pages/home", { featured });
});

module.exports = router;
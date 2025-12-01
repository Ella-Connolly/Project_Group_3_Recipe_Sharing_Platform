const express = require("express");
const router = express.Router();
const db = require("../db");
const requireLogin = require("../middleware/requireLogin");

//post create comment
router.post("/create", requireLogin, async (req, res) => {
  const { recipe_id, content } = req.body;

  if (!recipe_id || !content) {
    req.flash("error", "Comment content required.");
    return res.redirect("back");
  }

  try {
    await db.query(
      `INSERT INTO comments (recipe_id, user_id, content) VALUES ($1, $2, $3)`,
      [recipe_id, req.session.user.id, content]
    );

    //redirect to recipe detail page
    return res.redirect(`/recipes/${recipe_id}`);
  } catch (err) {
    console.error("Comment create error:", err);
    req.flash("error", "Could not post comment.");
    return res.redirect("back");
  }
});

module.exports = router;
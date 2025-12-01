const express = require("express");
const router = express.Router();
const db = require("../db");
const requireLogin = require("../middleware/requireLogin");

//get all recipes
router.get("/", async (req, res) => {
  const { cuisine, ingredient, keyword } = req.query;

  let query = "SELECT * FROM recipes WHERE 1=1";
  const params = [];

  if (cuisine) {
    params.push(cuisine);
    query += ` AND cuisine ILIKE $${params.length}`;
  }

  if (ingredient) {
    params.push(`%${ingredient}%`);
    query += ` AND ingredients::text ILIKE $${params.length}`;
  }

  if (keyword) {
    params.push(`%${keyword}%`);
    query += ` AND (title ILIKE $${params.length} OR description ILIKE $${params.length})`;
  }

  query += " ORDER BY created_at DESC";

  try {
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Recipe filter error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

//get recipe by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const recipe = await db.query(
      `SELECT r.*, u.username
       FROM recipes r
       LEFT JOIN users u ON r.author_id = u.id
       WHERE r.id = $1`,
      [id]
    );

    if (!recipe.rows.length)
      return res.status(404).json({ error: "Recipe not found" });

    const comments = await db.query(
      `SELECT c.*, u.username
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.recipe_id = $1
       ORDER BY c.created_at DESC`,
      [id]
    );

    res.json({
      recipe: recipe.rows[0],
      comments: comments.rows,
    });
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

//post recipe
router.post("/", requireLogin, async (req, res) => {
  const {
    title,
    description,
    ingredients,
    instructions,
    tags,
    cuisine,
    difficulty,
    cook_time,
    prep_time,
    servings,
    images
  } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO recipes
        (title, description, ingredients, instructions, tags, cuisine, difficulty, cook_time, prep_time, servings, images, author_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [
        title,
        description || "",
        ingredients || [],
        instructions || [],
        tags || [],
        cuisine || "",
        difficulty || "",
        cook_time || 0,
        prep_time || 0,
        servings || 1,
        images || [],
        req.session.user.id
      ]
    ); // <-- closing the query properly here

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Recipe post error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

//delete recipe by ID
router.delete("/:id", requireLogin, async (req, res) => {
  const recipeId = req.params.id;
  const userId = req.session.user.id;

  try {
    const check = await db.query(
      "SELECT author_id FROM recipes WHERE id = $1",
      [recipeId]
    );

    if (!check.rows.length)
      return res.status(404).json({ error: "Recipe not found" });

    if (check.rows[0].author_id !== userId)
      return res.status(403).json({ error: "Not allowed" });

    await db.query("DELETE FROM recipes WHERE id = $1", [recipeId]);

    res.json({ message: "Recipe deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
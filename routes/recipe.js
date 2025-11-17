const express = require("express");
const router = express.Router();
const db = require("../db");

//get all recipes
router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM recipes ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

//get recipe by id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("SELECT * FROM recipes WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

//post recipe
router.post("/", async (req, res) => {
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
    images,
    author_id,
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
        author_id || null,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

//delete using id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM recipes WHERE id = $1", [id]);
    res.json({ message: "Recipe deleted successfully" });
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
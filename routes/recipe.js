const express = require("express");
const router = express.Router();
const db = require("../db");
const requireLogin = require("../middleware/requireLogin");
const multer = require("multer");
const upload = multer({ dest: "public/uploads/" });


// LIST / FILTER RECIPES
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
    res.render("pages/recipes", {
      recipes: result.rows,
      flash: req.flash ? req.flash() : {},
      currentUser: req.session.user || null,
    });
  } catch (err) {
    console.error("Recipe filter error:", err);
    req.flash("error", "Could not load recipes.");
    res.redirect("/");
  }
});

// POST NEW RECIPE
router.post("/", requireLogin, upload.array("images"), async (req, res) => {
  console.log("BODY:", req.body);  // <-- title will show here now
  console.log("FILES:", req.files);

  let {
    title,
    description,
    ingredients,
    instructions,
    tags,
    cuisine,
    difficulty,
    cook_time,
    prep_time,
    servings
  } = req.body;

  // Convert comma-separated strings into arrays for storage
  ingredients = ingredients ? ingredients.split(",").map(i => i.trim()) : [];
  instructions = instructions ? instructions.split(".").map(i => i.trim()).filter(Boolean) : [];
  tags = tags ? tags.split(",").map(t => t.trim()) : [];
  images = images ? [images.trim()] : []; // wrap single image URL in array

  try {
    const result = await db.query(
      `INSERT INTO recipes
      (title, description, ingredients, instructions, tags, cuisine, difficulty, cook_time, prep_time, servings, images, author_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *`,
      [
        title,
        description || "",
        ingredients,
        instructions,
        tags,
        cuisine || "",
        difficulty || "",
        cook_time || 0,
        prep_time || 0,
        servings || 1,
        images,
        req.session.user.id
      ]
    );

    // Redirect to newly created recipe page instead of JSON
    const newRecipe = result.rows[0];
    res.redirect(`/recipes/${newRecipe.id}`);
  } catch (err) {
    console.error("Recipe post error:", err);
    req.flash("error", "Could not submit recipe. Please try again.");
    res.redirect("/recipes/submit");
  }
});

router.get("/submit", requireLogin, (req, res) => {
  res.render("pages/submit"); // this loads views/submit.ejs
});


// DELETE RECIPE BY ID
router.delete("/:id", requireLogin, async (req, res) => {
  const recipeId = req.params.id;
  const userId = req.session.user.id;

  try {
    const check = await db.query("SELECT author_id FROM recipes WHERE id = $1", [recipeId]);

    if (!check.rows.length) return res.status(404).json({ error: "Recipe not found" });
    if (check.rows[0].author_id !== userId) return res.status(403).json({ error: "Not allowed" });

    await db.query("DELETE FROM recipes WHERE id = $1", [recipeId]);
    res.json({ message: "Recipe deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// VIEW SINGLE RECIPE
// Must come after POST "/" to avoid conflicts
router.get("/:id", async (req, res) => {
  const recipeId = req.params.id;

  try {
    const result = await db.query(
      `SELECT r.*, u.username AS author_username
       FROM recipes r
       LEFT JOIN users u ON r.author_id = u.id
       WHERE r.id = $1`,
      [recipeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Recipe not found");
    }

    const recipe = result.rows[0];

    // Ensure ingredients + instructions are arrays
    if (typeof recipe.ingredients === "string") {
      recipe.ingredients = recipe.ingredients.split(",").map(i => i.trim());
    }

    if (typeof recipe.instructions === "string") {
      recipe.instructions = recipe.instructions
        .split(".")
        .map(i => i.trim())
        .filter(Boolean);
    }

    // Load comments
    const commentsResult = await db.query(
      `SELECT c.*, u.username AS commenter_username
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.recipe_id = $1
       ORDER BY c.created_at DESC`,
      [recipeId]
    );

    // Render recipedetail.ejs and PASS ONLY { recipe, comments }
    res.render("pages/recipedetail", {
      recipe: recipe,
      comments: commentsResult.rows
    });

  } catch (err) {
    console.error("Error loading recipe:", err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;

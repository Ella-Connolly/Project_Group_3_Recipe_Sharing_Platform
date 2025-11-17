require("dotenv").config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const cors = require("cors");

const app = express();

//routes
const recipeApi = require("./routes/recipe");
const uploadApi = require("./routes/upload");
const authRoutes = require("./routes/auth");
const webIndex = require("./routes/index");

//port
const PORT = process.env.PORT || 5000;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "devsecret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

//routes api
app.use("/api/recipes", recipeApi);
app.use("/api/upload", uploadApi);
app.use("/auth", authRoutes);

app.use("/", webIndex);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
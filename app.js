require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const bodyParser = require("body-parser");
const session = require("express-session");
const cors = require("cors");

const app = express();

//import routes
const authRouter = require("./routes/auth");
const commentRouter = require("./routes/comments");
const recipeApi = require("./routes/recipe");
const uploadApi = require("./routes/upload");
const authRoutes = require("./routes/auth");
const webIndex = require("./routes/index");

//port
const PORT = process.env.PORT || 5000;

//view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

//session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "devsecret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 1 day
  })
);

//flash messages
app.use(flash());

//make user & flash available in EJS views
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.flash = req.flash ? req.flash() : {};
  next();
});

//static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

//routes
app.use("/auth", authRouter);
app.use("/api/recipes", recipeApi);
app.use("/api/upload", uploadApi);
app.use("/comments", commentRouter);
app.use("/", webIndex);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${5000}`);
});
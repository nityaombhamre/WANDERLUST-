if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const MongoStore = require("connect-mongo");
const User = require("./models/user");

// ===== ROUTES =====
const listingsRouter = require("./routes/listings");
const reviewsRouter = require("./routes/reviews");
const userRouter = require("./routes/users");

// ===== DATABASE =====
const dbUrl = process.env.ATLASDB_URL; 
mongoose.set("strictQuery", true);
mongoose
  .connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    tls: true, // <— important for Atlas SSL fix
    serverSelectionTimeoutMS: 10000,
  })
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log("DB Connection Error:", err));

// ===== VIEW ENGINE =====
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ===== MIDDLEWARE =====
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ===== SESSION STORE =====
const store = MongoStore.create({
  mongoUrl: dbUrl,

  touchAfter: 24 * 3600,
  mongoOptions: { tls: true }, // <— FIX
});

store.on("error", (err) => console.log("SESSION STORE ERROR", err));

const sessionOptions = {
  store,
  secret:process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};

app.use(session(sessionOptions));
app.use(flash());

// ===== PASSPORT =====
app.use(passport.initialize());
app.use(passport.session());

// Fix login issue: use email as usernameField
passport.use(
  new LocalStrategy({ usernameField: "email" }, User.authenticate())
);

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ===== GLOBAL VARIABLES =====
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

// ===== ROUTES =====
app.get("/", (req, res) => res.redirect("/listings"));

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

// ===== 404 HANDLER =====
app.use((req, res, next) => {
  // Log the unknown route for debugging
  console.error("404 ERROR: Route not found:", req.originalUrl);

  // Prevent static file requests from redirecting
  if (
    req.originalUrl.startsWith("/script.js") ||
    req.originalUrl.startsWith("/css/")
  ) {
    return res.status(404).send("File not found");
  }

  // Redirect all other unknown routes
  res.redirect("/listings");
});

// ===== SERVER =====
app.listen(8080, () => {
  console.log("🚀 Server running on http://localhost:8080");
});

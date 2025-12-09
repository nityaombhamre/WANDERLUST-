const express = require("express");
const router = express.Router();

const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");

// ===== SIGNUP =====
router.get("/signup", userController.renderSignupForm);

router.post(
  "/signup",
  wrapAsync(userController.signup) // handled in controller
);

// ===== LOGIN =====
router.get("/login", saveRedirectUrl, userController.renderLoginForm);

router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  (req, res) => {
    // Redirect to previously saved URL or default to /listings
    const redirectUrl = req.session.redirectUrl || "/listings";
    delete req.session.redirectUrl;
    req.flash("success", "Welcome back!");
    res.redirect(redirectUrl);
  }
);

// ===== LOGOUT =====
router.get("/logout", (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    req.flash("success", "Logged out successfully!");
    res.redirect("/listings");
  });
});

module.exports = router;

;









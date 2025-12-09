  const User = require("../models/user");


  module.exports.renderSignupForm=(req, res) => {
    res.render("users/signup");
  }
  
  
  module.exports.signup= async (req, res, next) => {
      const { username, email, password } = req.body;
      const newUser = new User({ username, email });
      const registeredUser = await User.register(newUser, password);
  
      req.login(registeredUser, (err) => {
        if (err) return next(err);
        req.flash("success", "Welcome! You are signed up.");
        res.redirect("/listings");
      });
    }



    module.exports.renderLoginForm=(req, res) => {
        res.render("users/login");
      }




      module.exports.login=(req, res) => {
        req.flash("success", "Welcome back!");
        const redirectUrl = res.locals.redirectUrl || "/listings";
        delete req.session.redirectUrl;
        res.redirect(redirectUrl);
      }

      module.exports.logout=(req, res, next) => {
        req.logout((err) => {
          if (err) return next(err);
          req.flash("success", "Successfully logged out!");
          res.redirect("/listings");
        });
      }
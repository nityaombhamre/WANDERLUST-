const Listing = require("./models/listing");
const Review = require("./models/review");   // <-- needed to check review author

const { listingSchema } = require("./schema");
const { reviewSchema } = require("./schema");

const ExpressError = require("./utils/ExpressError");

// ====================== isLoggedIn ======================
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in to create a listing!");
    return res.redirect("/login");
  }
  next();
};

// ====================== saveRedirectUrl ======================
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.method === "GET" && !req.user) {
    req.session.redirectUrl = req.originalUrl;
  }
  next();
};

// ====================== isOwner ======================
module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  if (!listing.owner.equals(req.user._id)) {
    req.flash("error", "You don't have permission to edit!");
    return res.redirect(`/listings/${id}`);
  }

  next();
};

// ===== LISTING VALIDATION =====
module.exports.validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    throw new ExpressError(
      error.details.map((el) => el.message).join(", "),
      400
    );
  }
  next();
};

// ===== REVIEW VALIDATION =====
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  }
  next();
};

// ====================== isReviewAuthor ======================
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;

  const review = await Review.findById(reviewId);

  if (!review) {
    req.flash("error", "Review not found!");
    return res.redirect(`/listings/${id}`);
  }

  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You don't have permission to delete this review!");
    return res.redirect(`/listings/${id}`);
  }

  next();
};


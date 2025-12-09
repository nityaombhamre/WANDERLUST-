const express = require("express");
const router = express.Router({ mergeParams: true });

const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateReview } = require("../middleware.js");
const reviewsController = require("../controllers/reviews.js");

// CREATE REVIEW
router.post(
"/",
isLoggedIn,
validateReview,
wrapAsync(reviewsController.createReview)
);

// DELETE REVIEW
router.delete(
"/:reviewId",
isLoggedIn,
isOwner,
wrapAsync(reviewsController.deleteReview)
);

module.exports = router;






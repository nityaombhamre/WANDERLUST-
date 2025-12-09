const express = require("express");
const router = express.Router();

const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// ========= INDEX + CREATE =========
router
.route("/")
.get(wrapAsync(listingController.index)) // INDEX
.post(
isLoggedIn, // CREATE
upload.single("listing[image]"),
validateListing,
wrapAsync(listingController.createListing)
);

// ========= NEW LISTING FORM =========
router.get("/new", isLoggedIn, listingController.renderNewForm);

// ========= SHOW + UPDATE + DELETE =========
router
.route("/:id")
.get(wrapAsync(listingController.showListing)) // SHOW
.put(
isLoggedIn,
isOwner,
upload.single("listing[image]"),
validateListing,
wrapAsync(listingController.updateListing) // UPDATE
)
.delete(
isLoggedIn,
isOwner,
wrapAsync(listingController.destroyListing) // DELETE
);

// ========= EDIT FORM =========
router.get(
"/:id/edit",
isLoggedIn,
isOwner,
wrapAsync(listingController.renderEditForm)
);

module.exports = router;


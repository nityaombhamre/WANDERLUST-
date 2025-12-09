const Listing = require("../models/listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

// ✅ Use the correct environment variable
const mapToken = process.env.MAP_TOKEN;

const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// ===================== INDEX =====================
module.exports.index = async (req, res) => {
  const { category } = req.query;

  // Listings shown as cards (may be filtered by category)
  const filter = {};
  if (category) filter.category = category;

  const listingsForCards = await Listing.find(filter).populate("owner");

  // Map should always show all listings (unfiltered)
  const allListingsForMap = await Listing.find({}).populate("owner");

  res.render("listings/index", {
    allListings: listingsForCards, // cards
    allMapListings: allListingsForMap, // map markers
    category: category || "",
    mapToken, // ✅ pass correct token
  });
};

// ===================== NEW FORM =====================
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new");
};

// ===================== CREATE LISTING =====================
module.exports.createListing = async (req, res, next) => {
  try {
    const geoResponse = await geocodingClient
      .forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      })
      .send();

    if (!geoResponse.body.features.length) {
      req.flash("error", "Invalid location entered!");
      return res.redirect("/listings/new");
    }

    const { listing } = req.body;
    const newListing = new Listing(listing);

    // Owner
    newListing.owner = req.user._id;

    // Geometry from geocoding
    newListing.geometry = {
      type: "Point",
      coordinates: geoResponse.body.features[0].geometry.coordinates,
    };

    // Ensure category exists
    if (!newListing.category)
      newListing.category = listing.category || "trending";

    // If file uploaded
    if (req.file) {
      newListing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }

    await newListing.save();

    console.log("Coordinates saved:", newListing.geometry.coordinates);

    req.flash("success", "Successfully created a new listing!");

    // ✅ Redirect to listings index so the map shows all listings
    res.redirect("/listings");
  } catch (err) {
    next(err);
  }
};

// ===================== SHOW LISTING =====================
module.exports.showListing = async (req, res, next) => {
  try {
    const { id } = req.params;

    const listing = await Listing.findById(id)
      .populate({
        path: "reviews",
        populate: { path: "author" },
      })
      .populate("owner");

    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }

    // Coordinates for Mapbox
    const listingCoordinates = listing.geometry?.coordinates || [0, 0];

    res.render("listings/show", {
      listing,
      listingCoordinates,
      mapToken, // ✅ ensure token is passed
    });
  } catch (err) {
    next(err);
  }
};

// ===================== EDIT FORM =====================
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  res.render("listings/edit", { listing });
};

// ===================== UPDATE LISTING =====================
module.exports.updateListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedData = req.body.listing || {};

    // If location updated, geocode and set geometry
    if (updatedData.location) {
      const geoResponse = await geocodingClient
        .forwardGeocode({
          query: updatedData.location,
          limit: 1,
        })
        .send();

      if (!geoResponse.body.features.length) {
        req.flash("error", "Invalid location entered!");
        return res.redirect(`/listings/${id}/edit`);
      }

      updatedData.geometry = {
        type: "Point",
        coordinates: geoResponse.body.features[0].geometry.coordinates,
      };
    }

    let listing = await Listing.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    // If new file uploaded, replace image
    if (req.file) {
      listing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
      await listing.save();
    }

    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    next(err);
  }
};

// ===================== DELETE LISTING =====================
module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;

  await Listing.findByIdAndDelete(id);

  req.flash("success", "Listing deleted successfully!");
  res.redirect("/listings");
};

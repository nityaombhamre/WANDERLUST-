const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },

  description: String,

  image: {
    url: {
      type: String,
      default: "https://source.unsplash.com/random/?house",
    },
    filename: {
      type: String,
      default: "default-house",
    },
  },

  price: {
    type: Number,
    required: true,
  },

  // ⭐ Added category field
  category: {
    type: String,
    enum: [
      "trending",
      "rooms",
      "city",
      "mountain",
      "beachfront",
      "tropical",
      "desert",
      "boat",
      "luxe",
      "tiny",
      "village",
      "forest",
      "snow",
    ],
    default: "trending",
  },

  // ⭐ Added country field
  country: {
    type: String,
    required: true,
  },

  location: {
    type: String,
  },

  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
  },

  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

// Cascade delete reviews when listing deleted
listingSchema.post("findOneAndDelete", async function (listing) {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

module.exports = mongoose.model("Listing", listingSchema);

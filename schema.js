const Joi = require("joi");

// ===== LISTING VALIDATION SCHEMA =====
module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().greater(0).required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    image: Joi.string().allow("", null), // optional image

    // ⭐ ADD THIS ⭐
    category: Joi.string()
      .valid(
        "mountain",
        "beach",
        "forest",
        "city",
        "village",
        "snow",
        "desert",
        "temple"
      )
      .required()
  }).required(),
});

// ===== REVIEW VALIDATION SCHEMA =====
module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().required(),
  }).required(),
});



const express = require('express');
const router = express.Router({ mergeParams: true }); // ✅ Required for nested params like :id
const Review = require('../models/review.js');
const Listing = require('../models/listing.js');
const wrapAsync = require('../utils/wrapAsync.js');
const { reviewSchema } = require('../schema.js'); // ✅ Joi validation schema
const ExpressError = require('../utils/ExpressError.js'); // ✅ Custom error class
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js")
const reviewController = require("../controller/review.js")


// ✅ POST /listings/:id/reviews
router.post('/', isLoggedIn, 
  validateReview,
   wrapAsync(reviewController.createReview));



// ✅ DELETE /listings/:id/reviews/:reviewId
router.delete('/:reviewId',
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(reviewController.destroyReview));

module.exports = router;

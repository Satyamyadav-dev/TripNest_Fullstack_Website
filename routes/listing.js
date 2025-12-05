const express = require('express')
const router = express.Router()
const wrapAsync = require('../utils/wrapAsync.js')
const ExpressError = require('../utils/ExpressError.js')
const { listingSchema, reviewSchema } = require('../schema.js')
// const listings = require('../routes/listing.js')
const Listing = require('../models/listing.js')
const { isLoggedIn, isOwner, validateListing } = require('../middleware.js')
const listingController = require("../controller/listing.js")

const multer = require('multer')
const { storage } = require("../cloudConfig.js")
const upload = multer({ storage })




// index route
router.route("/")
  .get(wrapAsync(listingController.index))
  .post(validateListing, isLoggedIn,
    upload.single('listing[image]'),  //image save to cloudinary
    wrapAsync(listingController.createListings)
  );





// new listing route
router.get('/new', isLoggedIn, listingController.newFormRender);
router.route("/:id")
  // Show route
  .get(wrapAsync(listingController.showRoutes))

  // Update route
  .put(
    isLoggedIn,
    isOwner,
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(listingController.updateListing)
  )

  // Delete route
  .delete(
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.deleteListing)
  );
//update route


//edit route
router.get('/:id/edit',
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm))


module.exports = router;

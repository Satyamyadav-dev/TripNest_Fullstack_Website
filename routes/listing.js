// routes/listing.js

const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const { listingSchema, reviewSchema } = require('../schema.js');
const Listing = require('../models/listing.js');
const { isLoggedIn, isOwner, validateListing } = require('../middleware.js');
const listingController = require("../controller/listing.js");

const multer = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// INDEX + CREATE
router.route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    validateListing,                     // ✔ FIXED: placed BEFORE multer
    upload.single('listing[image]'),
    wrapAsync(listingController.createListing)
  );

// NEW
router.get('/new', isLoggedIn, listingController.newFormRender);

// SHOW + UPDATE + DELETE
router.route("/:id")
  .get(wrapAsync(listingController.showRoutes))
  .put(
    isLoggedIn,
    isOwner,
    validateListing,                     // ✔ FIXED: placed BEFORE multer
    upload.single('listing[image]'),
    wrapAsync(listingController.updateListing)
  )
  .delete(
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.deleteListing)
  );

// EDIT
router.get('/:id/edit',
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

module.exports = router;

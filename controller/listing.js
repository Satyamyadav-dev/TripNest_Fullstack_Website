// controller/listing.js

const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  try {
    let allListings = await Listing.find({});
    return res.render('listings/index.ejs', {
      allListings,
      MAP_TOKEN: process.env.MAP_TOKEN
    });
  } catch (err) {
    req.flash("error", "Failed to load listings");
    return res.redirect("/listings");
  }
};

module.exports.newFormRender = (req, res) => {
  return res.render('listings/new.ejs');
};

module.exports.showRoutes = async (req, res) => {
  try {
    let { id } = req.params;
    const listing = await Listing.findById(id)
      .populate({
        path: "reviews",
        populate: { path: "author" }
      })
      .populate("owner");

    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    return res.render('listings/show.ejs', { 
      listing, 
      MAP_TOKEN: process.env.MAP_TOKEN 
    });

  } catch (err) {
    req.flash("error", "Failed to load listing");
    return res.redirect("/listings");
  }
};

module.exports.createListing = async (req, res) => {
  try {
    if (!req.file) {
      req.flash("error", "Image is required");
      return res.redirect("/listings/new");
    }

    let response = await geocodingClient.forwardGeocode({
      query: req.body.listing.location,
      limit: 1
    }).send();

    if (!response.body.features || response.body.features.length === 0) {
      req.flash("error", "Invalid location");
      return res.redirect("/listings/new");
    }

    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    newListing.geometry = response.body.features[0].geometry;

    await newListing.save();
    req.flash('success', "New listing created successfully!");
    return res.redirect('/listings');

  } catch (err) {
    req.flash("error", err.message);
    return res.redirect("/listings/new");
  }
};

module.exports.renderEditForm = async (req, res) => {
  try {
    let { id } = req.params;
    let listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url.replace("/upload", "/upload/w_250,c_fill");
    return res.render('listings/edit.ejs', { listing, originalImageUrl });

  } catch (err) {
    req.flash("error", "Failed to load listing for editing");
    return res.redirect("/listings");
  }
};

module.exports.updateListing = async (req, res) => {
  try {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    if (req.file) {
      listing.image = { url: req.file.path, filename: req.file.filename };
      await listing.save();
    }

    req.flash('success', "Listing updated!");
    return res.redirect(`/listings/${id}`);

  } catch (err) {
    req.flash("error", "Failed to update listing");
    return res.redirect("/listings");
  }
};

module.exports.deleteListing = async (req, res) => {
  try {
    let { id } = req.params;
    const listing = await Listing.findByIdAndDelete(id);

    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    req.flash('success', "Listing deleted!");
    return res.redirect('/listings');

  } catch (err) {
    req.flash("error", "Failed to delete listing");
    return res.redirect("/listings");
  }
};

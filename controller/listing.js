const Listing = require("../models/listing.js")
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  try {
    let allListings = await Listing.find({});
    res.render('listings/index.ejs', { allListings, MAP_TOKEN: process.env.MAP_TOKEN  });
  } catch (err) {
    req.flash("error", "Failed to load listings");
    res.redirect("/");
  }
};

module.exports.newFormRender = (req, res) => {
  res.render('listings/new.ejs');
};

module.exports.showRoutes = async (req, res) => {
  try {
    let { id } = req.params;
    const listing = await Listing.findById(id)
      .populate({
        path: "reviews",
        populate: {
          path: "author",
        },
      })
      .populate("owner");
    
    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }
    
    res.render('listings/show.ejs', { listing, MAP_TOKEN: process.env.MAP_TOKEN });
  } catch (err) {
    req.flash("error", "Failed to load listing");
    res.redirect("/listings");
  }
};

module.exports.createListings = async (req, res, next) => {
  try {
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
    res.redirect('/listings');
    
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/listings/new");
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
    
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250,c_fill");
    res.render('listings/edit.ejs', { listing, originalImageUrl });
    
  } catch (err) {
    req.flash("error", "Failed to load listing for editing");
    res.redirect("/listings");
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
    
    if (typeof req.file !== "undefined") {
      let url = req.file.path;
      let filename = req.file.filename;
      listing.image = { url, filename };
      await listing.save();
    }
    
    req.flash('success', "Listing updated!");
    res.redirect(`/listings/${id}`);
    
  } catch (err) {
    req.flash("error", "Failed to update listing");
    res.redirect(`/listings/${req.params.id}/edit`);
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
    res.redirect('/listings');
    
  } catch (err) {
    req.flash("error", "Failed to delete listing");
    res.redirect("/listings");
  }
};
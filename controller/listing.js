const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// ==============================
// INDEX ROUTE
// ==============================
module.exports.index = async (req, res) => {
  let allListings = await Listing.find({});
  res.render('listings/index.ejs', { allListings });
};

// ==============================
// NEW FORM
// ==============================
module.exports.newFormRender = (req, res) => {
  res.render('listings/new.ejs');
};

// ==============================
// SHOW ROUTE
// ==============================
module.exports.showRoutes = async (req, res) => {
  let { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner");

  // 👉 Important fix
  if (!listing) {
    req.flash("error", "listing you requested for does not exist");
    return res.redirect("/listings");
  }

  res.render('listings/show.ejs', { listing });
};

// ==============================
// CREATE LISTING
// ==============================
module.exports.createListings = async (req, res, next) => {
  let response = await geocodingClient.forwardGeocode({
    query: req.body.listing.location,
    limit: 1
  }).send();

  let url = req.file.path;
  let filename = req.file.filename;

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  newListing.geometry = response.body.features[0].geometry;

  await newListing.save();

  req.flash('success', "New listing is created successfully!");
  res.redirect('/listings');
};

// ==============================
// EDIT FORM
// ==============================
module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;

  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "listing you requested for does not exist");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url.replace("/upload", "/upload/w_250,c_fill");

  res.render('listings/edit.ejs', { listing, originalImageUrl });
};

// ==============================
// UPDATE LISTING
// ==============================
module.exports.updateListing = async (req, res) => {
  let { id } = req.params;

  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "listing you requested for does not exist");
    return res.redirect("/listings");
  }

  await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (req.file) {
    listing.image = { url: req.file.path, filename: req.file.filename };
    await listing.save();
  }

  req.flash('success', "Listing updated!");
  res.redirect(`/listings/${id}`);
};

// ==============================
// DELETE LISTING
// ==============================
module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;

  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "listing you requested for does not exist");
    return res.redirect("/listings");
  }

  await Listing.findByIdAndDelete(id);

  req.flash('success', "Listing deleted!");
  res.redirect('/listings');
};

const Listing = require("../models/listing.js")
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  let allListings = await Listing.find({})
  // console.log(allListings)
  res.render('listings/index.ejs', { allListings })

}

module.exports.newFormRender = (req, res) => {
  res.render('listings/new.ejs');
}

module.exports.showRoutes = async (req, res) => {
  let { id } = req.params
  const listing = await Listing.findById(id).
    populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    }).
    populate("owner")
  // if(!listing){
  //   req.flash("error", "listing that you have requested doesn't exit")
  //   res.redirect("/listings")
  // }
  console.log(listing);
  res.render('listings/show.ejs', { listing })

}

module.exports.createListings = async (req, res, next) => {
  let response = await geocodingClient.forwardGeocode({  // forward geocoding to convet text loc to long and lati
    query: req.body.listing.location,
    limit: 1
  })
    .send()
  // res.send("done!")


  let url = req.file.path;
  let filename = req.file.filename;
  // let {title, description, image, price, location, country} = req.body  -> 1st method

  const newListing = new Listing(req.body.listing)
  newListing.owner = req.user._id;
  newListing.image = { url, filename }
  newListing.geometry = response.body.features[0].geometry

  let listingSaved = await newListing.save();
  console.log(listingSaved);
  req.flash('success', "New listing is created Sucessfully!")  //when new listing will create show this msg
  res.redirect('/listings')

}

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params
  let listing = await Listing.findById(id)
  if (!listing) {
    req.flash("error", "listing you requested for does not exist");
    res.redirect("/listings")

  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250,c_fill");
  res.render('listings/edit.ejs', { listing, originalImageUrl })

}

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename }
    await listing.save();
  }

  req.flash('success', "listing updated!")
  res.redirect(`/listings/${id}`);
}

module.exports.deleteListing = async (req, res) => {
  let { id } = req.params
  await Listing.findByIdAndDelete(id)
  req.flash('success', "listing deleted!")
  res.redirect('/listings')
}
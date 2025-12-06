const Listing = require("../models/listing.js")
const Review = require("../models/review.js")

module.exports.createReview = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    
    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }
    
    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    
    req.flash('success', "New review created!");
    res.redirect(`/listings/${id}`);
    
  } catch (err) {
    req.flash("error", "Failed to create review");
    res.redirect(`/listings/${req.params.id}`);
  }
};

module.exports.destroyReview = async (req, res) => {
  try {
    const { id, reviewId } = req.params;
    
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }
    
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    
    req.flash('success', "Review deleted!");
    res.redirect(`/listings/${id}`);
    
  } catch (err) {
    req.flash("error", "Failed to delete review");
    res.redirect(`/listings/${req.params.id}`);
  }
};
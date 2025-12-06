const Listing = require("../models/listing.js")
const Review = require("../models/review.js")

module.exports.createReview = async (req, res, next) => {  // ✅ Add 'next'
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    
    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");  // ✅ Add return
    }
    
    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    
    req.flash('success', "New review created!");
    return res.redirect(`/listings/${id}`);  // ✅ Add return
    
  } catch (err) {
    req.flash("error", "Failed to create review");
    return next(err);  // ✅ Use next(err) instead
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
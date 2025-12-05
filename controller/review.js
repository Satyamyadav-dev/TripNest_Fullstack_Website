const Listing = require("../models/listing.js")
const Review = require("../models/review.js")

module.exports.createReview = async (req, res) => {
  const { id } = req.params;            // ✅ comes from mergeParams: true
  const listing = await Listing.findById(id);

  const newReview = new Review(req.body.review);
  newReview.author = req.user._id; 
  console.log("req.user:", req.user)     // ✅ correct now

  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();

  req.flash('success', "New review created!");
  res.redirect(`/listings/${id}`);
}

module.exports.destroyReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash('success', "review deleted!")
  res.redirect(`/listings/${id}`);
}
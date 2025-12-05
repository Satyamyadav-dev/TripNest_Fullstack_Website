const Listing = require("./models/listing.js")
const Review = require("./models/review.js")
const ExpressError = require('./utils/ExpressError.js')
const { listingSchema, reviewSchema } = require('./schema.js')

module.exports.isLoggedIn = (req, res, next) => {
  // console.log(req, req.originalUrl);
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl  //  correct method
    req.flash("error", "You must be logged in to create listings");
    return res.redirect("/login"); //  return added
  }
  next();

}

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next()
}


module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
  if (!listing.owner._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the owner")
    return res.redirect(`/listings/${id}`)
  }
  next();
}

module.exports.validateListing = (req, res, next) => {           // for server side validation 
  const { error } = listingSchema.validate(req.body)

  if (error) {
    const msg = error.details.map(el => el.message).join(', ');   //throw every individual element error msg
    throw new ExpressError(400, msg)
  } else {
    next()
  }

}


module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(', ');
    throw new ExpressError(400, msg);
  } else {
    next();
  }
};

module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  const review = await Review.findById(reviewId)
  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the author of the review")
    return res.redirect(`/listings/${id}`)
  }
  next();
}

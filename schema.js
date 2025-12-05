//server side validation

const Joi = require('joi');

module.exports.listingSchema = Joi.object({    // for listings validation
listing : Joi.object({
    title : Joi.string().required(),
    description : Joi.string().required(),
    image: Joi.string().allow("", null),
    price: Joi.number().min(0).required(),  
    location: Joi.string().required(),
    country: Joi.string().required()

}).required()
})

module.exports.reviewSchema = Joi.object({ //for review validation
 review : Joi.object({
rating : Joi.number().required().min(1).max(5),
    comment : Joi.string().required()
 }).required()

})
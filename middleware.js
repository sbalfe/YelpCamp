 const {campgroundSchema, reviewSchema} = require('./schemas.js')
 const ExpressError= require('./utils/ExpressError')
 const Campground = require('./models/campground');
 const Review = require('./models/review');

 

 module.exports.isLoggedIn = (req, res, next) => {
    /* req.user contains the serialized information about the current user , this is session information*/
     console.log(req.body);
    /* checks if the user has actually logged into some account otherwise redirect to login page and flash */

    /* req.path and req.originalUrl respond to the additional /path being added and the entire path as a whole respectively. */
    req.session.returnTo = req.originalUrl; /* just add it to the session to be used when redirecting */
    if (!req.isAuthenticated()){
        req.flash('error', 'You must log in to perform this action');
        return res.redirect('/login')
    }
    next();
 }

module.exports.validateCampground = (req, res, next) => {
      /* throws errors for us to catch if there are invalid properties against the schema. */

    const { error } = campgroundSchema.validate(req.body)
    console.log(req.body);
    if (error){
        /* join together each of the messages. each message is returned and formed a new array that is seperate by each error by a comma */
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg,400);
    }
    else{
        next();
    }
} 

module.exports.isAuthor = async(req, res, next) => {

    const {id} = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)){
        req.flash('error', 'Unauthorized attempt to edit campground');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.isReviewAuthor = async(req, res, next) => {

    
    const {id, reviewID} = req.params;
    const review = await Review.findById(reviewID);
    if (!review.author.equals(req.user._id)){
        req.flash('error', 'Unauthorized attempt to delete review');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.validateReview = (req, res, next) => {

    /* checks it against the JOI schema validation */
    const { error } = reviewSchema.validate(req.body);

    /* catch any error otherwise go the next middeleware */
     if (error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg,400);
    }
    else{
        next();
    }

}


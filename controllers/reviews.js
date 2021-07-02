const Review = require('../models/review');
const Campground = require('../models/campground');


module.exports.createReview = async (req,res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review); /* review is an array in itself with the sub items stored as attributes */
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async(req, res)=> {
    const {id, reviewID} = req.params;
    /* pull will update the reviews array and remove the review id from the specified campground as it stored it as a relation */
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewID}})
    await Review.findByIdAndDelete(reviewID);

    req.flash('success', ' Successfully deleted review')
    res.redirect(`/campgrounds/${id}`);
}
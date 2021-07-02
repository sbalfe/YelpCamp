const express = require('express')
const router = express.Router({mergeParams: true}); /* merge params allows the request url parameters to be accessed here */
const Review = require('../models/review');
const catchAsync = require('../utils/catchAsync')
const Campground = require('../models/campground');
const reviews = require('../controllers/reviews');
const {isLoggedIn, validateReview, isReviewAuthor } = require('../middleware')


router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));



router.delete('/:reviewID', isLoggedIn, isReviewAuthor ,catchAsync(reviews.deleteReview))

module.exports = router;
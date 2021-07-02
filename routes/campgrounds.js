const express = require('express')
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const campgrounds = require('../controllers/campgrounds')
const Campground = require('../models/campground');
const multer = require('multer');
const {storage} = require('../cloudinary');
const upload = multer({storage});

const {isLoggedIn, validateCampground, isAuthor} = require('../middleware')

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('images') , validateCampground, catchAsync(campgrounds.createCampground))


/* middleware called on a route by adding as a parameter */

router.get('/new', isLoggedIn, catchAsync(campgrounds.newCampgroundForm))

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('images') ,validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor,  catchAsync(campgrounds.deleteCampground))


router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))


module.exports = router;

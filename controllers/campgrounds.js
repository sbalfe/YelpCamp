const Campground = require('../models/campground');
const {cloudinary} = require('../Cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geoCoder = mbxGeocoding({accessToken: mapBoxToken});
/* campground index page */
module.exports.index = async (req,res) => {

   const campgrounds = await Campground.find({});
   res.render('campgrounds/index', {campgrounds});

}

module.exports.newCampgroundForm = async (req,res) => {
   /* checks if the user has actually logged into some account otherwise redirect to login page and flash */

   res.render('campgrounds/new')

}

module.exports.createCampground = async (req,res,next) => {

   const geoData = await geoCoder.forwardGeocode({
      query: req.body.campground.location,
      limit: 1
   }).send()

   /* the post request must contain a body otherwise its invalid */
   const campground = new Campground(req.body.campground);
   campground.geometry = geoData.body.features[0].geometry;

   /* create an array of all the images and insert into the array bit of the mongodb collection  */
   campground.images = req.files.map(f => ({url: f.path, filename: f.filename}));

   campground.author = req.user._id; /* when creating a new campground add the user id to the author which is filled out with populate. */

   await campground.save(); /* call .save() as we are creating a new instance of the model */
   console.log(campground);
   req.flash('success','Created a new campground successfully');
   res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground = async (req,res) => {

   const campground = await Campground.findById(req.params.id).populate({
      path: 'reviews',
      populate: { /* nested population of the author of each of the reviews that are populated from the campground itself. */
         path: 'author'
      }
   }).populate('author'); /* populate to fetch the data from the reference */


   if (!campground){
      req.flash('error', 'Campground could not be found');
      res.redirect('/campgrounds');
   }
   res.render('campgrounds/show', {campground})

}

module.exports.renderEditForm = async (req, res) => {

   const {id} = req.params;
   const campground = await Campground.findById(id)
   if (!campground){
      req.flash('error', 'Campground could not be found');
      res.redirect('/campgrounds');
   }

   res.render('campgrounds/edit', {campground})
}

module.exports.updateCampground = async (req,res,next) => {

   /* catch errors with form updates.  */

   const {id} = req.params;
   console.log(req.body);

   /* must await the the update otherwise stuff is undefined below */
   const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
   const img= req.files.map(f => ({url: f.path, filename: f.filename}));
   campground.images.push(...img); // spreads out all the items of the array so it doesnt nest each array that is passed in.
   if (req.body.deleteImages){
      for (let filename of req.body.deleteImages){
         await cloudinary.uploader.destroy(filename);
      }
      /* delete any image that the user has speciifed in the delete images array*/
      await campground.updateOne({$pull: {images : {filename: {$in: req.body.deleteImages}}}})
      console.log(campground)
   }
   campground.save();
   req.flash('success', 'updated campground successfully');
   res.redirect(`/campgrounds/${campground._id}`);

}

module.exports.deleteCampground = async (req, res) => {
   const {id} = req.params;
   await Campground.findByIdAndDelete(id);
   req.flash('success', ' Successfully deleted campground');
   res.redirect('/campgrounds')


}

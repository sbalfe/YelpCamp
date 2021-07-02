const mongoose = require('mongoose');
const Review = require('./review.js')
const Schema = mongoose.Schema; /* Slightly shorten it */
// https://res.cloudinary.com/shriller44/image/upload/v1624918500/YelpCamp/lmrj4k0tgltv3ttcmnro.png

const ImageSchema = new Schema({
    url: String,
    filename: String
})

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
})

const opts = {toJSON: {virtuals: true}};

const CampgroundSchema = new Schema({

    title: String,
    images: [ImageSchema],
    price: Number,
    geometry: {
        type:{
            type: String,
            enum : ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    description: String, 
    location: String,
    author:{

        type: Schema.Types.ObjectId,
        ref: 'User' /* populate from the user model */


    },
    reviews: [
        {
            /* an object id from the review model */
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],


}, opts)

/* query middleware that passes in the document submitted

other middleware can refer to the this keyword to refer to specific document to be removed. 
*/
CampgroundSchema.post('findOneAndDelete', async function(doc) {

    /* doc is just a reference of the json for the campground containnig the ids of reviews.*/

    if (doc) {

        await Review.deleteMany({

            /* remove all the ids that are in the doc.reviews to cascade on delete for integrity  */
            _id:{
                $in: doc.reviews
            }

        })

    }

})
CampgroundSchema.virtual('properties.popUpMarkup').get(function() {
    return `<a href = "/campgrounds/${this._id}">${this.title}</a>`;
})

module.exports = mongoose.model('Campground', CampgroundSchema );


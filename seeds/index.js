
/* Warning wipes the campgrounds table entirely. */
const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities= require('./cities');
const {descriptors, places} = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database Connected");
})

const sample = arr => {
    return arr[Math.floor(Math.random() * arr.length)]
};

const seedDB = async () => {

    /* Delete the entire database contents */
    await Campground.deleteMany({});

    for (let i = 0; i < 200; i++){

        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() *20)+10;
 
        const c = new Campground({

            author: '600f2ffcece1e94658f6679b',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            geometry: {
                type: "Point",
                coordinates: [cities[random1000].longitude, cities[random1000].latitude]
            },
            images: [
                {

                    url: 'https://res.cloudinary.com/shriller44/image/upload/v1624919375/YelpCamp/iwe2h9olt9xtss6s2whn.jpg',
                    filename: 'YelpCamp/iwe2h9olt9xtss6s2whn'
                },
                {

                    url: 'https://res.cloudinary.com/shriller44/image/upload/v1624919375/YelpCamp/rimzlvsyd4x5z3jb8wb1.png',
                    filename: 'YelpCamp/rimzlvsyd4x5z3jb8wb1'
                }
            ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Debitis ipsum dolor modi vero, error blanditiis necessitatibus ratione odit quos, rem mollitia cum ea. Magni, veniam. Vitae doloremque amet assumenda ut',
            price /* shorthand as price is defined here it does price: price for us */
        });

        await c.save();
    }
    
   
}

seedDB().then(() => {

    /* Once seeded, close the connection */
    mongoose.connection.close();

});
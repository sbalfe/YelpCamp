if (process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

console.log(process.env.CLOUDINARY_CLOUD_NAME); // prints the variable in the .env file.
/******* REQUIRE SHIT*******/

const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError= require('./utils/ExpressError')
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const localStrat = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet')
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
const mongoose  = require('mongoose');
const MongoStore = require('connect-mongo')

/***************************/

/********** MONGO DB CONNECTION ***********/
mongoose.connect(dbUrl, {
    useNewUrlParser: true, 
    useCreateIndex: true, 
    useUnifiedTopology: true,
    useFindAndModify: false /* deprecated therefore force set to false */
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database Connected");
})
/******************************************/

const app = express();
app.engine('ejs', ejsMate);

/******* SET SHIT ***********/
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.set('public', path.join(__dirname, '/public'));
/******************************/

/********* MIDDLEWARE *********/
app.use(express.urlencoded({extended: true /* include more than just strings */}));
app.use(methodOverride('_method'));
app.use(express.static('public')); /* serve the public directory for css and js scripts/sheets for example. */

/*  sanitize removes special characters from mongo requests to prevent mongo injection from occuring.*/
app.use(mongoSanitize());

/* has a content secuirty policy which filters all what can be renderede on the page, such as certain fonts and images
* loaded from locations beyond app, which is required as by  self */
// const scriptSrcUrls = [
//     "https://stackpath.bootstrapcdn.com/",
//     "https://api.tiles.mapbox.com/",
//     "https://api.mapbox.com/",
//     "https://kit.fontawesome.com/",
//     "https://cdnjs.cloudflare.com/",
//     "https://cdn.jsdelivr.net",
// ];
// const styleSrcUrls = [
//     "https://kit-free.fontawesome.com/",
//     "https://stackpath.bootstrapcdn.com/",
//     "https://api.mapbox.com/",
//     "https://api.tiles.mapbox.com/",
//     "https://fonts.googleapis.com/",
//     "https://use.fontawesome.com/",
// ];
// const connectSrcUrls = [
//     "https://api.mapbox.com/",
//     "https://a.tiles.mapbox.com/",
//     "https://b.tiles.mapbox.com/",
//     "https://events.mapbox.com/",
// ];
// const fontSrcUrls = [];
// app.use(
//     helmet.contentSecurityPolicy({
//         directives: {
//             defaultSrc: [],
//             connectSrc: ["'self'", ...connectSrcUrls],
//             scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
//             styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//             workerSrc: ["'self'", "blob:"],
//             objectSrc: [],
//             imgSrc: [
//                 "'self'",
//                 "blob:",
//                 "data:",
//                 "https://res.cloudinary.com/douqbebwk/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
//                 "https://images.unsplash.com/",
//             ],
//             fontSrc: ["'self'", ...fontSrcUrls],
//         },
//     })
// );
/************* Session *******************/

const secret = process.env.SECRET ||'secret';

// store creates instance in mongostore to store the config of each session rather than in the web.
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: secret
    }
})

store.on("error", function(e) {
    console.log("session store error");
})

const sessionConfig = {
    store,
    name: 'fat cunt',
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        //secure: true, // can only be sent over https
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, /* expires week from now */
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true, /* prevent cross site scripting */
    }
    /*store: mongo store */ /* use this as memory store is temporary and not persistent on server down time */
}

app.use(session(sessionConfig))
app.use(flash());

/*********** Passport  *************/
app.use(passport.initialize(undefined)); 

/* Passport will maintain persistent login sessions. In order for persistent sessions to work, the authenticated user must be
 serialized to the session, and deserialized when subsequent requests are made. */
/* middleware for persistent login sessions essentially. */
app.use(passport.session(undefined));

/* use the local strategy which we chose as method and pass in the user model as the authentication*/
passport.use(new localStrat(User.authenticate())); /* authenticate generates a function required in the local strat. */

passport.serializeUser(User.serializeUser()); /* method to store the current user in a given session */
passport.deserializeUser(User.deserializeUser()); /* exit the session when the user specifies, this gives passport the information required these 2*/
/*********************************/

/******* Flash ****************/

app.use((req, res, next) => { /* no need to pass flash messages as parameters using this */
    res.locals.currentUser = req.user; /* adds these variables to all templates */
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
})


/********* Main Route middleware*********/
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);

/**********************************/

/******** OTHER ROUTES ************/


app.get('/', (req, res) => {
    res.render('home');
})

/* accept any http method on any path, 404 error incorrect url */
app.all('*', (req, res, next) => {

    /* use our error util class and pass this on to the error handler. */
    next(new ExpressError('page not found', 404));

})
/***********************************/

/*********** ERROR HANDLING ********/
app.use((err, req, res, next) => {

    /* ensure to keep default values. */
    const {statusCode = 500} = err;

    /* default error message if none present */
    if (!err.message) err.message = 'Oh No, something Went Wrong';
    
    /* render custom error page passing in the correct error values */
    res.status(statusCode).render('error', {err});
})
/*************************** */

/******** PORT TO LISTEN  *******/
app.listen(3001,  () => {
    console.log("Serving on port 3001")
})
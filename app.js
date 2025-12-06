if(process.env.NODE_ENV != "production"){
  require('dotenv').config()
}

const express = require('express');
const app = express();
const path = require('path')
const mongoose = require("mongoose")
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const session = require("express-session")
const MongoStore = require('connect-mongo');
const flash = require("connect-flash")
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user.js')

const ExpressError = require('./utils/ExpressError.js')
const listingsRouter = require('./routes/listing.js')
const reviewRouter = require('./routes/review.js');
const userRouter = require('./routes/user.js')

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.engine('ejs', ejsMate)
app.use(express.static(path.join(__dirname, "public")))

const dbUrl = process.env.ATLASDB_URL;

async function main() {
    await mongoose.connect(dbUrl);
}

main()
.then(() => {
    console.log("✅ connected to db");
})
.catch((err) => {
    console.log(err);
});

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET
    },
    touchAfter: 2 * 24 * 3600,
});

store.on('error', (err) => {
    console.log('Error in MONGO SESSION STORE ', err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 3,
        maxAge: 1000 * 60 * 60 * 24 * 3,
        httpOnly: true
    },
};

console.log("Connected to DB:", dbUrl);

app.use(session(sessionOptions))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) =>{
  res.locals.success = req.flash("success")
  res.locals.error = req.flash("error")
  res.locals.currUser = req.user;
  next();
})

// ✅ FIXED: Added return statement
app.get("/", (req, res) => {
    return res.redirect("/listings");
});

app.use('/listings', listingsRouter)
app.use('/listings/:id/reviews', reviewRouter)
app.use('/', userRouter)

// ✅ FIXED: Changed to app.all('*') for catch-all
app.all('*', (req, res, next) => {
    next(new ExpressError(404, "Page Not Found !"));
});

// ✅ FIXED: Improved error handler with headersSent check
app.use((err, req, res, next) => {
    // Prevent double response if headers already sent
    if (res.headersSent) {
        console.error('Headers already sent, delegating to default error handler');
        return next(err);
    }
    
    let {statusCode = 500, message = "Something Went Wrong"} = err;
    
    // Log error details for debugging
    console.error('Error occurred:', {
        statusCode,
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method
    });
    
    // Send error response
    res.status(statusCode).render('listings/error.ejs', { err });
});

const port = process.env.PORT || 8080;

app.listen(port, '0.0.0.0', () => {
  console.log("🚀 Server is running on port", port);
});
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
const localStrategy = require('passport-local')
const User = require('./models/user.js')

const ExpressError = require('./utils/ExpressError.js')
const { listingSchema, reviewSchema } = require('./schema.js')
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
console.log("DB URL:", dbUrl ? "Present" : "Missing");

// MongoDB Connection
mongoose.connect(dbUrl)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
  })
  .catch((err) => {
    console.log("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// Session Store Configuration
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET || "fallbacksecret123",
  },
  touchAfter: 24 * 3600,
});

store.on('error', function(error) {
  console.log('SESSION STORE ERROR:', error);
});

const sessionOptions = {
  store,
  name: 'sessionId',
  secret: process.env.SECRET || 'fallbacksecret123',
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  }
};

app.use(session(sessionOptions))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success")
  res.locals.error = req.flash("error")
  res.locals.currUser = req.user;
  next();
})

app.use('/listings', listingsRouter)
app.use('/listings/:id/reviews', reviewRouter);
app.use('/', userRouter)

// Error handling middleware
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render('listings/error.ejs', { err })
});

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log("🚀 Server is running on port", port);
});
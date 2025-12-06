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

// ✅ DEBUG MIDDLEWARE STARTS HERE
app.use((req, res, next) => {
  console.log(`=== ${req.method} ${req.originalUrl} ===`);
  next();
});

// Prevent multiple responses
app.use((req, res, next) => {
  let responseSent = false;
  
  const originalRender = res.render;
  res.render = function(...args) {
    if (responseSent) {
      console.error('🚨 Multiple render attempt prevented');
      return;
    }
    responseSent = true;
    console.log(`📄 Rendering: ${args[0]}`);
    return originalRender.apply(this, args);
  };
  
  const originalRedirect = res.redirect;
  res.redirect = function(...args) {
    if (responseSent) {
      console.error('🚨 Multiple redirect attempt prevented');
      return;
    }
    responseSent = true;
    console.log(`🔀 Redirecting to: ${args[0]}`);
    return originalRedirect.apply(this, args);
  };
  
  next();
});
// ✅ DEBUG MIDDLEWARE ENDS HERE

app.get("/", (req, res) => {
    res.redirect("/listings");
});

app.use('/listings', listingsRouter)
app.use('/listings/:id/reviews', reviewRouter)
app.use('/', userRouter)

app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found !"));
});

app.use((err, req, res, next) => {
    let {statusCode = 500, message = "Something Went Wrong"} = err;
    res.status(statusCode).render('listings/error.ejs', { err });
});

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log("🚀 Server is running on port", port);
});
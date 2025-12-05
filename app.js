if(process.env.NODE_ENV !=  "production"){
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
const user = require('./models/user.js');
const userRouter = require('./routes/user.js')

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))
app.use(express.urlencoded({ extended: true }))   // to take data from frontend 
app.use(methodOverride('_method'))
app.engine('ejs', ejsMate)
app.use(express.static(path.join(__dirname, "public"))) // for css/html/js files

const dbUrl = process.env.ATLASDB_URL;
console.log("DB URL:", dbUrl);

mongoose.connect(dbUrl)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
  })
  .catch((err) => {
    console.log("❌ MongoDB connection error:", err.message);
  });

  const store = MongoStore.create({
  mongoUrl : dbUrl,
  crypto: {
    secret : process.env.SECRET,
  },
  touchAfter: 24 * 3600, 
})

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie : {
    expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge : 7 * 24 * 60 * 60 * 1000,
    httpOnly : true,
  }
}

store.on("error", ()=>{
  console.log("Error in mongo session store", err);
})

// app.get('/', (req, res) => {
//   res.send("this is root")
// })



app.use(session(sessionOptions))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) =>{
  res.locals.success = req.flash("success")
  res.locals.error = req.flash("error")
  res.locals.currUser = req.user;
  next();
})

// app.get('/demoUser', async(req,res)=>{

//   const fakeUser = new User({
//     email: "student@gmail.com",
//     username : "apna-student"
//   })
// const registeredUser =  await User.register(fakeUser, "helloworld")
// res.send(registeredUser)

// })




app.use('/listings', listingsRouter)    // all listings routes in routes folder
app.use('/listings/:id/reviews', reviewRouter);  // all listings routes in routes folder
app.use('/', userRouter)


// app.get('/testlisting', async (req,res) =>{
//   let SampleListing = new Listing ({
//     title : "villa with beach", 
//     description: "enjoy your day",
//     price : 7000,
//     location: 'Mumbai',
//     country:'India'
//   })

//   await SampleListing.save()
//   .then((result) =>{
//     console.log("inserted succesfully");
//   }).catch((err) =>{
//     console.log(err);
//   })
//  res.send("success")

// })


//  Catch-all for undefined routes
// app.all('*', (req, res, next) => {
//   next(new ExpressError(404, "Page not found"));
// });


// proper error handler
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render('listings/error.ejs', { err })

});


app.listen(8080, (req, res) => {
  console.log("server is listening to 8080");
})


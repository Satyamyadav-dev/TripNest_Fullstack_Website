if (process.env.NODE_ENV != "production") {
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

const dbUrl = process.env.ATLASDB_URL || process.env.ATLAS_DB_URL;

main()
    .then(() => {
        console.log("connected to db");
        startServer();
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.engine('ejs', ejsMate)
app.use(express.static(path.join(__dirname, "public")))

async function startServer() {
    // Create a MongoStore using the already-established mongoose client when possible.
    // Prefer passing a `clientPromise` (a Promise resolving to the native MongoClient)
    // which connect-mongo will consume. Fall back to `mongoUrl` if no client is available.
    const client = (mongoose.connection.getClient && mongoose.connection.getClient()) || null;

    let storeConfig = {};
    if (client) {
        storeConfig.clientPromise = Promise.resolve(client);
    } else if (dbUrl) {
        storeConfig.mongoUrl = dbUrl;
    } else {
        console.error('No Mongo client or mongoUrl available for session store.');
    }
    let store;
    try {
        store = MongoStore.create({
            ...storeConfig,
            touchAfter: 2 * 24 * 3600,
        });
    } catch (e) {
        console.error('Failed to create MongoStore:', e);
        store = null;
    }

    if (store && store.on) {
        store.on('error', (err) => {
            console.log('Error in MONGO SESSION STORE ', err);
        });
    }


    const sessionOptions = {
        store: store || undefined,
        secret: process.env.SECRET || "mysupersecret123",
        resave: false,
        saveUninitialized: true,
        cookie: {
            expires: Date.now() + 1000 * 60 * 60 * 24 * 3,
            maxAge: 1000 * 60 * 60 * 24 * 3,
            httpOnly: true
        },
    };

    app.use(session(sessionOptions));
    app.use(flash());

    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(new LocalStrategy(User.authenticate()));
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

    app.use((req, res, next) => {
        res.locals.success = req.flash("success");
        res.locals.error = req.flash("error");
        res.locals.currUser = req.user;
        next();
    });

    app.get("/", (req, res) => {
        res.redirect("/listings");
    });

    app.use('/listings', listingsRouter);
    app.use('/listings/:id/reviews', reviewRouter);
    app.use('/', userRouter);

    app.use((req, res, next) => {
        next(new ExpressError(404, "Page Not Found !"));
    });

    app.use((err, req, res, next) => {
        if (res.headersSent) {
            return next(err);
        }
        let { statusCode = 500, message = "Something Went Wrong" } = err;
        console.error(err);
        res.status(statusCode).render('error', { err });
    });

    const port = process.env.PORT || 8080;
    app.listen(port, () => {
        console.log("Server is listening on port", port);
    });

}
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const User = require("./models/user");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const passportLocal = require("passport-local");
const poemRoutes = require("./routes/poems");
const userRoutes = require("./routes/users");
const app = express();

const configSessions = {
    secret: "bytetask",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
}

//setting up EJS
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//middleware
app.use(session(configSessions));
app.use(flash());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

passport.use(new passportLocal(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public")));
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;

    next();
})

//setting up express router
app.use("/poems", poemRoutes);
app.use("/", userRoutes);

mongoose.connect("mongodb://127.0.0.1:27017/byteTask")
    .then(() => {
        console.log("Database is connected");
    })
    .catch(e => {
        console.log("Connection Failed!");
        console.log(e);
    });

app.listen(3000, () => {
    console.log("Listening on Port 3000!");
})
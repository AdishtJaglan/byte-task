const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const User = require("./models/user");
const Poem = require("./models/poem");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const passportLocal = require("passport-local");
const { isLoggedIn, storeReturnTo, isAuthor } = require("./middleware");
const poemRoutes = require("./routes/poems");
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

mongoose.connect("mongodb://127.0.0.1:27017/byteTask")
    .then(() => {
        console.log("Database is connected");
    })
    .catch(e => {
        console.log("Connection Failed!");
        console.log(e);
    });

//form to create new poem
app.get("/poems/new", isLoggedIn, (req, res) => {
    res.render("poems/new", { head: "Create Poem" });
});

//show all poem
app.get("/poems", async (req, res) => {
    const poems = await Poem.find({}).populate("author");

    res.render("poems/index", { poems, head: "All Poems" });
});

//creating new poem
app.post("/poems", isLoggedIn, async (req, res) => {
    const newPoem = new Poem(req.body);
    newPoem.author = req.user._id;

    await newPoem.save();

    req.flash("success", "Created New Poem!");
    res.redirect(`/poems/${newPoem._id}`);
});

//viewing a poem
app.get("/poems/:id", async (req, res) => {
    const { id } = req.params;
    const poem = await Poem.findById(id).populate("author");

    res.render("poems/show", { poem, head: "Viewing Poem" });
});

//edit form
app.get("/poems/:id/edit", isLoggedIn, isAuthor, async (req, res) => {
    const { id } = req.params;
    const poem = await Poem.findById(id);

    res.render("poems/edit", { poem, head: "Edit Poem" });
});

//updating poem
app.put("/poems/:id", isLoggedIn, isAuthor, async (req, res) => {
    const { id } = req.params
    const updatedPoem = await Poem.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });

    await updatedPoem.save();

    req.flash("success", "Updated Poem!");
    res.redirect("/poems");
});

//deleting poems
app.delete("/poems/:id", isLoggedIn, isAuthor, async (req, res) => {
    const { id } = req.params;
    await Poem.findByIdAndDelete(id);

    req.flash("error", "Deleted Poem!");
    res.redirect("/poems");
});

//form to register
app.get("/register", (req, res) => {
    res.render("users/register", { head: "Register" });
});

//registering user
app.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    const user = new User({ username, email });
    const newUser = await User.register(user, password);

    req.login(newUser, err => {
        if (err) return next(err);

        req.flash("success", "Welcome! Logged In!");
        res.redirect("/poems");
    })
});

//form to login
app.get("/login", (req, res) => {
    res.render("users/login", { head: "Login Page" });
});

//logging in
app.post("/login", storeReturnTo, passport.authenticate("local", { failureFlash: true, failureMessage: "/login" }), (req, res) => {
    req.flash("success", "Successfully Logged In!");

    const redirectUrl = res.locals.returnTo || "/poems";
    delete req.session.returnTo;

    res.redirect(redirectUrl);
});

//logout 
app.get("/logout", (req, res) => {
    req.logOut(function (err) {
        if (err) {
            return next(err);
        }
        req.flash("success", "Succesfully Logged You Out!");

        res.redirect("/poems");
    });
});

app.listen(3000, () => {
    console.log("Listening on Port 3000!");
})
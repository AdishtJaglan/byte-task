const express = require("express");
const router = express.Router();
const { storeReturnTo } = require("../middleware");
const User = require("../models/user");
const passport = require("passport");

//form to register
router.get("/register", (req, res) => {
    res.render("users/register", { head: "Register" });
});

//registering user
router.post("/register", async (req, res) => {
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
router.get("/login", (req, res) => {
    res.render("users/login", { head: "Login Page" });
});

//logging in
router.post("/login", storeReturnTo, passport.authenticate("local", { failureFlash: true, failureMessage: "/login" }), (req, res) => {
    req.flash("success", "Successfully Logged In!");

    const redirectUrl = res.locals.returnTo || "/poems";
    delete req.session.returnTo;

    res.redirect(redirectUrl);
});

//logout 
router.get("/logout", (req, res) => {
    req.logOut(function (err) {
        if (err) {
            return next(err);
        }
        req.flash("success", "Succesfully Logged You Out!");

        res.redirect("/poems");
    });
});

module.exports = router;
const express = require("express");
const router = express.Router();
const Poem = require("../models/poem");
const { isLoggedIn, isAuthor } = require("../middleware");


//form to create new poem
router.get("/new", isLoggedIn, (req, res) => {
    res.render("poems/new", { head: "Create Poem" });
});

//show all poem
router.get("/", async (req, res) => {
    const poems = await Poem.find({}).populate("author");

    res.render("poems/index", { poems, head: "All Poems" });
});

//creating new poem
router.post("/", isLoggedIn, async (req, res) => {
    const newPoem = new Poem(req.body);
    newPoem.author = req.user._id;

    await newPoem.save();

    req.flash("success", "Created New Poem!");
    res.redirect(`/poems/${newPoem._id}`);
});

//viewing a poem
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const poem = await Poem.findById(id).populate("author");

    res.render("poems/show", { poem, head: "Viewing Poem" });
});

//edit form
router.get("/:id/edit", isLoggedIn, isAuthor, async (req, res) => {
    const { id } = req.params;
    const poem = await Poem.findById(id);

    res.render("poems/edit", { poem, head: "Edit Poem" });
});

//updating poem
router.put("/:id", isLoggedIn, isAuthor, async (req, res) => {
    const { id } = req.params
    const updatedPoem = await Poem.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });

    await updatedPoem.save();

    req.flash("success", "Updated Poem!");
    res.redirect("/poems");
});

//deleting poems
router.delete("/:id", isLoggedIn, isAuthor, async (req, res) => {
    const { id } = req.params;
    await Poem.findByIdAndDelete(id);

    req.flash("error", "Deleted Poem!");
    res.redirect("/poems");
});

module.exports = router;
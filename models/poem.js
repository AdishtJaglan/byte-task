const mongoose = require("mongoose");
const { Schema } = mongoose;

const PoemSchema = new Schema({
    poem: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
    }
});

module.exports = mongoose.model("Poem", PoemSchema);
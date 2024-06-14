const mongoose = require("mongoose");
const { Schema } = mongoose;
const masterdb= new Schema({
    category: { type: String, required: true },
    mod: [{
        title: { type: String, required: true },
        description: { type: String, required: true },
        image: { type: String, required: true }
    }]
});

module.exports = mongoose.model("Master", masterdb);

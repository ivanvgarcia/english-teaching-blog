// MONGOOSE/MODEL CONFIG
var mongoose = require("mongoose");

var blogSchema = new mongoose.Schema({
    title: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String,
    },
    level: String,
    image: String,
    body: String,
    created: {
        type: Date, 
        default: Date.now
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }    
    ]
});

module.exports = mongoose.model("Blog", blogSchema);
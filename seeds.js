var mongoose = require("mongoose");
var Blog     = require("./models/blog");
var Comment  = require("./models/comment");

var data = [
        {
            title: "Learn Nouns",
            author: "Ivan Garcia",
            image: "https://images.unsplash.com/photo-1531312631567-f589343b6e95?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=742fc82fba3b29edc86d743fc220172e&dpr=1&auto=format&fit=crop&w=1000&q=80&cs=tinysrgb",
            body: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
        },
        {
            title: "Learn Nouns",
            author: "Ivan Garcia",
            image: "https://images.unsplash.com/photo-1531312631567-f589343b6e95?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=742fc82fba3b29edc86d743fc220172e&dpr=1&auto=format&fit=crop&w=1000&q=80&cs=tinysrgb",
            body: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
        },
        {
            title: "Learn Nouns",
            author: "Ivan Garcia",
            image: "https://images.unsplash.com/photo-1531312631567-f589343b6e95?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=742fc82fba3b29edc86d743fc220172e&dpr=1&auto=format&fit=crop&w=1000&q=80&cs=tinysrgb",
            body: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
        }
    ];

function seedDB() {
    //Remove all posts
    Blog.remove({}, function(err){
    // if(err) {
    //     console.log(err);
    // }
    // console.log("removed blog posts!");
    //     data.forEach(function(seed){
    //         Blog.create(seed, function(err, blog){
    //             if(err) {
    //                 console.log(err);
    //             } else {
    //                 console.log("added a blog");
    //                 // create a comment
    //                 Comment.create(
    //                     {
    //                         text: "This placed is great, but I wish there was internet.",
    //                         author: "Homer"
    //                     }, function(err, comment) {
    //                     if(err){
    //                         console.log(err);
    //                     } else {
    //                         blog.comments.push(comment);
    //                         blog.save();
    //                         console.log("Created new comment");
    //                         }
    //                     }
    //                 );
    //             }
    //         });
    //     });
    });
}

module.exports = seedDB;

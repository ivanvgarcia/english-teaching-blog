var express = require("express");
var router = express.Router();
var Blog = require("../models/blog");
var middleware = require("../middleware");

// RESTFUL ROUTES
router.get("/", function(req, res) {
    res.redirect("/blogs");
});

// INDEX ROUTE
router.get("/blogs", function(req, res) {
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Blog.find({ title: regex }, function(err, searchResults) {
            if (err) {
                console.log(err);
            }
            else {
                if (searchResults.length === 0) {
                    req.flash('error', 'Sorry, no posts match your search. Please try again!');
                    return res.redirect('/blogs');
                }
            }
            res.render("posts/index", { blogs: searchResults, currentUser: req.user });
        });
    }
    else {
        Blog.find({}, function(err, blogs) {
            if (err) {
                req.flash("noMatch", "No matches found");
                res.redirect('back');
            }
            else {
                res.render("posts/index", { blogs: blogs, currentUser: req.user });
            }
        });
    }
});

// NEW ROUTE 
router.get("/blogs/new", middleware.isLoggedIn, function(req, res) {
    if (req.user.isAdmin) {
        res.render("posts/new");
    } else {
        req.flash("error", "You don't have posting priviliges");
        res.redirect("back");
    }
});

// CREATE ROUTE
router.post("/blogs", middleware.isLoggedIn, function(req, res) {
    //create blog

    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, newBlog) {
        if (err) {
            res.render("posts/new");
        }
        else {
            newBlog.author.id = req.user._id;
            newBlog.author.username = req.user.username;
            newBlog.save();
            res.redirect("/blogs");
        }
    });
});


//SHOW ROUTE
router.get("/blogs/:id", function(req, res) {
    Blog.findById(req.params.id).populate("comments").exec(function(err, foundBlog) {
        if (err || !foundBlog) {
            req.flash('error', 'Blog was not found');
            res.redirect("back");
        }
        else {
            res.render("posts/show", { blog: foundBlog });
        }
    });
});

// EDIT ROUTE
router.get("/blogs/:id/edit", middleware.checkBlogOwnership, function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog) {
        res.render("posts/edit", { blog: foundBlog });
    });
});

//UPDATE ROUTE
router.put("/blogs/:id", middleware.checkBlogOwnership, function(req, res) {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog) {
        if (err) {
            res.redirect("/blogs");
        }
        else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

router.delete("/blogs/:id", middleware.checkBlogOwnership, function(req, res) {
    //destroy blog
    Blog.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            res.redirect("/blogs");
        }
        else {
            //redirect somewhere
            req.flash("success", "The blog post has been deleted!");
            res.redirect("/blogs");
        }
    });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;

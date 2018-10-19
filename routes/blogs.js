var express = require("express");
var router = express.Router();
var sanitizeHtml = require("sanitize-html");
var Blog = require("../models/blog");
var User = require("../models/user");
var middleware = require("../middleware");
var dotenv = require("dotenv").config();
var multer = require("multer");
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function(req, file, cb) {
  // accept image files only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter });

var cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: "dnbyfakxk",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// RESTFUL ROUTES
router.get("/", function(req, res) {
  if (req.user) {
    return res.redirect("/blogs");
  }
  res.render("landing");
});

// INDEX ROUTE
router.get("/blogs", function(req, res) {
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), "gi");
    Blog.find({ title: regex }, function(err, searchResults) {
      if (err) {
        req.flash("error", "Error trying to find your search.");
      } else {
        if (searchResults.length === 0) {
          req.flash(
            "error",
            "Sorry, no posts match your search. Please try again!"
          );
          return res.redirect("/blogs");
        }
      }
      res.render("posts/index", {
        blogs: searchResults,
        currentUser: req.user
      });
    });
  } else {
    Blog.find()
      .sort({ created: -1 })
      .then(blogs =>
        res.render("posts/index", {
          blogs,
          currentUser: req.user
        })
      )
      .catch(() => {
        req.flash("noMatch", "No matches found");
        res.redirect("back");
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
router.post("/blogs", middleware.isLoggedIn, upload.single("image"), function(
  req,
  res
) {
  //create blog
  cloudinary.v2.uploader.upload(req.file.path, function(error, result) {
    req.body.blog.image = result.secure_url;
    req.body.blog.imageId = result.public_id;
    req.body.author = {
      id: req.user._id,
      username: req.user.username,
      avatar: req.user.avatar
    };
    if (!req.user.isAdmin) {
      req.body.blog.body = sanitizeHtml(req.body.blog.body, {
        allowedTags: []
      });
      return;
    }
    Blog.create(req.body.blog, function(err, newBlog) {
      if (err) {
        req.flash("error", "Sorry, there was an error adding your post.");
        res.render("posts/new");
      } else {
        newBlog.author.id = req.user._id;
        newBlog.author.username = req.user.username;
        newBlog.author.avatar = req.user.avatar;
        newBlog.save();
        User.findById(req.user.id, (err, foundUser) => {
          foundUser.posts.push(newBlog);
          foundUser.save();
        });
        res.redirect("/blogs");
      }
    });
  });
});

//SHOW ROUTE
router.get("/blogs/:id", function(req, res) {
  Blog.findById(req.params.id)
    .populate("comments")
    .exec(function(err, foundBlog) {
      if (err || !foundBlog) {
        req.flash("error", "Blog was not found");
        res.redirect("back");
      } else {
        User.findOne(foundBlog.author.id)
          .populate("posts")
          .exec((err, user) => {
            if (err) {
              req.flash("Sorry, this post cannot be found");
              res.redirect("/");
            } else {
              res.render("posts/show", { blog: foundBlog, user });
            }
          });
      }
    });
});

// EDIT ROUTE
router.get("/blogs/:id/edit", middleware.checkBlogOwnership, function(
  req,
  res
) {
  Blog.findById(req.params.id, function(err, foundBlog) {
    res.render("posts/edit", { blog: foundBlog });
  });
});

//UPDATE ROUTE
router.put(
  "/blogs/:id",
  middleware.checkBlogOwnership,
  upload.single("image"),
  function(req, res) {
    if (!req.user.isAdmin) {
      req.body.blog.body = sanitizeHtml(req.body.blog.body, {
        allowedTags: []
      });
    }
    Blog.findById(req.params.id, async function(err, updatedBlog) {
      if (err) {
        req.flash("error", err.message);
        res.redirect("back");
      } else {
        if (req.file) {
          try {
            await cloudinary.v2.uploader.destroy(updatedBlog.imageId);
            var result = await cloudinary.v2.uploader.upload(req.file.path);
            updatedBlog.imageId = result.public_id;
            updatedBlog.image = result.secure_url;
          } catch (err) {
            req.flash("error", err.message);
            return res.redirect("back");
          }
        }
        updatedBlog.author.avatar = req.user.avatar;
        updatedBlog.title = req.body.blog.title;
        updatedBlog.level = req.body.blog.level;
        updatedBlog.body = req.body.blog.body;
        updatedBlog.save();
        req.flash("success", "Successfully Updated!");
        res.redirect("/blogs/" + req.params.id);
      }
    });
  }
);

router.delete("/blogs/:id", middleware.checkBlogOwnership, function(req, res) {
  //destroy blog
  Blog.findById(req.params.id, async function(err, blogToDelete) {
    if (err) {
      req.flash("error", err.message);
      return res.redirect("/blogs");
    }
    try {
      await cloudinary.v2.uploader.destroy(blogToDelete.imageId);
      blogToDelete.remove();
      req.flash("success", "The blog post has been deleted!");
      res.redirect("/blogs");
    } catch (err) {
      if (err) {
        req.flash("error", err.message);
        return res.redirect("back");
      }
    }
    //redirect somewhere
  });
});

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports = router;

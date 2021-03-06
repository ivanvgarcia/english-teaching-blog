var Comment = require("../models/comment");
var Blog = require("../models/blog");
var User = require("../models/user");

var middlewareObj = {};

middlewareObj.checkCommentOwnership = function(req, res, next) {
  if (req.isAuthenticated()) {
    Comment.findById(req.params.comment_id, function(err, foundComment) {
      if (err || !foundComment) {
        req.flash("error", "There was a problem. Try again.");
        res.redirect("back");
      } else {
        // does user own the comment?
        if (foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
          next();
        } else {
          req.flash("error", "You don't have permission to do that");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "You need to be logged in to do that.");
    res.redirect("back");
  }
};

middlewareObj.checkBlogOwnership = function(req, res, next) {
  if (req.isAuthenticated()) {
    Blog.findById(req.params.id, function(err, foundBlog) {
      if (err || !foundBlog) {
        req.flash("error", "Blog post not found");
        res.redirect("back");
      } else {
        // does user own the blog
        if (foundBlog.author.id.equals(req.user._id) || req.user.isAdmin) {
          next();
        } else {
          req.flash("error", "You don't have permission to do that.");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "You need to be logged in to do that");
    res.redirect("back");
  }
};

middlewareObj.isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "You need to login to access that feature.");
  res.redirect("/login");
};

middlewareObj.getRedirected = function(req, res, next) {
  if (req.isAuthenticated()) {
    req.flash("error", "You are already logged in, silly!");
    res.redirect(`/users/${req.user.id}`);
  }
  next();
};

module.exports = middlewareObj;

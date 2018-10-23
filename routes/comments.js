var express = require("express");
var router = express.Router();
var Blog = require("../models/blog");
var Comment = require("../models/comment");
var middleware = require("../middleware");

router.get("/blogs/:id/comments/new", middleware.isLoggedIn, function(
  req,
  res
) {
  Blog.findById(req.params.id, function(err, blog) {
    if (err || !blog) {
      req.flash("error", "error when posting comment");
      res.redirect("back");
    } else {
      res.render("comments/new", { blog: blog });
    }
  });
});

router.post("/blogs/:id/comments", middleware.isLoggedIn, function(req, res) {
  // look up blog using ID
  Blog.findById(req.params.id, function(err, blog) {
    if (err) {
      req.flash("error", "Something went wrong");
      res.redirect("/blogs");
    } else {
      Comment.create(req.body.comment, function(err, comment) {
        if (err) {
          req.flash("error", "Something went wrong");
        } else {
          //add username and id to comment
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          comment.author.avatar = req.user.avatar;
          comment.post.id = blog._id;
          //save comment
          comment.save();
          blog.comments.push(comment);
          blog.save();
          req.flash("success", "Successfully added comment");
          res.redirect("/blogs/" + blog._id);
        }
      });
    }
  });
});

// COMMENTS EDIT ROUTE
router.get(
  "/blogs/:id/comments/:comment_id/edit",
  middleware.checkCommentOwnership,
  function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog) {
      if (err || !foundBlog) {
        req.flash("error", "No Blog post found");
        return res.redirect("back");
      }
      Comment.findById(req.params.comment_id, function(err, foundComment) {
        if (err) {
          req.flash("error", "Something went wrong");
          res.redirect("back");
        } else {
          res.render("comments/edit", {
            blog_id: req.params.id,
            comment: foundComment
          });
        }
      });
    });
  }
);

//COMMENTS UPDATE ROUTE
router.put(
  "/blogs/:id/comments/:comment_id",
  middleware.checkCommentOwnership,
  function(req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(
      err,
      updatedComment
    ) {
      if (err) {
        res.redirect("back");
      } else {
        req.flash("success", "Your comment was updated");
        res.redirect("/blogs/" + req.params.id);
      }
    });
  }
);

//COMMENTS DESTROY ROUTE

router.delete(
  "/blogs/:id/comments/:comment_id",
  middleware.checkCommentOwnership,
  function(req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function(err) {
      if (err) {
        res.redirect("back");
      } else {
        req.flash("success", "Comment successfully deleted");
        res.redirect("/blogs/" + req.params.id);
      }
    });
  }
);

module.exports = router;

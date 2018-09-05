var express             = require("express"),
    bodyParser          = require("body-parser"),
    methodOverride      = require("method-override"),
    expressSanitizer    = require("express-sanitizer");
    mongoose            = require("mongoose"),
    app                 = express(),
    seedDB              = require("./seeds"),
    passport            = require("passport"),
    LocalStrategy       = require("passport-local"),
    User                = require("./models/user"),
    Comment             = require("./models/comment"),
    Blog                = require("./models/blog"),
    flash               = require("connect-flash"),
    app.locals.moment   = require("moment");
    enforce             = require("express-sslify");
    
var commentRoutes = require("./routes/comments"),
    blogRoutes    = require("./routes/blogs"),
    indexRoutes    = require("./routes/index");

// APP CONFIG
var url = process.env.DATABASEURL || "mongodb://localhost/english-teaching-blog";
mongoose.connect(url);
app.set("view engine", "ejs");
app.use(enforce.HTTPS({ trustProtoHeader: true }))
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(expressSanitizer());
app.use(flash());
//seedDB();

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Time to learn English!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   res.locals.noMatch = req.flash("noMatch");
   next();
});

app.use(indexRoutes);
app.use(blogRoutes);
app.use(commentRoutes);

app.listen(process.env.PORT, process.env.IP, function() {
    console.log("SERVER IS RUNNING");
});

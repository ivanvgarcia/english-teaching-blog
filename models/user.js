var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
   username: { type: String, unique: true, required: true },
   password: String,
   avatar: String,
   firstName: { type: String, required: [true, 'Please enter your first name'] },
   lastName: { type: String, required: [true, 'Please enter your last name'] },
   email: { type: String, unique: true, required: [true, 'Please enter your email'] },
   resetPasswordToken: String,
   resetPasswordExpires: Date,
   isAdmin: { type: Boolean, default: false }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);

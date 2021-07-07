const mongoose = require('mongoose');
const bcrypt = require("bcrypt-nodejs");
const saltRounds = 10;

/* ADMIN */
const adminSchema = new mongoose.Schema({
    username: { type: String },
    password: { type: String }
});

/* Cheking Password */
adminSchema.methods.comparePassword = function(pwd, next) {
  bcrypt.compare(pwd, this.password, function(err, isMatch) {
    return next(err, isMatch);
  });
};

module.exports = mongoose.model('admin', adminSchema, 'admin');
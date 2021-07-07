const mongoose = require('mongoose');
const bcrypt = require("bcrypt-nodejs");
const saltRounds = 10;

/* USER LIST */
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },   
    surname:{type: String},
    mobile: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    social_unique_id: { type: String },
    user_type: { type: String, 'default': 'new_user' },
    user_id: { type: String },
    third_party_provider: { type: String },
    photo_url: { type: String},
    social_user:{ type : Array},
    otp: { type: String },
    otp_status:{ type:String },
    OTPdatetime:{type:String},
    email_confirmed: { type: Boolean, 'default': false },
    activation: { type: Boolean, 'default': false },
    mob_status: { type: Boolean, 'default': false },
    // activation: { type: Boolean, 'default': false },
    temp_token: { type: String },
    forgot_request_on: { type: Date },
    created_on: { type: Date, 'default': Date.now },
    company_id: { type: String },
    branch: { type : Array },
    count:{type : Number, 'default': 0}
});

/* Encrypting Password */
userSchema.pre('save', function(next) {
    var user = this;
    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();
    // generate a salt
    bcrypt.genSalt(saltRounds, function(err, salt) {
        if (err) return next(err);
        // hash the password using our new salt
        bcrypt.hash(user.password, salt, null, function(err, hash) {
            if (err) return next(err);
            // override the cleartext password with the hashed one
            user.password = hash;
            return next();
        });
    });
});

/* Cheking Password */
userSchema.methods.comparePassword = function(pwd, next) {
  bcrypt.compare(pwd, this.password, function(err, isMatch) {
    return next(err, isMatch);
  });
};

module.exports = mongoose.model('user_list', userSchema, 'user_list');
const mongoose = require('mongoose');
const router = require('express').Router();
const admin = require("../../models/admin");
const jwt = require('jsonwebtoken');
const jwtConfig = require('../../config/jwtsecret');

/* Admin Login */
router.post("/login", function(req, res) {
    admin.findOne({ username: req.body.username }, function(err, response) {
        if(!err && response) {
            response.comparePassword(req.body.password, async function(err, isMatch) {
                if(!err && isMatch) {
                    const payload = {
                        id: response._id,
                        user_type: 'admin'
                    };
                    const token = jwt.sign(payload, jwtConfig.jwtSecretKey);
                    res.json({ status: true, token: token });
                }
                else {
                    res.json({ status: false, error: err, message: "Password Does not match" });
                }
            });
        }
        else {
            res.json({ status: false, error: err, message: "Invalid User" });
        }
    });
});

module.exports = router;
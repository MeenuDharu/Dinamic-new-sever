const mongoose = require('mongoose');
const router = require('express').Router();
const admin = require("../../models/admin");
const userList = require("../../models/user");

/* User List */
router.get("/list", (req, res) => {
    admin.findOne({ _id: mongoose.Types.ObjectId(req.id) }, function(err, response) {
        if(!err && response)
        {
            userList.aggregate([ { "$sort": { "_id": -1 } } ], function(err, response) {
                if(!err && response) {
                    res.json({ status: true, data: response });
                }
                else {
                    res.json({ status: false, error: err, message: "failure" });
                }
            });
        }
        else {
            res.json({ status: false, error: err, message: "Invalid User" });
        }
    });
});

module.exports = router;
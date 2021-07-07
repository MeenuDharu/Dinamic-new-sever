const mongoose = require('mongoose');
const router = require('express').Router();
const admin = require("../../models/admin");
const branch = require("../../models/branch");

router.post("/list", function(req, res) {
    admin.findOne({ _id: mongoose.Types.ObjectId(req.id) }, function(err, response) {
        if(!err && response)
        {
            branch.aggregate([
                { $match: { restaurant_id: mongoose.Types.ObjectId(req.body.restaurant_id), status: 'active' } },
                { $lookup: {from: "tables", localField: "_id", foreignField: "branch_id", as: "table_list"} },
                { $project:
                    {
                        location: 1, manager_name: 1, mobile: 1, email: 1, address: 1, pos_restaurant_id:1, pos_branch_id:1,
                        tables: { 
                            $filter: { 
                                input: "$table_list", 
                                as: "table", 
                                cond: { $eq: [ "$$table.status", 'active' ] }
                            } 
                        }
                    } 
                }
            ], function(err, response) {
                if(!err && response) {
                    let restaurantList = [];
                    for(let i=0; i<response.length; i++)
                    {
                        let sendData = {};
                        sendData['_id'] = response[i]['_id'];
                        sendData['location'] = response[i]['location'];
                        sendData['manager_name'] = response[i]['manager_name'];
                        sendData['mobile'] = response[i]['mobile'];
                        sendData['email'] = response[i]['email'];
                        sendData['address'] = response[i]['address'];
                        sendData['pos_rest_id'] = response[i]['pos_rest_id'];
                        sendData['pos_branch_id'] = response[i]['pos_branch_id'];
                        sendData['table_count'] = response[i]['tables'].length;

                        restaurantList.push(sendData);
                    }
                    res.json({ status: true, data: restaurantList });
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

router.post("/add", (req, res) => {
    admin.findOne({ _id: mongoose.Types.ObjectId(req.id) }, function(err, response) {
        if(!err && response)
        {
            branch.findOne({ restaurant_id: mongoose.Types.ObjectId(req.body.restaurant_id), name: req.body.name, mobile: req.body.mobile }, function(err, response) {
                if(!err && !response) {
                    branch.create(req.body, function(err, response) {
                        if(!err && response) {
                            res.json({ status: true });
                        }
                        else {
                            res.json({ status: false, error: err, message: "Unable to add" });
                        }
                    });
                }
                else {
                    res.json({ status: false, error: err, message: "Branch details already exist" });
                }
            });
        }
        else {
            res.json({ status: false, error: err, message: "Invalid User" });
        }
    });
});

router.post("/update", function(req, res) {
    admin.findOne({ _id: mongoose.Types.ObjectId(req.id) }, function(err, response) {
        if(!err && response)
        {
            branch.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body._id) }, { $set: req.body }, function(err, response) {
                if(!err && response) {
                    res.json({ status: true });
                }
                else {
                    res.json({ status: false, error: err, message: "Failure" });
                }
            });
        }
        else {
            res.json({ status: false, error: err, message: "Invalid User" });
        }
    });
});

router.post("/delete", function(req, res) {
    admin.findOne({ _id: mongoose.Types.ObjectId(req.id) }, function(err, response) {
        if(!err && response)
        {
            branch.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body._id) }, { $set: { status: 'inactive' } }, function(err, response) {
                if(!err && response) {
                    res.json({ status: true });
                }
                else {
                    res.json({ status: false, error: err, message: "Failure" });
                }
            });
        }
        else {
            res.json({ status: false, error: err, message: "Invalid User" });
        }
    });
});

module.exports = router;
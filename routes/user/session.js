const mongoose = require('mongoose');
const router = require('express').Router();
const tableMetadata = require("../../models/table_metadata");
const rewardTable = require("../../models/reward_points");

/* User Session Add */
router.post("/add", function(req, res) {
    let customerDetails = req.body.customer_details;
    customerDetails._id = mongoose.Types.ObjectId();
    tableMetadata.findOne({ table_id: mongoose.Types.ObjectId(req.body.dinamic_details.table_id), status: 'active' }, function(err, response) {
        console.log("session response......", response);
        console.log("session error......", err);
        
        if(!err && !response) {
            // create session with user
            tableMetadata.create({
                restaurant_id: req.body.company_id,
                company_id: req.body.company_id,
                branch_id: req.body.dinamic_details.branch_id,
                table_id: req.body.dinamic_details.table_id,    
                initiator: req.body.customer_details.name,
                user_list: [ customerDetails ]
            }, function(err, response) {
                if(!err && response) {
                    rewardTable.findOne({ email: customerDetails.email }, function(err, response) {
                        if(!err && response) {
                            res.json({ status: true, dinamic_session_id: customerDetails._id, reward_points: response['reward_points'] });
                        }
                        else {
                            res.json({ status: true, dinamic_session_id: customerDetails._id, reward_points: 0 });
                        }
                    });
                }
                else {
                    res.json({ status: false, error: err, message: 'Failure' });
                }
            });
        }
        else {
            // push new user
            tableMetadata.updateOne(
            { table_id: mongoose.Types.ObjectId(req.body.dinamic_details.table_id), status: 'active' },
            { $push: { user_list: customerDetails } }, function(err, response) {
                if(!err) {
                    rewardTable.findOne({ email: customerDetails.email }, function(err, response) {
                        if(!err && response) {
                            res.json({ status: true, dinamic_session_id: customerDetails._id, reward_points: response['reward_points'] });
                        }
                        else {
                            res.json({ status: true, dinamic_session_id: customerDetails._id, reward_points: 0 });
                        }
                    });
                }
                else {
                    res.json({ status: false, error: err, message: 'Failure' });
                }
            });
        }
    });
});

module.exports = router;
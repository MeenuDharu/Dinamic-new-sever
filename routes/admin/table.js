const mongoose = require('mongoose');
const router = require('express').Router();
const admin = require("../../models/admin");
const table = require("../../models/table");

router.post("/list", function(req, res) {
    admin.findOne({ _id: mongoose.Types.ObjectId(req.id) }, function(err, response) {
        if(!err && response)
        {
            table.find({ branch_id: mongoose.Types.ObjectId(req.body.branch_id) }, function(err, response) {
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

router.post("/add"  , (req, res) => {
    console.log("add",req.body)
    admin.findOne({ _id: mongoose.Types.ObjectId(req.id) }, function(err, response) {
        if(!err && response)
        {
            table.findOne({ branch_id: mongoose.Types.ObjectId(req.body.branch_id), name: req.body.name  }, function(err, response) {
                if(!err && !response) {
                    req.body.access_code = randomCode();
                    table.findOne({ access_code: req.body.access_code }, function(err, response) {
                        if(!err && !response) {
                            table.create(req.body, function(err, response) {
                                if(!err && response) {
                                    res.json({ status: true });
                                }
                                else {
                                    res.json({ status: false, error: err, message: "Unable to add" });
                                }
                            });
                        }
                        else {
                            res.json({ status: false, error: err, message: "Access code mismatch, try again" });
                        }
                    });
                }
                else {
                    res.json({ status: false, error: err, message: "Table already exist" });
                }
            });
        }
        else {
            res.json({ status: false, error: err, message: "Invalid User" });
        }
    });
});

router.post("/update", function(req, res) {
    console.log("table update..........", req.body)
    admin.findOne({ _id: mongoose.Types.ObjectId(req.id) }, function(err, response) {
        if(!err && response)
        {
            table.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body._id) }, { $set: req.body }, function(err, response) {
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

router.post("/updatestatus", function(req, res) {
    console.log(req.body.status)
    admin.findOne({ _id: mongoose.Types.ObjectId(req.id) }, function(err, response) {
        if(!err && response)
        {
            table.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body._id) }, { $set: { status: req.body.table_status, tablestatus:req.body.status } }, function(err, response) {
                if(!err && response) {
                    res.json({ status1: true });
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
            table.deleteOne({ _id: mongoose.Types.ObjectId(req.body._id) }, function(err, response) {
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

function randomCode() {
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789~!@$^*_";
  for(let i=0; i<7; i++)
  {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
const mongoose = require('mongoose');
const router = require('express').Router();
const admin = require("../../models/admin");
const restaurant = require("../../models/restaurant");
const valet = require("../../models/valet");
const gateway = require("../../models/pay_gateway_details");
const themes = require("../../models/themes");
var moment = require('moment');
const fs = require('fs');
const path = require('path');

router.get("/list", function (req, res) {
    admin.findOne({ _id: mongoose.Types.ObjectId(req.id) }, function (err, response) {
        if (!err && response) {
            restaurant.aggregate([
                { $match: { status: 'active' } },
                { $lookup: { from: "branches", localField: "_id", foreignField: "restaurant_id", as: "branch_list" } },
                {
                    $project:
                    {
                        name: 1, contact_person: 1, mobile: 1, email: 1, website: 1, base_url: 1, pos_rest_id: 1,
                        branches: {
                            $filter: {
                                input: "$branch_list",
                                as: "branch",
                                cond: { $eq: ["$$branch.status", 'active'] }
                            }
                        }
                    }
                }
            ], function (err, response) {

                if (!err && response) {
                    let restaurantList = [];
                    for (let i = 0; i < response.length; i++) {
                        console.log("rest response...........", response[i])
                        let sendData = {};
                        sendData['_id'] = response[i]['_id'];
                        sendData['name'] = response[i]['name'];
                        sendData['contact_person'] = response[i]['contact_person'];
                        sendData['mobile'] = response[i]['mobile'];
                        sendData['email'] = response[i]['email'];
                        sendData['website'] = response[i]['website'];
                        sendData['base_url'] = response[i]['base_url'];
                        sendData['pos_rest_id'] = response[i]['pos_rest_id'];
                        sendData['branch_count'] = response[i]['branches'].length;

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

// router.post("/add", (req, res) => {
//     admin.findOne({ _id: mongoose.Types.ObjectId(req.id) }, function (err, response) {
//         if (!err && response) {
//             restaurant.findOne({ name: req.body.name }, function (err, response) {
//                 if (!err && !response) {
//                     restaurant.create(req.body, function (err, response) {
//                         if (!err && response) {
//                             res.json({ status: true });
//                         }
//                         else {
//                             res.json({ status: false, error: err, message: "Unable to add" });
//                         }
//                     });
//                 }
//                 else {
//                     res.json({ status: false, error: err, message: "Restaurant name already exist" });
//                 }
//             });
//         }
//         else {
//             res.json({ status: false, error: err, message: "Invalid User" });
//         }
//     });
// });

router.post("/add", (req, res) => {
    admin.findOne({ _id: mongoose.Types.ObjectId(req.id) }, function (err, response) {
        if (!err && response) {
            restaurant.findOne({ name: req.body.name }, function (err, response) {
                if (!err && !response) {
                    restaurant.create(req.body, function (err, response) {
                        if (!err && response) {
                            res.json({ status: true });
                        }
                        else {
                            res.json({ status: false, error: err, message: "Unable to add" });
                        }
                    });
                }
                else {
                    res.json({ status: false, error: err, message: "Restaurant name already exist" });
                }
            });
        }
        else {
            res.json({ status: false, error: err, message: "Invalid User" });
        }
    });
});

router.post("/update", function (req, res) {
    admin.findOne({ _id: mongoose.Types.ObjectId(req.id) }, function (err, response) {
        if (!err && response) {
            restaurant.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body._id) }, { $set: req.body }, function (err, response) {
                if (!err && response) {
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

router.post("/delete", function (req, res) {
    admin.findOne({ _id: mongoose.Types.ObjectId(req.id) }, function (err, response) {
        if (!err && response) {
            restaurant.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body._id) }, { $set: { status: 'inactive' } }, function (err, response) {
                if (!err && response) {
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



router.post("/valet/token/add", (req, res) => {
    console.log("add", req.body)
    req.body.created_on = moment().format()
    req.body.created_date = moment().format('YYYY-MM-DD');
    valet.findOne({ serial_number: req.body.serial_number }, function (err, response) {
        console.log("err.......", err, 'response........', response)
        req.body._id = mongoose.Types.ObjectId();
        req.body.qrcode_link = req.body._id;
        if (!err && response) {

            if (response.status === 'active') {
                valet.create(req.body, function (err, response) {
                    if (!err && response) {
                        res.json({ status: true });
                    }
                    else {
                        res.json({ status: false, error: err, message: "Unable to add" });
                    }
                });
            }
            else {
                res.json({ status: false, error: err, message: "Unable to add, Serial No already updated" });
            }




        }
        else {
            valet.create(req.body, function (err, response) {
                if (!err && response) {
                    res.json({ status: true });
                }
                else {
                    res.json({ status: false, error: err, message: "Unable to add" });
                }
            });
        }
    });
});

router.post("/valet/token/update", (req, res) => {
    valet.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body._id) }, { $set: req.body }, function (err, response) {
        if (!err && response) {
            res.json({ status: true });
        }
        else {
            res.json({ status: false, error: err, message: "Failure" });
        }
    });
})

router.post("/valet/token/list", function (req, res) {

    valet.find({ branch_id: mongoose.Types.ObjectId(req.body.branch_id) }, function (err, response) {
        if (!err && response) {
            res.json({ status: true, data: response });
        }
        else {
            res.json({ status: false, error: err, message: "failure" });
        }
    });

});


router.post("/paymentgateway/add", (req, res) => {
    console.log("add", req.body)
    // req.body.created_on = moment().format()
    // req.body.created_date = moment().format('YYYY-MM-DD');
    gateway.create(req.body, function (err, response) {
        if (!err && response) {
            res.json({ status: true });
        }
        else {
            res.json({ status: false, error: err, message: "Unable to add" });
        }
    });


});

router.post("/addTheme", async (req, res) => {
    await themes.findOne({ pos_rest_id: req.body.pos_rest_id }, async function (err, response) {
        if (!err && response) {
            await themes.findOneAndUpdate({ pos_rest_id: req.body.pos_rest_id }, { $set: req.body }, function (err, response) {
                if (!err && response) {
                    return res.json({ status: true });
                } else {
                    return res.json({ status: false, error: err, message: "Unable to create theme" });
                }
            })
        } else {
            await themes.create(req.body, function (err, response) {
                console.log('req add new theme: ', req.body);
                if (!err && response) {
                    res.json({ status: true });
                } else {
                    res.json({ status: false, error: err, message: "Unable to create theme" });
                }
            });
        }
    });
})

router.post("/addHomePageTheme", (req, res) => {
    themes.findOne({ pos_rest_id: req.body.pos_rest_id }, async (err, response) => {
        if (!err && response) {
            let homepageImageArray = req.files.homepageImages;
            let homepageImages;
            let uploadPath;
            let filePath;
            let fileType;
            if(!Array.isArray(req.files.homepageImages)){
                let newArr = [];
                newArr.push(req.files.homepageImages);
                homepageImageArray = newArr;
            }
            for (let i = 0; i < homepageImageArray.length; i++) {
                homepageImages = homepageImageArray[i];
                fileType = homepageImages.mimetype.split("/");
                uploadPath = process.cwd() + '/uploads/' + req.body.pos_rest_id;
                if (homepageImages.name === 'billImage') {
                    filePath = '/uploads/' + req.body.pos_rest_id + '/' + homepageImages.name + '.' + fileType[1];
                    await themes.findOneAndUpdate({ pos_rest_id: req.body.pos_rest_id }, { $set: { 'homepage.billImage': filePath } }, (err, billResponse) => {
                        if (!err && billResponse) {
                            fs.promises.mkdir(uploadPath, { recursive: true });
                            homepageImages.mv(uploadPath + '/' + homepageImages.name + '.' + fileType[1]);
                        } else { }
                    });
                }
                if (homepageImages.name === 'helpImage') {
                    filePath = '/uploads/' + req.body.pos_rest_id + '/' + homepageImages.name + '.' + fileType[1];
                    await themes.findOneAndUpdate({ pos_rest_id: req.body.pos_rest_id }, { $set: { 'homepage.helpImage': filePath } }, (err, helpResponse) => {
                        if (!err && helpResponse) {
                            fs.promises.mkdir(uploadPath, { recursive: true });
                            homepageImages.mv(uploadPath + '/' + homepageImages.name + '.' + fileType[1]);
                        } else { }
                    });
                }
                if (homepageImages.name === 'vehicleImage') {
                    filePath = '/uploads/' + req.body.pos_rest_id + '/' + homepageImages.name + '.' + fileType[1];
                    await themes.findOneAndUpdate({ pos_rest_id: req.body.pos_rest_id }, { $set: { 'homepage.vehicleImage': filePath } }, (err, vehicleResponse) => {
                        if (!err && vehicleResponse) {
                            fs.promises.mkdir(uploadPath, { recursive: true });
                            homepageImages.mv(uploadPath + '/' + homepageImages.name + '.' + fileType[1]);
                        } else { }
                    });
                }
                if (homepageImages.name === 'offerImage') {
                    filePath = '/uploads/' + req.body.pos_rest_id + '/' + homepageImages.name + '.' + fileType[1];
                    await themes.findOneAndUpdate({ pos_rest_id: req.body.pos_rest_id }, { $set: { 'homepage.offerImage': filePath } }, (err, offerResponse) => {
                        if (!err && offerResponse) {
                            fs.promises.mkdir(uploadPath, { recursive: true });
                            homepageImages.mv(uploadPath + '/' + homepageImages.name + '.' + fileType[1]);
                        } else { }
                    });
                }
                if (homepageImages.name === 'exitImage') {
                    filePath = '/uploads/' + req.body.pos_rest_id + '/' + homepageImages.name + '.' + fileType[1];
                    await themes.findOneAndUpdate({ pos_rest_id: req.body.pos_rest_id }, { $set: { 'homepage.exitImage': filePath } }, (err, exitResponse) => {
                        if (!err && exitResponse) {
                            fs.promises.mkdir(uploadPath, { recursive: true });
                            homepageImages.mv(uploadPath + '/' + homepageImages.name + '.' + fileType[1]);
                        } else { }
                    });
                }

            }
            // await themes.findOneAndUpdate({ pos_rest_id: req.body.pos_rest_id }, { $set: { homepage: req.body } }, (err, response) => {
            //     if(!err && response) {
            //         res.json({ status: 'success', uploadedImages: homepageImageArray.length });
            //     } else {
            //         res.json({ status: false, error: err, message: "No Record Found" });
            //     }
            // })
            res.json({ status: 'success', uploadedImages: homepageImageArray.length });

        } else {
            res.json({ status: false, error: err, message: "No Record Found" });
        }
    })
});

// let homepageImages;
// let uploadPath;

// if (!req.files || Object.keys(req.files).length === 0) {
//     return res.status(400).send('No files were uploaded.');
// }

// console.log('files', req.files.homepageImages[0]);
// console.log('fileslength', req.files.homepageImages.length);
// for (let i = 0; i < req.files.homepageImages.length; i++) {
//     homepageImages = req.files.homepageImages[i];
//     uploadPath = process.cwd() + '/uploads/' + req.body.pos_rest_id;
//     // console.log('upload path:', uploadPath)
//     console.log('homepageImages: ', homepageImages)
//     await fs.promises.mkdir(uploadPath, { recursive: true });
//     homepageImages.mv(uploadPath + '/' + homepageImages.name);
// }
// res.send('File uploaded!');


// if (req.files) {
//     let homepageImages;
//     let uploadPath;
//     for (let i = 0; i < req.files.homepageImages.length; i++) {
//         homepageImages = req.files.homepageImages[i];
//         uploadPath = process.cwd() + '/uploads/' + req.body.pos_rest_id;
//         await fs.promises.mkdir(uploadPath, { recursive: true });
//         homepageImages.mv(uploadPath + '/' + homepageImages.name);
//     }
//     res.json({ status: 'success', uploadedImages: req.files.homepageImages.length });
// }

// if (req.body && !req.files) {
//     themes.findOne({ pos_rest_id: req.body.pos_rest_id }, function (err, response) {
//         if (!err && response) {
//             themes.findOneAndUpdate({ pos_rest_id: req.body.pos_rest_id }, { $set: req.body }, function (err, response) {
//                 if (!err && response) {
//                     return res.json({ status: true });
//                 } else {
//                     return res.json({ status: false, error: err, message: "Unable to create theme" });
//                 }
//             })
//         } else {
//             return res.json({ status: false, error: err, message: "UnRegistered Restaurant" });
//         }
//     });

// }
// next();

// themes.findOne({ pos_rest_id: req.body.pos_rest_id }, function (err, response) {
//     if (!err && response) {
//         themes.findOneAndUpdate({ pos_rest_id: req.body.pos_rest_id }, { $set: req.body }, function (err, response) {
//             if (!err && response) {
//                 res.json({ status: true });
//             } else {
//                 res.json({ status: false, error: err, message: "Unable to create theme" });
//             }
//         })
//     } else {
//             themes.create(req.body, function (err, response) {
//                 console.log('response:', response);
//                 if (!err && response) {
//                     res.json({ status: true });
//                 } else {
//                     res.json({ status: false, error: err, message: "Unable to create theme" });
//                 }
//             });
//         }
//     })




router.post("/getTheme", (req, res) => {
    themes.findOne({ pos_rest_id: req.body.pos_rest_id }, function (err, response) {
        if (!err && response) {
            res.json({ status: true, data: response });
        } else {
            res.json({ status: false, error: err, message: "Unable to get theme" });
        }
    });
});



module.exports = router;


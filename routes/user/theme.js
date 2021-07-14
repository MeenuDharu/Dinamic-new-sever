const router = require('express').Router();
const themes = require('../../models/themes');

router.post("/getTheme", (req, res) => {
    themes.findOne({ pos_rest_id: req.body.pos_rest_id }, function (err, response) {
        if (!err && response) {
            res.json({ status: true, data: response });
        } else {
            res.json({ status: false, error: err, message: "Unable to get theme" });
        }
    });
});

// exports.singleFileUpload = function(image, rootPath, resolutionStatus, imgName) {
//     return new Promise((resolve, reject) => {
//         if(image) {
//             let formData = { image: image, root_path: rootPath, resolution_status: resolutionStatus, image_name: imgName };
//             request.post({ url: setupConfig.image_api_base+'/file_upload', form: formData }, function (err, response, body) {
//                 if(!err && body) {
//                     let jsonData = JSON.parse(body);
//                     resolve(jsonData.file_name);
//                 }
//                 else { resolve(null); }
//             });
//         }
//         else {
//             resolve(null);
//         } 
//     });
// }

// if(req.body.image) {
//     let rootPath = 'uploads/'+req.id+'/appointment';
//     imgUploadService.singleFileUpload(req.body.image, rootPath, true, null).then((img) => {
//         req.body.image = img;
//         appointmentServices.updateMany(
//         { store_id: mongoose.Types.ObjectId(req.body.store_id), rank: { $gte: req.body.rank } },
//         { $inc: { "rank": 1 } }, function(err, response) {
//             appointmentServices.create(req.body, function(err, response) {
//                 if(!err && response) { res.json({ status: true }); }
//                 else { res.json({ status: false, error: err, message: "Unable to add" }); }
//             });
//         });
//     });
// }


module.exports = router;
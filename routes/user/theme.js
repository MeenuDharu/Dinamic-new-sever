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

module.exports = router;
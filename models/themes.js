const mongoose = require('mongoose');

const themeSchema = new mongoose.Schema({
    pos_rest_id: { type: mongoose.Schema.Types.ObjectId },
    navbarColor: { type: String },
    navbarText: { type: String },
    primaryButtonColor: { type: String },
    primaryButtonText: { type: String },
    secondaryButtonColor: { type: String },
    secondaryButtonText: { type: String },
    disabledButtonColor: { type: String },
    disabledButtonText: { type: String },
    spinnerColor: { type: String },
    created_on: { type: Date, 'default': Date.now }
})

module.exports = mongoose.model('themes', themeSchema);
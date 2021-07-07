const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
    restaurant_id: { type: mongoose.Schema.Types.ObjectId },
    location: { type: String },
    manager_name: { type: String },
    mobile: { type: String },
    email: { type: String },
    address: { type: String },
    pos_restaurant_id: { type : String},
    pos_branch_id: { type : String},
    status: { type: String, 'default': 'active' },
    created_on: { type: Date, 'default': Date.now }
});

module.exports = mongoose.model('branches', branchSchema);
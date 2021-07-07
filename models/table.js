const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
    restaurant_id: { type: mongoose.Schema.Types.ObjectId },
    branch_id: { type: mongoose.Schema.Types.ObjectId },
    name: { type: String },
    type: { type: String },
    table_api: { type: String },
    pos_table_id: { type : String},
    pos_floor_id: { type : String},
    pos_branch_id:{ type : String},
    pos_restaurant_id:{ type : String},
    access_code: { type: String },
    nfc_count: { type: Number, 'default': 0 },
    qr_count: { type: Number, 'default': 0 },
    status: { type: String, 'default': 'active' },
    tablestatus:{type: Boolean},
    created_on: { type: Date, 'default': Date.now }
});

module.exports = mongoose.model('tables', tableSchema);
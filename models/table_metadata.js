const mongoose = require('mongoose');

const userDetailsSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String },
    social_unique_id: { type: String, required: true },
    third_party_provider: { type: String, required: true },
    application_type: { type: String, required: true },
    status: { type: String, 'default': 'active' },
    created_on: { type: Date, 'default': Date.now }
});

const tableMetaSchema = new mongoose.Schema({
    restaurant_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    company_id:{ type: mongoose.Schema.Types.ObjectId, required: true },
    branch_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    table_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    initiator: { type: String, required: true },
    user_list: [userDetailsSchema],
    status: { type: String, 'default': 'active' },
    created_on: { type: Date, 'default': Date.now }
});

module.exports = mongoose.model('table_metadata', tableMetaSchema, 'table_metadata');
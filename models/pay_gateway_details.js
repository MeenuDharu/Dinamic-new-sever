const mongoose = require('mongoose');

const gatwaySchema = new mongoose.Schema({
    restaurant_id: { type: mongoose.Schema.Types.ObjectId },
    branch_id: { type: mongoose.Schema.Types.ObjectId },
    key_id: {type : String},
    key_secret:{type : String},
    paymentName:{type : String},
    gateway_name: { type: String },    
    status: { type: String, 'default': 'active' },   
    created_on: { type: Date, 'default': Date.now }
});

module.exports = mongoose.model('gatwayDtails', gatwaySchema);
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    user_id: {type: String},
    order_id: {type: String },
    bill_id:{type:String},
    payment_request_id: {type: String},
    payment_status: {type: String},
    payment_details: {type: Object},
    created_on: { type: Date, 'default': Date.now },
    pos_branch_id:{type : "String"}
    
});

module.exports = mongoose.model('payment', paymentSchema);
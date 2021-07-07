const mongoose = require('mongoose');

const paymentTempSchema = new mongoose.Schema({
    user_id: {type: String},
    order_id: {type: String },
    bill_id:{type:String},
    payment_request_id: {type: String},
    payment_status: {type: String},
    payment_details: {type: Object},
    payment_method: {type: Object},
    created_on: { type: Date, 'default': Date.now },
    pos_branch_id:{type : "String"}
    
});

module.exports = mongoose.model('payment_temp', paymentTempSchema,'payment_temp');
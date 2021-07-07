const mongoose = require('mongoose');

const valetSchema = new mongoose.Schema({
    restaurant_id: { type: mongoose.Schema.Types.ObjectId },
    branch_id: { type: mongoose.Schema.Types.ObjectId },
    pos_branch_id:{type : String},
    pos_restaurent_id:{type : String},
    pos_valet_id: {type : String},
    serial_number: { type: String },
    valet_status: { type : String },
    qrcode_link: { type: String },
    current_user_details: {type: Object},
    status: { type: String, 'default': 'inactive' },
    created_date : {type: String},
    created_on: { type: String},
    delivery_time:{type: String},
    delay:{type:String},
    rdate:{type:String}
});

module.exports = mongoose.model('valets', valetSchema);
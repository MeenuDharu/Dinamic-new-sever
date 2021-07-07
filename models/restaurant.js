const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    name: { type: String },
    contact_person: { type: String },
    mobile: { type: String },
    email: { type: String },
    website: { type: String },
    base_url: { type: String },
    pos_rest_id :{type : String},
    address : {type : String},
    phone : {type : String },
    status: { type: String, 'default': 'active' },  
    created_on: { type: Date, 'default': Date.now }
});

module.exports = mongoose.model('restaurants', restaurantSchema);
const mongoose = require('mongoose');

const rewardPointsSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    reward_points: { type: Number, required: true },
    updated_on: { type: Date, 'default': Date.now }
});

module.exports = mongoose.model('reward_points', rewardPointsSchema);
const mongoose = require('mongoose');

const viewLogSchema = new mongoose.Schema({
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
        required: true
    },
    viewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    ip: String,
    viewerCountry: String, 
    viewedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ViewLog', viewLogSchema);

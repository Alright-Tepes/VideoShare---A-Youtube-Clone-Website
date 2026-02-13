const mongoose = require('mongoose');

const appealSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    videoTitle: {
        type: String,
        required: true
    },
    deletionReason: {
        type: String,
        required: true
    },
    userMessage: {
        type: String,
        required: true
    },
    adminResponse: {
        type: String
    },
    videoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video'
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'resolved', 'rejected'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Appeal', appealSchema);

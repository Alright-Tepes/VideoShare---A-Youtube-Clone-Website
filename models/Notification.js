const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['like', 'comment', 'follow', 'deletion'],
        required: true
    },
    message: { type: String },
    videoTitle: { type: String },
    appealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appeal' },
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video'
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Notification', notificationSchema);

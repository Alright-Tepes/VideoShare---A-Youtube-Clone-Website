const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.session.user._id })
            .populate('sender', 'username avatarUrl')
            .populate('video', 'title')
            .sort({ createdAt: -1 });

        res.render('notifications', { user: req.session.user, notifications });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
};

exports.markReads = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.session.user._id, read: false },
            { $set: { read: true } }
        );
        res.redirect('/notifications');
    } catch (err) {
        console.error(err);
        res.redirect('/notifications');
    }
};

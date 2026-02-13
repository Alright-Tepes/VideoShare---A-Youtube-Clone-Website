const User = require('../models/User');

exports.getProfile = (req, res) => {
    res.render('profile', { user: req.session.user, error: null, success: null });
};

exports.updateProfile = async (req, res) => {
    try {
        const { username, email, bio, coverUrl } = req.body;
        const userId = req.session.user._id;

        const updateData = { username, email, bio, coverUrl };
        if (req.file) {
            updateData.avatarUrl = '/uploads/' + req.file.filename;
        }

        const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
        req.session.user = user;
        res.render('profile', {
            user: req.session.user,
            success: 'Profil başarıyla güncellendi.',
            error: null
        });
    } catch (err) {
        console.error(err);
        res.render('profile', {
            user: req.session.user,
            success: null,
            error: 'Profil güncellenirken hata oluştu.'
        });
    }
};

exports.getChannel = async (req, res) => {
    try {
        const channelUser = await User.findById(req.params.userId);
        if (!channelUser) {
            return res.redirect('/');
        }
        const Video = require('../models/Video');
        const videos = await Video.find({ uploadedBy: channelUser._id, isDeleted: { $ne: true } }).sort({ createdAt: -1 });

        let isFollowing = false;
        if (req.session.user) {
            
            const currentUser = await User.findById(req.session.user._id);
            if (currentUser && currentUser.following) {
                isFollowing = currentUser.following.includes(channelUser._id);
            }
        }

        res.render('channel', {
            user: req.session.user || null,
            channelUser,
            videos,
            isFollowing
        });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
};

exports.toggleFollow = async (req, res) => {
    try {
        const userToFollow = await User.findById(req.params.userId);
        const currentUser = await User.findById(req.session.user._id);

        if (!userToFollow) return res.redirect('/');
        if (userToFollow._id.equals(currentUser._id)) return res.redirect(`/channel/${req.params.userId}`);

        if (currentUser.following.includes(userToFollow._id)) {
            
            currentUser.following.pull(userToFollow._id);
            userToFollow.followers.pull(currentUser._id);
        } else {
            
            currentUser.following.push(userToFollow._id);
            userToFollow.followers.push(currentUser._id);

            
            const Notification = require('../models/Notification');
            await Notification.create({
                recipient: userToFollow._id,
                sender: currentUser._id,
                type: 'follow'
            });
        }

        await currentUser.save();
        await userToFollow.save();

        
        req.session.user = currentUser;

        res.redirect(`/channel/${req.params.userId}`);
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
};

exports.getAppeals = async (req, res) => {
    try {
        const Appeal = require('../models/Appeal');
        const appeals = await Appeal.find({ userId: req.session.user._id }).sort({ createdAt: -1 });
        res.render('appeals', { user: req.session.user, appeals });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
};


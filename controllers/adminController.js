const User = require('../models/User');
const Video = require('../models/Video');


exports.getDashboard = async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const activeVideoCount = await Video.countDocuments({ isDeleted: { $ne: true } });
        const removedVideoCount = await Video.countDocuments({ isDeleted: true });

        const recentUsers = await User.find().sort({ createdAt: -1 }).limit(10);
        const recentVideos = await Video.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 }).limit(10).populate('uploadedBy', 'username');
        const removedVideos = await Video.find({ isDeleted: true }).sort({ createdAt: -1 }).populate('uploadedBy', 'username');

        const Report = require('../models/Report');
        const reports = await Report.find({ status: 'pending' })
            .sort({ date: -1 })
            .populate('reporter', 'username');

        const Appeal = require('../models/Appeal');
        const appeals = await Appeal.find({ status: 'pending' })
            .sort({ createdAt: -1 })
            .populate('userId', 'username');

        res.render('admin', {
            user: req.session.user,
            stats: { userCount, videoCount: activeVideoCount, removedVideoCount },
            recentUsers,
            recentVideos,
            removedVideos,
            reports,
            appeals,
            isAdminPage: true
        });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
};


exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        
        await Video.deleteMany({ uploadedBy: userId });
        
        await User.findByIdAndDelete(userId);
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.redirect('/admin');
    }
};


exports.deleteVideo = async (req, res) => {
    try {
        const videoId = req.params.id;
        const Notification = require('../models/Notification');
        const { reason } = req.body;

        const video = await Video.findById(videoId);
        if (!video) return res.redirect('/admin');

        
        video.isDeleted = true;
        video.deletionReason = reason || 'Kural ihlali nedeniyle kaldırıldı.';
        await video.save();

        
        await Notification.create({
            recipient: video.uploadedBy,
            sender: req.session.user._id,
            type: 'deletion',
            videoTitle: video.title,
            message: video.deletionReason
        });

        const Report = require('../models/Report');
        await Report.updateMany({ itemId: videoId, itemType: 'video' }, { status: 'resolved' });

        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.redirect('/admin');
    }
};


exports.postAppeal = async (req, res) => {
    try {
        const Appeal = require('../models/Appeal');
        const { videoTitle, deletionReason, userMessage, videoId } = req.body;

        await Appeal.create({
            userId: req.session.user._id,
            videoTitle,
            deletionReason,
            userMessage,
            videoId 
        });

        res.json({ success: true, message: 'İtirazınız gönderildi.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
};

exports.respondToAppeal = async (req, res) => {
    try {
        const Appeal = require('../models/Appeal');
        const Notification = require('../models/Notification');
        const { status, adminResponse } = req.body;

        const appeal = await Appeal.findByIdAndUpdate(req.params.id, {
            status,
            adminResponse
        }, { new: true });

        
        if (status === 'resolved' && appeal.videoId) {
            await Video.findByIdAndUpdate(appeal.videoId, { isDeleted: false, deletionReason: null });
        }

        await Notification.create({
            recipient: appeal.userId,
            sender: req.session.user._id,
            type: 'deletion',
            message: `İtiraz Sonucu (${status === 'resolved' ? 'Onaylandı' : 'Reddedildi'}): ${adminResponse}`,
            videoTitle: appeal.videoTitle
        });

        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.redirect('/admin');
    }
};

exports.getAppeals = async (req, res) => {
    try {
        const Appeal = require('../models/Appeal');
        const appeals = await Appeal.find({ status: 'pending' }).populate('userId', 'username');
        res.json({ success: true, appeals });
    } catch (err) {
        res.status(500).json({ success: false });
    }
};


exports.toggleAdmin = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        user.isAdmin = !user.isAdmin;
        await user.save();
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.redirect('/admin');
    }
};


exports.resolveReport = async (req, res) => {
    try {
        const Report = require('../models/Report');
        await Report.findByIdAndUpdate(req.params.id, { status: 'resolved' });
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.redirect('/admin');
    }
};

exports.restoreVideo = async (req, res) => {
    try {
        const videoId = req.params.id;
        await Video.findByIdAndUpdate(videoId, { isDeleted: false, deletionReason: null });
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.redirect('/admin');
    }
};

exports.banUser = async (req, res) => {
    try {
        const { reason, blockIp } = req.body;
        console.log(`[Admin] Ban request for ID: ${req.params.id}, Reason: ${reason}, BlockIP: ${blockIp}`);

        const user = await User.findById(req.params.id);
        if (!user) {
            console.log('[Admin] Ban Error: User not found');
            return res.redirect('/admin');
        }

        user.isBanned = true;
        user.banReason = reason || 'Topluluk kurallarını ihlal ettiğiniz için yasaklandınız.';

        if (blockIp === 'true' && user.lastIp) {
            console.log(`[Admin] Blocking IP: ${user.lastIp}`);
            if (!user.bannedIps.includes(user.lastIp)) {
                user.bannedIps.push(user.lastIp);
            }
        } else {
            console.log(`[Admin] IP Block skipped. blockIp=${blockIp}, lastIp=${user.lastIp}`);
        }

        await user.save();
        console.log('[Admin] User banned successfully and saved');
        res.redirect('/admin');
    } catch (err) {
        console.error('[Admin] Ban Exception:', err);
        res.redirect('/admin');
    }
};

exports.unbanUser = async (req, res) => {
    try {
        console.log(`[Admin] Unban request for ID: ${req.params.id}`);
        const user = await User.findById(req.params.id);
        if (user) {
            user.isBanned = false;
            user.banReason = null;
            user.bannedIps = [];
            await user.save();
            console.log(`[Admin] User unbanned successfully: ${user.username}`);
        } else {
            console.log(`[Admin] Unban Error: User not found for ID: ${req.params.id}`);
        }
        res.redirect('/admin');
    } catch (err) {
        console.error('[Admin] Unban Exception:', err);
        res.redirect('/admin');
    }
};

const Video = require('../models/Video');

exports.getHome = async (req, res) => {
    try {
        const category = req.query.category;
        let filter = { isDeleted: { $ne: true } };
        if (category) {
            filter.category = category;
        }
        const videos = await Video.find(filter).sort({ createdAt: -1 }).populate('uploadedBy', 'username');
        res.render('index', { user: req.session.user, videos, currentCategory: category });
    } catch (err) {
        console.error(err);
        res.status(500).send('Sunucu Hatası');
    }
};

exports.getUpload = (req, res) => {
    res.render('upload', { user: req.session.user });
};

exports.postUpload = async (req, res) => {
    try {
        const { title, description, category, embedUrl } = req.body;
        let thumbnailUrl = req.body.thumbnailUrl;

        if (req.file) {
            thumbnailUrl = '/uploads/' + req.file.filename;
        }

        await Video.create({
            title,
            description,
            category: category || 'Other',
            embedUrl,
            thumbnailUrl: thumbnailUrl || `/uploads/default-thumb.png`, 
            uploadedBy: req.session.user._id
        });
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.render('upload', { user: req.session.user, error: 'Video yüklenirken hata oluştu.' });
    }
};

exports.getWatch = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id)
            .populate('uploadedBy', 'username')
            .populate({
                path: 'comments',
                populate: [
                    { path: 'user', select: 'username avatarUrl' },
                    { path: 'replies.user', select: 'username avatarUrl' }
                ]
            });

        if (!video) return res.redirect('/');

        
        if (video.isDeleted) {
            return res.render('error', {
                user: req.session.user,
                message: "Bu video geçerli raporlandığı veya silindiği gerekçesiyle kullanılamıyor."
            });
        }

        
        video.views++;
        await video.save();

        
        const ViewLog = require('../models/ViewLog');
        await ViewLog.create({
            video: video._id,
            viewer: req.session.user ? req.session.user._id : null,
            ip: req.ip || req.connection.remoteAddress
        });

        
        if (req.session.user) {
            const User = require('../models/User');
            await User.findByIdAndUpdate(req.session.user._id, {
                $pull: { history: { video: video._id } } 
            });
            await User.findByIdAndUpdate(req.session.user._id, {
                $push: { history: { $each: [{ video: video._id, date: new Date() }], $position: 0 } }
            });
        }

        res.render('watch', { user: req.session.user, video });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
};

exports.postComment = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        const newComment = {
            text: req.body.text,
            user: req.session.user._id,
            username: req.session.user.username 
        };
        video.comments.unshift(newComment);
        await video.save();
        res.redirect(`/watch/${req.params.id}`);
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
};

exports.likeVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        const userId = req.session.user._id;

        if (video.likes.includes(userId)) {
            video.likes.pull(userId);
        } else {
            video.likes.push(userId);
            video.dislikes.pull(userId);

            
            if (video.uploadedBy.toString() !== userId.toString()) {
                const Notification = require('../models/Notification');
                await Notification.create({
                    recipient: video.uploadedBy,
                    sender: userId,
                    type: 'like',
                    video: video._id
                });
            }
        }
        await video.save();
        res.redirect(`/watch/${req.params.id}`);
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
};

exports.getSearch = async (req, res) => {
    try {
        const query = req.query.q;
        let videos = [];
        if (query) {
            videos = await Video.find({
                isDeleted: { $ne: true },
                $or: [
                    { title: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } }
                ]
            }).sort({ createdAt: -1 });
        }
        res.render('search', { user: req.session.user, videos, query });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
};

exports.getLikedVideos = async (req, res) => {
    try {
        const videos = await Video.find({ likes: req.session.user._id, isDeleted: { $ne: true } }).sort({ createdAt: -1 });
        res.render('liked', { user: req.session.user, videos });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
};

exports.dislikeVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        const userId = req.session.user._id;

        if (video.dislikes.includes(userId)) {
            video.dislikes.pull(userId);
        } else {
            video.dislikes.push(userId);
            video.likes.pull(userId);
        }
        await video.save();
        res.redirect(`/watch/${req.params.id}`);
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
};

exports.getTrending = async (req, res) => {
    try {
        const videos = await Video.find({ isDeleted: { $ne: true } }).sort({ views: -1 }).limit(10).populate('uploadedBy', 'username');
        res.render('trending', { user: req.session.user, videos });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
};

exports.getHistory = async (req, res) => {
    try {
        const User = require('../models/User');
        const user = await User.findById(req.session.user._id).populate({
            path: 'history.video',
            populate: { path: 'uploadedBy', select: 'username' }
        });

        
        const history = user.history.filter(h => h.video).map(h => h);

        res.render('history', { user: req.session.user, history });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
};

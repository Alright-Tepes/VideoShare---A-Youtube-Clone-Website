const Video = require('../models/Video');
const Notification = require('../models/Notification');

exports.toggleLike = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        const userId = req.session.user._id;

        let liked = false;
        let disliked = false;

        if (video.likes.includes(userId)) {
            video.likes.pull(userId);
        } else {
            video.likes.push(userId);
            video.dislikes.pull(userId);
            liked = true;

            if (video.uploadedBy.toString() !== userId.toString()) {
                await Notification.create({
                    recipient: video.uploadedBy,
                    sender: userId,
                    type: 'like',
                    video: video._id
                });
            }
        }
        await video.save();

        res.json({
            success: true,
            likes: video.likes.length,
            dislikes: video.dislikes.length,
            liked,
            disliked
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Sunucu hatası' });
    }
};

exports.toggleDislike = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        const userId = req.session.user._id;

        let liked = false;
        let disliked = false;

        if (video.dislikes.includes(userId)) {
            video.dislikes.pull(userId);
        } else {
            video.dislikes.push(userId);
            video.likes.pull(userId);
            disliked = true;
        }
        await video.save();

        res.json({
            success: true,
            likes: video.likes.length,
            dislikes: video.dislikes.length,
            liked,
            disliked
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Sunucu hatası' });
    }
};

exports.postComment = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        const { text, parentCommentId } = req.body;

        const newComment = {
            user: req.session.user._id,
            text,
            date: new Date()
        };

        if (parentCommentId) {
            const comment = video.comments.id(parentCommentId);
            if (!comment) return res.status(404).json({ error: 'Yorum bulunamadı.' });
            comment.replies.push(newComment);
        } else {
            video.comments.unshift(newComment);
        }

        await video.save();

        

        res.json({ success: true }); 
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Sunucu hatası' });
    }
};

exports.getPlaylistsJSON = async (req, res) => {
    try {
        const Playlist = require('../models/Playlist');
        const playlists = await Playlist.find({ creator: req.session.user._id }).sort({ createdAt: -1 });
        res.json(playlists);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
};

exports.postReport = async (req, res) => {
    try {
        const Report = require('../models/Report');
        const { itemId, itemType, reason } = req.body;

        await Report.create({
            reporter: req.session.user._id,
            itemId,
            itemType,
            reason
        });

        res.json({ success: true, message: 'Bildirim başarıyla gönderildi.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Sunucu hatası' });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const { id, commentId } = req.params;
        const video = await Video.findById(id);
        if (!video) return res.status(404).json({ success: false, error: 'Video bulunamadı.' });

        const userId = req.session.user._id;
        const isAdmin = req.session.user.isAdmin;

        
        let targetComment = video.comments.id(commentId);
        let parentComment = null;

        if (!targetComment) {
            
            for (let c of video.comments) {
                targetComment = c.replies.id(commentId);
                if (targetComment) {
                    parentComment = c;
                    break;
                }
            }
        }

        if (!targetComment) return res.status(404).json({ success: false, error: 'Yorum bulunamadı.' });

        
        const isOwner = video.uploadedBy.toString() === userId.toString();
        const isAuthor = targetComment.user.toString() === userId.toString();

        if (!isAdmin && !isOwner && !isAuthor) {
            return res.status(403).json({ success: false, error: 'Yetkisiz işlem.' });
        }

        if (parentComment) {
            parentComment.replies.pull(commentId);
        } else {
            video.comments.pull(commentId);
        }

        await video.save();
        res.json({ success: true, message: 'Yorum silindi.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Sunucu hatası' });
    }
};

const Video = require('../models/Video');


exports.getStudio = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const Video = require('../models/Video');
        const ViewLog = require('../models/ViewLog');

        const videos = await Video.find({ uploadedBy: userId }).sort({ createdAt: -1 });

        
        const totalViews = videos.reduce((acc, v) => acc + (v.views || 0), 0);
        const totalLikes = videos.reduce((acc, v) => acc + (v.likes ? v.likes.length : 0), 0);

        
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentViewsRaw = await ViewLog.aggregate([
            {
                $match: {
                    video: { $in: videos.map(v => v._id) },
                    viewedAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$viewedAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        res.render('studio', {
            user: req.session.user,
            videos,
            stats: {
                totalViews,
                totalLikes,
                recentViews: recentViewsRaw
            }
        });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
};


exports.getEditVideo = async (req, res) => {
    try {
        const video = await Video.findOne({ _id: req.params.id, uploadedBy: req.session.user._id });
        if (!video) {
            return res.redirect('/studio');
        }
        res.render('edit-video', { user: req.session.user, video });
    } catch (err) {
        console.error(err);
        res.redirect('/studio');
    }
};


exports.postEditVideo = async (req, res) => {
    try {
        const { title, description } = req.body;
        await Video.findOneAndUpdate(
            { _id: req.params.id, uploadedBy: req.session.user._id },
            { title, description }
        );
        res.redirect('/studio');
    } catch (err) {
        console.error(err);
        res.redirect('/studio');
    }
};


exports.postDeleteVideo = async (req, res) => {
    try {
        await Video.findOneAndDelete({ _id: req.params.id, uploadedBy: req.session.user._id });
        res.redirect('/studio');
    } catch (err) {
        console.error(err);
        res.redirect('/studio');
    }
};

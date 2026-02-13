const Playlist = require('../models/Playlist');
const Video = require('../models/Video');


exports.createPlaylist = async (req, res) => {
    try {
        const { title, description, isPublic } = req.body;
        await Playlist.create({
            title,
            description,
            isPublic: isPublic === 'on',
            creator: req.session.user._id
        });
        res.redirect('/playlists');
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
};


exports.getMyPlaylists = async (req, res) => {
    try {
        const playlists = await Playlist.find({ creator: req.session.user._id }).sort({ createdAt: -1 });
        res.render('playlists', { user: req.session.user, playlists });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
};


exports.getPlaylist = async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id)
            .populate({
                path: 'videos',
                populate: { path: 'uploadedBy', select: 'username' }
            })
            .populate('creator', 'username');

        if (!playlist) return res.redirect('/');

        
        if (!playlist.isPublic && (!req.session.user || playlist.creator._id.toString() !== req.session.user._id.toString())) {
            return res.redirect('/');
        }

        res.render('playlist', { user: req.session.user, playlist });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
};


exports.addToPlaylist = async (req, res) => {
    try {
        const { playlistId, videoId } = req.body;
        const playlist = await Playlist.findOne({ _id: playlistId, creator: req.session.user._id });

        if (playlist && !playlist.videos.includes(videoId)) {
            playlist.videos.push(videoId);
            await playlist.save();
        }

        
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.json({ success: true });
        }

        res.redirect('back');
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
};


exports.deletePlaylist = async (req, res) => {
    try {
        await Playlist.findOneAndDelete({ _id: req.params.id, creator: req.session.user._id });
        res.redirect('/playlists');
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
};


exports.removeFromPlaylist = async (req, res) => {
    try {
        const { videoId } = req.body;
        await Playlist.findOneAndUpdate(
            { _id: req.params.id, creator: req.session.user._id },
            { $pull: { videos: videoId } }
        );
        res.redirect(`/playlist/${req.params.id}`);
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
};

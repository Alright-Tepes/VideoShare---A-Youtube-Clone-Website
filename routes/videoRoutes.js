const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const { ensureAuth } = require('../middleware/auth');
const upload = require('../middleware/multer');

router.get('/', videoController.getHome);
router.get('/trending', videoController.getTrending);
router.get('/history', ensureAuth, videoController.getHistory);
router.get('/search', videoController.getSearch);
router.get('/liked-videos', ensureAuth, videoController.getLikedVideos);
router.get('/upload', ensureAuth, videoController.getUpload);
router.post('/upload', ensureAuth, upload.single('thumbnail'), videoController.postUpload);
router.get('/watch/:id', videoController.getWatch);
router.post('/watch/:id/comment', ensureAuth, videoController.postComment);
router.get('/watch/:id/like', ensureAuth, videoController.likeVideo); 
router.get('/watch/:id/dislike', ensureAuth, videoController.dislikeVideo);

module.exports = router;

const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const { ensureAuth } = require('../middleware/auth');

router.post('/api/video/:id/like', ensureAuth, apiController.toggleLike);
router.post('/api/video/:id/dislike', ensureAuth, apiController.toggleDislike);
router.post('/api/video/:id/comment', ensureAuth, apiController.postComment);
router.get('/api/playlists', ensureAuth, apiController.getPlaylistsJSON);
router.post('/api/report', ensureAuth, apiController.postReport);
router.delete('/api/video/:id/comment/:commentId', ensureAuth, apiController.deleteComment);

module.exports = router;

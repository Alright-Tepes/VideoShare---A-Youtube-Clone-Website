const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlistController');
const { ensureAuth } = require('../middleware/auth');

router.get('/playlists', ensureAuth, playlistController.getMyPlaylists);
router.post('/playlists', ensureAuth, playlistController.createPlaylist);
router.get('/playlist/:id', playlistController.getPlaylist);
router.post('/playlist/add', ensureAuth, playlistController.addToPlaylist);
router.post('/playlist/:id/delete', ensureAuth, playlistController.deletePlaylist);
router.post('/playlist/:id/remove', ensureAuth, playlistController.removeFromPlaylist);

module.exports = router;

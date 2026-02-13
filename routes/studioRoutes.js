const express = require('express');
const router = express.Router();
const studioController = require('../controllers/studioController');
const { ensureAuth } = require('../middleware/auth');

router.get('/studio', ensureAuth, studioController.getStudio);
router.get('/studio/video/:id/edit', ensureAuth, studioController.getEditVideo);
router.post('/studio/video/:id/edit', ensureAuth, studioController.postEditVideo);
router.post('/studio/video/:id/delete', ensureAuth, studioController.postDeleteVideo);

module.exports = router;

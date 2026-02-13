const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { ensureAuth } = require('../middleware/auth');

router.get('/notifications', ensureAuth, notificationController.getNotifications);
router.post('/notifications/read', ensureAuth, notificationController.markReads);

module.exports = router;

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { ensureAuth } = require('../middleware/auth');
const upload = require('../middleware/multer');

router.get('/profile', ensureAuth, userController.getProfile);
router.post('/profile', ensureAuth, upload.single('avatar'), userController.updateProfile);
router.get('/channel/:userId', userController.getChannel);
router.post('/channel/:userId/follow', ensureAuth, userController.toggleFollow);
router.get('/appeals', ensureAuth, userController.getAppeals);

module.exports = router;

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { ensureAdmin } = require('../middleware/auth');

router.get('/admin', ensureAdmin, adminController.getDashboard);
router.post('/admin/user/:id/delete', ensureAdmin, adminController.deleteUser);
router.post('/admin/video/:id/delete', ensureAdmin, adminController.deleteVideo);
router.post('/admin/user/:id/toggle-admin', ensureAdmin, adminController.toggleAdmin);
router.post('/admin/user/:id/ban', ensureAdmin, adminController.banUser);
router.post('/admin/user/:id/unban', ensureAdmin, adminController.unbanUser);
router.post('/admin/report/:id/resolve', ensureAdmin, adminController.resolveReport);
router.get('/admin/appeals', ensureAdmin, adminController.getAppeals);
router.post('/admin/appeal/:id/respond', ensureAdmin, adminController.respondToAppeal);
router.post('/admin/video/:id/restore', ensureAdmin, adminController.restoreVideo);
router.post('/api/appeal', adminController.postAppeal); 

module.exports = router;

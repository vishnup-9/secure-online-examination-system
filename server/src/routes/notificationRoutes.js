const router = require('express').Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/notificationController');

router.get('/', protect, ctrl.getMyNotifications);
router.patch('/:id/read', protect, ctrl.markRead);
router.patch('/read-all', protect, ctrl.markAllRead);

module.exports = router;

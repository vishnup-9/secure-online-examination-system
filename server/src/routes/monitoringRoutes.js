const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { getActiveAttempts } = require('../controllers/monitoringController');

router.get('/active', protect, authorize('admin'), getActiveAttempts);

module.exports = router;

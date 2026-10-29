const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { getAdminStats, getStudentStats } = require('../controllers/dashboardController');

router.get('/admin', protect, authorize('admin'), getAdminStats);
router.get('/student', protect, authorize('student'), getStudentStats);

module.exports = router;

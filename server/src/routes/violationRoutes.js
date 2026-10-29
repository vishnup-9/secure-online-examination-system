const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/violationController');

router.post('/', protect, authorize('student'), ctrl.logViolation);
router.get('/', protect, authorize('admin'), ctrl.getAllViolations);
router.get('/attempt/:attemptId', protect, authorize('admin'), ctrl.getAttemptViolations);

module.exports = router;

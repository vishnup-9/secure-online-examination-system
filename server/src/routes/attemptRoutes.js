const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/attemptController');

router.use(protect, authorize('student'));
router.post('/start', ctrl.startAttempt);
router.get('/:id', ctrl.getAttempt);
router.patch('/:id/answer', ctrl.saveAnswer);
router.post('/:id/submit', ctrl.submitAttempt);
router.post('/:id/heartbeat', ctrl.heartbeat);

module.exports = router;

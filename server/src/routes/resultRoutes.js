const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/resultController');

router.get('/student', protect, authorize('student'), ctrl.getStudentResults);
router.get('/student/:id', protect, authorize('student'), ctrl.getStudentResultById);

router.get('/', protect, authorize('admin'), ctrl.getAllResults);
router.get('/export/csv', protect, authorize('admin'), ctrl.exportResultsCsv);
router.get('/:id', protect, authorize('admin'), ctrl.getResultById);

module.exports = router;

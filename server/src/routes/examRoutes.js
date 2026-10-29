const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/examController');

router.get('/student', protect, authorize('student'), ctrl.getStudentExams);

router.use(protect, authorize('admin'));
router.get('/', ctrl.getExams);
router.post('/', ctrl.createExam);
router.get('/:id', ctrl.getExamById);
router.put('/:id', ctrl.updateExam);
router.delete('/:id', ctrl.deleteExam);
router.patch('/:id/publish', ctrl.togglePublish);

module.exports = router;

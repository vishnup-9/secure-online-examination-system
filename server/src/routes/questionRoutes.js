const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/questionController');

router.use(protect, authorize('admin'));
router.get('/', ctrl.getQuestions);
router.post('/', ctrl.createQuestion);
router.get('/:id', ctrl.getQuestionById);
router.put('/:id', ctrl.updateQuestion);
router.delete('/:id', ctrl.deleteQuestion);

module.exports = router;

const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/studentController');

router.use(protect, authorize('admin'));
router.get('/', ctrl.getStudents);
router.post('/', ctrl.createStudent);
router.put('/:id', ctrl.updateStudent);
router.delete('/:id', ctrl.deleteStudent);

module.exports = router;

const router = require('express').Router();
const { studentLogin, adminLogin, registerStudent, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post('/student/login', validate({ email: { required: true, type: 'email' }, password: { required: true, type: 'string' } }), studentLogin);
router.post('/admin/login', validate({ email: { required: true, type: 'email' }, password: { required: true, type: 'string' } }), adminLogin);
router.post('/student/register', validate({
  name: { required: true, type: 'string', maxLength: 100 },
  email: { required: true, type: 'email' },
  password: { required: true, type: 'string', minLength: 6 }
}), registerStudent);
router.get('/me', protect, getMe);

module.exports = router;

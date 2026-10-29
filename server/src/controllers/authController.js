const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');

// Shared login used by both portals; the `role` is enforced server-side by
// checking the stored user record — the client cannot claim a role.
const loginAs = (expectedRole) =>
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) throw new AppError('Email and password are required', 400);

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !user.isActive) throw new AppError('Invalid credentials', 401);

    const match = await user.comparePassword(password);
    if (!match) throw new AppError('Invalid credentials', 401);

    if (user.role !== expectedRole) {
      throw new AppError(`This account is not registered as ${expectedRole}`, 403);
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollNumber: user.rollNumber,
        department: user.department
      }
    });
  });

exports.studentLogin = loginAs('student');
exports.adminLogin = loginAs('admin');

exports.registerStudent = asyncHandler(async (req, res) => {
  const { name, email, password, rollNumber, department } = req.body;
  if (!name || !email || !password) throw new AppError('Name, email and password are required', 400);

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new AppError('An account with this email already exists', 409);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: 'student',
    rollNumber,
    department
  });

  const token = generateToken(user);
  res.status(201).json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
});

exports.getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

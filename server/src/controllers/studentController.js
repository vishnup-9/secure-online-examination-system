const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');

exports.getStudents = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const filter = { role: 'student' };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { rollNumber: { $regex: search, $options: 'i' } }
    ];
  }
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(parseInt(limit, 10) || 20, 100);

  const [students, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
    User.countDocuments(filter)
  ]);
  res.json({ success: true, students, total, page: pageNum, pages: Math.ceil(total / limitNum) });
});

exports.createStudent = asyncHandler(async (req, res) => {
  const { name, email, password, rollNumber, department } = req.body;
  if (!name || !email || !password) throw new AppError('Name, email, password required', 400);
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new AppError('Email already registered', 409);
  const student = await User.create({ name, email: email.toLowerCase(), password, role: 'student', rollNumber, department });
  res.status(201).json({ success: true, student });
});

exports.updateStudent = asyncHandler(async (req, res) => {
  const student = await User.findOne({ _id: req.params.id, role: 'student' });
  if (!student) throw new AppError('Student not found', 404);
  ['name', 'rollNumber', 'department', 'isActive'].forEach((f) => {
    if (req.body[f] !== undefined) student[f] = req.body[f];
  });
  await student.save();
  res.json({ success: true, student });
});

exports.deleteStudent = asyncHandler(async (req, res) => {
  const student = await User.findOneAndDelete({ _id: req.params.id, role: 'student' });
  if (!student) throw new AppError('Student not found', 404);
  res.json({ success: true, message: 'Student removed' });
});

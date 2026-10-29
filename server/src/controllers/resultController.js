const ExamAttempt = require('../models/ExamAttempt');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');

exports.getStudentResults = asyncHandler(async (req, res) => {
  const attempts = await ExamAttempt.find({
    student: req.user._id,
    status: { $in: ['submitted', 'auto_submitted', 'flagged_terminated'] }
  })
    .populate('exam', 'title subject totalMarks passPercentage')
    .sort({ submittedAt: -1 });

  res.json({ success: true, results: attempts });
});

exports.getStudentResultById = asyncHandler(async (req, res) => {
  const attempt = await ExamAttempt.findOne({ _id: req.params.id, student: req.user._id }).populate('exam', 'title subject');
  if (!attempt) throw new AppError('Result not found', 404);
  res.json({ success: true, result: attempt });
});

// Admin: all results with search/filter/sort
exports.getAllResults = asyncHandler(async (req, res) => {
  const { examId, search, sort = '-submittedAt', page = 1, limit = 30 } = req.query;
  const filter = { status: { $in: ['submitted', 'auto_submitted', 'flagged_terminated'] } };
  if (examId) filter.exam = examId;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(parseInt(limit, 10) || 30, 100);

  let query = ExamAttempt.find(filter)
    .populate('student', 'name email rollNumber')
    .populate('exam', 'title subject')
    .sort(sort)
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  let attempts = await query;
  if (search) {
    const re = new RegExp(search, 'i');
    attempts = attempts.filter((a) => re.test(a.student?.name || '') || re.test(a.student?.email || ''));
  }

  const total = await ExamAttempt.countDocuments(filter);
  res.json({ success: true, results: attempts, total, page: pageNum, pages: Math.ceil(total / limitNum) });
});

exports.getResultById = asyncHandler(async (req, res) => {
  const attempt = await ExamAttempt.findById(req.params.id)
    .populate('student', 'name email rollNumber')
    .populate('exam', 'title subject');
  if (!attempt) throw new AppError('Result not found', 404);
  res.json({ success: true, result: attempt });
});

// CSV export of all results (admin)
exports.exportResultsCsv = asyncHandler(async (req, res) => {
  const attempts = await ExamAttempt.find({ status: { $in: ['submitted', 'auto_submitted', 'flagged_terminated'] } })
    .populate('student', 'name email rollNumber')
    .populate('exam', 'title');

  const header = 'Student,Email,RollNumber,Exam,Score,Total,Percentage,Passed,RiskLevel,Status,SubmittedAt\n';
  const rows = attempts.map((a) => {
    const r = a.result || {};
    return [
      a.student?.name, a.student?.email, a.student?.rollNumber || '', a.exam?.title,
      r.finalScore ?? '', r.totalMarks ?? '', r.percentage ?? '', r.passed ?? '',
      a.riskLevel, a.status, a.submittedAt ? a.submittedAt.toISOString() : ''
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',');
  });

  const csv = header + rows.join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="results.csv"');
  res.send(csv);
});

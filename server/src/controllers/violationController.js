const ExamAttempt = require('../models/ExamAttempt');
const ViolationEvent = require('../models/ViolationEvent');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const { severityFor, computeRiskLevel } = require('../utils/riskScore');
const Exam = require('../models/Exam');

// POST /api/violations  { attemptId, eventType, metadata }
// Called by the exam-taking client whenever a proctoring signal fires.
exports.logViolation = asyncHandler(async (req, res) => {
  const { attemptId, eventType, metadata } = req.body;
  if (!attemptId || !eventType) throw new AppError('attemptId and eventType are required', 400);

  const attempt = await ExamAttempt.findOne({ _id: attemptId, student: req.user._id });
  if (!attempt) throw new AppError('Attempt not found', 404);
  if (attempt.status !== 'in_progress') throw new AppError('Attempt is not active', 409);

  const severity = severityFor(eventType);

  const event = await ViolationEvent.create({
    student: req.user._id,
    exam: attempt.exam,
    attempt: attempt._id,
    eventType,
    severity,
    metadata: metadata || {},
    timestamp: new Date()
  });

  const allEvents = await ViolationEvent.find({ attempt: attempt._id });
  attempt.violationCount = allEvents.length;
  attempt.riskLevel = computeRiskLevel(allEvents);
  attempt.lastActivityAt = new Date();

  let autoSubmitted = false;
  const exam = await Exam.findById(attempt.exam);
  if (attempt.riskLevel === 'CRITICAL' && exam?.security?.autoSubmitOnCritical) {
    attempt.status = 'flagged_terminated';
    attempt.submittedAt = new Date();
    autoSubmitted = true;
  }

  await attempt.save();

  res.status(201).json({
    success: true,
    event,
    riskLevel: attempt.riskLevel,
    violationCount: attempt.violationCount,
    autoSubmitted
  });
});

// GET /api/violations/attempt/:attemptId  (admin)
exports.getAttemptViolations = asyncHandler(async (req, res) => {
  const events = await ViolationEvent.find({ attempt: req.params.attemptId }).sort({ timestamp: 1 });
  res.json({ success: true, events });
});

// GET /api/violations  (admin, all violations with filters)
exports.getAllViolations = asyncHandler(async (req, res) => {
  const { severity, eventType, examId, page = 1, limit = 30 } = req.query;
  const filter = {};
  if (severity) filter.severity = severity;
  if (eventType) filter.eventType = eventType;
  if (examId) filter.exam = examId;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(parseInt(limit, 10) || 30, 100);

  const [events, total] = await Promise.all([
    ViolationEvent.find(filter)
      .sort({ timestamp: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate('student', 'name email')
      .populate('exam', 'title'),
    ViolationEvent.countDocuments(filter)
  ]);

  res.json({ success: true, events, total, page: pageNum, pages: Math.ceil(total / limitNum) });
});

const Exam = require('../models/Exam');
const Question = require('../models/Question');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');

const recomputeTotals = async (exam) => {
  const questions = await Question.find({ _id: { $in: exam.questions } });
  exam.totalQuestions = questions.length;
  exam.totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);
};

exports.createExam = asyncHandler(async (req, res) => {
  const {
    title, description, subject, questions, durationMinutes, passPercentage,
    negativeMarking, negativeMarkValue, startTime, endTime, randomizeQuestions,
    randomizeOptions, questionsPerAttempt, security
  } = req.body;

  if (!title || !durationMinutes || !startTime || !endTime) {
    throw new AppError('title, durationMinutes, startTime and endTime are required', 400);
  }
  if (new Date(startTime) >= new Date(endTime)) {
    throw new AppError('endTime must be after startTime', 400);
  }

  const exam = new Exam({
    title, description, subject,
    questions: questions || [],
    durationMinutes, passPercentage, negativeMarking, negativeMarkValue,
    startTime, endTime, randomizeQuestions, randomizeOptions, questionsPerAttempt,
    security, createdBy: req.user._id
  });

  await recomputeTotals(exam);
  await exam.save();
  res.status(201).json({ success: true, exam });
});

exports.updateExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id);
  if (!exam) throw new AppError('Exam not found', 404);

  const fields = [
    'title', 'description', 'subject', 'questions', 'durationMinutes', 'passPercentage',
    'negativeMarking', 'negativeMarkValue', 'startTime', 'endTime', 'randomizeQuestions',
    'randomizeOptions', 'questionsPerAttempt', 'security'
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) exam[f] = req.body[f];
  });

  await recomputeTotals(exam);
  await exam.save();
  res.json({ success: true, exam });
});

exports.deleteExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findByIdAndDelete(req.params.id);
  if (!exam) throw new AppError('Exam not found', 404);
  res.json({ success: true, message: 'Exam deleted' });
});

exports.togglePublish = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id);
  if (!exam) throw new AppError('Exam not found', 404);
  exam.isPublished = !exam.isPublished;
  await exam.save();
  res.json({ success: true, exam });
});

// Admin: full exam list with all fields
exports.getExams = asyncHandler(async (req, res) => {
  const exams = await Exam.find().sort({ startTime: -1 }).populate('questions', 'text subject');
  res.json({ success: true, exams });
});

exports.getExamById = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id).populate('questions');
  if (!exam) throw new AppError('Exam not found', 404);
  res.json({ success: true, exam });
});

// Student: only published exams, bucketed by time, and NEVER includes
// correct answers or the raw question bank here.
exports.getStudentExams = asyncHandler(async (req, res) => {
  const now = new Date();
  const exams = await Exam.find({ isPublished: true }).sort({ startTime: 1 }).select('-questions');

  const upcoming = exams.filter((e) => e.startTime > now);
  const active = exams.filter((e) => e.startTime <= now && e.endTime >= now);
  const completed = exams.filter((e) => e.endTime < now);

  res.json({ success: true, upcoming, active, completed });
});

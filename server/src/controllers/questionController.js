const Question = require('../models/Question');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');

exports.createQuestion = asyncHandler(async (req, res) => {
  const { text, options, correctOptionIndex, subject, category, difficulty, marks, negativeMarks, explanation } = req.body;
  if (!text || !Array.isArray(options) || options.length < 2 || !subject) {
    throw new AppError('text, at least 2 options and subject are required', 400);
  }
  if (correctOptionIndex === undefined || correctOptionIndex < 0 || correctOptionIndex >= options.length) {
    throw new AppError('correctOptionIndex must reference a valid option', 400);
  }

  const question = await Question.create({
    text,
    options: options.map((o) => ({ text: typeof o === 'string' ? o : o.text })),
    correctOptionIndex,
    subject,
    category,
    difficulty,
    marks,
    negativeMarks,
    explanation,
    createdBy: req.user._id
  });

  res.status(201).json({ success: true, question });
});

exports.updateQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id);
  if (!question) throw new AppError('Question not found', 404);

  const fields = ['text', 'options', 'correctOptionIndex', 'subject', 'category', 'difficulty', 'marks', 'negativeMarks', 'explanation'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) {
      question[f] = f === 'options'
        ? req.body.options.map((o) => ({ text: typeof o === 'string' ? o : o.text }))
        : req.body[f];
    }
  });
  await question.save();
  res.json({ success: true, question });
});

exports.deleteQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findByIdAndDelete(req.params.id);
  if (!question) throw new AppError('Question not found', 404);
  res.json({ success: true, message: 'Question deleted' });
});

exports.getQuestions = asyncHandler(async (req, res) => {
  const { search, subject, difficulty, category, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (subject) filter.subject = subject;
  if (difficulty) filter.difficulty = difficulty;
  if (category) filter.category = category;
  if (search) filter.text = { $regex: search, $options: 'i' };

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(parseInt(limit, 10) || 20, 100);

  const [questions, total] = await Promise.all([
    Question.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
    Question.countDocuments(filter)
  ]);

  res.json({ success: true, questions, total, page: pageNum, pages: Math.ceil(total / limitNum) });
});

exports.getQuestionById = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id);
  if (!question) throw new AppError('Question not found', 404);
  res.json({ success: true, question });
});

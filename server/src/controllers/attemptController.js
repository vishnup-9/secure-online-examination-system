const crypto = require('crypto');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const ExamAttempt = require('../models/ExamAttempt');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Strips the correct-answer info from a question before sending to the browser.
const sanitizeQuestionForClient = (question, shuffledOptionOrder) => ({
  id: question._id,
  text: question.text,
  marks: question.marks,
  negativeMarks: question.negativeMarks,
  options: shuffledOptionOrder.map((optId) => {
    const opt = question.options.id(optId);
    return { id: opt._id, text: opt.text };
  })
});

// POST /api/attempts/start  { examId }
// Creates (or resumes) a randomized attempt. Correct answers are never sent.
exports.startAttempt = asyncHandler(async (req, res) => {
  const { examId } = req.body;
  const exam = await Exam.findById(examId).populate('questions');
  if (!exam || !exam.isPublished) throw new AppError('Exam not available', 404);

  const now = new Date();
  if (now < exam.startTime || now > exam.endTime) {
    throw new AppError('Exam is not currently active', 403);
  }

  // Duplicate session detection: only one active attempt per student per exam.
  let attempt = await ExamAttempt.findOne({
    student: req.user._id,
    exam: exam._id,
    status: { $in: ['not_started', 'in_progress'] }
  });

  if (attempt) {
    return res.json({ success: true, attempt: await buildAttemptPayload(attempt, exam) });
  }

  // Prevent re-attempting an already-submitted exam.
  const finished = await ExamAttempt.findOne({
    student: req.user._id,
    exam: exam._id,
    status: { $in: ['submitted', 'auto_submitted', 'flagged_terminated'] }
  });
  if (finished) throw new AppError('You have already attempted this exam', 409);

  let pool = exam.questions;
  if (exam.randomizeQuestions) pool = shuffle(pool);
  if (exam.questionsPerAttempt && exam.questionsPerAttempt < pool.length) {
    pool = pool.slice(0, exam.questionsPerAttempt);
  }

  const answers = pool.map((q) => {
    const optionIds = q.options.map((o) => o._id);
    const shuffledOptionOrder = exam.randomizeOptions ? shuffle(optionIds) : optionIds;
    return {
      question: q._id,
      shuffledOptionOrder,
      selectedOptionId: null,
      markedForReview: false
    };
  });

  attempt = await ExamAttempt.create({
    student: req.user._id,
    exam: exam._id,
    questionOrder: pool.map((q) => q._id),
    answers,
    status: 'in_progress',
    startedAt: now,
    durationMinutes: exam.durationMinutes,
    sessionToken: crypto.randomBytes(16).toString('hex'),
    consentAccepted: true,
    lastActivityAt: now
  });

  res.status(201).json({ success: true, attempt: await buildAttemptPayload(attempt, exam) });
});

async function buildAttemptPayload(attempt, examMaybe) {
  const exam = examMaybe || (await Exam.findById(attempt.exam).populate('questions'));
  const questionsById = {};
  exam.questions.forEach((q) => { questionsById[q._id.toString()] = q; });

  const questions = attempt.questionOrder.map((qid) => {
    const q = questionsById[qid.toString()];
    const ans = attempt.answers.find((a) => a.question.toString() === qid.toString());
    return sanitizeQuestionForClient(q, ans.shuffledOptionOrder);
  });

  const elapsedSeconds = attempt.startedAt ? Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000) : 0;
  const remainingSeconds = Math.max(attempt.durationMinutes * 60 - elapsedSeconds, 0);

  return {
    id: attempt._id,
    examTitle: exam.title,
    status: attempt.status,
    durationMinutes: attempt.durationMinutes,
    remainingSeconds,
    security: exam.security,
    questions,
    answers: attempt.answers.map((a) => ({
      questionId: a.question,
      selectedOptionId: a.selectedOptionId,
      markedForReview: a.markedForReview
    }))
  };
}

// PATCH /api/attempts/:id/answer  { questionId, selectedOptionId, markedForReview }
// Auto-save endpoint — called frequently, must be cheap and idempotent.
exports.saveAnswer = asyncHandler(async (req, res) => {
  const { questionId, selectedOptionId, markedForReview } = req.body;
  const attempt = await ExamAttempt.findOne({ _id: req.params.id, student: req.user._id });
  if (!attempt) throw new AppError('Attempt not found', 404);
  if (attempt.status !== 'in_progress') throw new AppError('Attempt is not active', 409);

  const answer = attempt.answers.find((a) => a.question.toString() === questionId);
  if (!answer) throw new AppError('Question not part of this attempt', 400);

  if (selectedOptionId !== undefined) answer.selectedOptionId = selectedOptionId || null;
  if (markedForReview !== undefined) answer.markedForReview = !!markedForReview;
  attempt.lastActivityAt = new Date();

  await attempt.save();
  res.json({ success: true });
});

// POST /api/attempts/:id/submit
// Backend is the single source of truth for grading. Frontend cannot
// influence marks in any way — we recompute from the stored correct answers.
exports.submitAttempt = asyncHandler(async (req, res) => {
  const attempt = await ExamAttempt.findOne({ _id: req.params.id, student: req.user._id });
  if (!attempt) throw new AppError('Attempt not found', 404);
  if (['submitted', 'auto_submitted', 'flagged_terminated'].includes(attempt.status)) {
    return res.json({ success: true, result: attempt.result });
  }

  const exam = await Exam.findById(attempt.exam);
  const questions = await Question.find({ _id: { $in: attempt.questionOrder } });
  const questionsById = {};
  questions.forEach((q) => { questionsById[q._id.toString()] = q; });

  let correct = 0, incorrect = 0, unanswered = 0, positiveMarks = 0, negativeMarks = 0;

  attempt.answers.forEach((ans) => {
    const q = questionsById[ans.question.toString()];
    if (!q) return;
    const correctOptionId = q.options[q.correctOptionIndex]?._id?.toString();

    if (!ans.selectedOptionId) {
      unanswered += 1;
      ans.isCorrect = null;
      ans.marksAwarded = 0;
      return;
    }

    if (ans.selectedOptionId.toString() === correctOptionId) {
      correct += 1;
      ans.isCorrect = true;
      ans.marksAwarded = q.marks;
      positiveMarks += q.marks;
    } else {
      incorrect += 1;
      ans.isCorrect = false;
      const penalty = exam.negativeMarking ? q.marks * exam.negativeMarkValue : 0;
      ans.marksAwarded = -penalty;
      negativeMarks += penalty;
    }
  });

  const totalMarks = questions.reduce((s, q) => s + q.marks, 0);
  const finalScore = positiveMarks - negativeMarks;
  const percentage = totalMarks > 0 ? (finalScore / totalMarks) * 100 : 0;
  const timeTakenSeconds = attempt.startedAt ? Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000) : 0;

  attempt.result = {
    totalQuestions: questions.length,
    correct, incorrect, unanswered,
    positiveMarks, negativeMarks,
    finalScore, totalMarks,
    percentage: Math.round(percentage * 100) / 100,
    passed: percentage >= (exam.passPercentage || 0),
    timeTakenSeconds
  };
  attempt.status = req.body.reason === 'auto' ? 'auto_submitted' : 'submitted';
  attempt.submittedAt = new Date();
  await attempt.save();

  res.json({ success: true, result: attempt.result });
});

exports.getAttempt = asyncHandler(async (req, res) => {
  const attempt = await ExamAttempt.findOne({ _id: req.params.id, student: req.user._id }).populate('exam', 'title security durationMinutes');
  if (!attempt) throw new AppError('Attempt not found', 404);
  res.json({ success: true, attempt: await buildAttemptPayload(attempt) });
});

exports.heartbeat = asyncHandler(async (req, res) => {
  const attempt = await ExamAttempt.findOne({ _id: req.params.id, student: req.user._id });
  if (!attempt) throw new AppError('Attempt not found', 404);
  attempt.lastActivityAt = new Date();
  if (req.body.camera) {
    attempt.camera.active = !!req.body.camera.active;
    attempt.camera.faceDetected = !!req.body.camera.faceDetected;
  }
  await attempt.save();
  res.json({ success: true });
});

module.exports.buildAttemptPayload = buildAttemptPayload;

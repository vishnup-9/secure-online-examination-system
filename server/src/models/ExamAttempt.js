const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    // order of option ids as shown to this student (for un-shuffling on grading)
    shuffledOptionOrder: [{ type: mongoose.Schema.Types.ObjectId }],
    selectedOptionId: { type: mongoose.Schema.Types.ObjectId, default: null },
    markedForReview: { type: Boolean, default: false },
    isCorrect: { type: Boolean, default: null },
    marksAwarded: { type: Number, default: 0 }
  },
  { _id: false }
);

const examAttemptSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true, index: true },
    // randomized order of question ids for this attempt
    questionOrder: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    answers: [answerSchema],
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'submitted', 'auto_submitted', 'flagged_terminated'],
      default: 'not_started'
    },
    startedAt: { type: Date },
    submittedAt: { type: Date },
    durationMinutes: { type: Number },
    sessionToken: { type: String },
    consentAccepted: { type: Boolean, default: false },
    result: {
      totalQuestions: Number,
      correct: Number,
      incorrect: Number,
      unanswered: Number,
      positiveMarks: Number,
      negativeMarks: Number,
      finalScore: Number,
      totalMarks: Number,
      percentage: Number,
      passed: Boolean,
      timeTakenSeconds: Number
    },
    riskLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'LOW' },
    violationCount: { type: Number, default: 0 },
    lastActivityAt: { type: Date, default: Date.now },
    camera: {
      active: { type: Boolean, default: false },
      faceDetected: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

examAttemptSchema.index({ student: 1, exam: 1 }, { unique: false });

module.exports = mongoose.model('ExamAttempt', examAttemptSchema);

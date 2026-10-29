const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    subject: { type: String, trim: true },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    totalQuestions: { type: Number, default: 0 },
    durationMinutes: { type: Number, required: true, min: 1 },
    totalMarks: { type: Number, default: 0 },
    passPercentage: { type: Number, default: 40 },
    negativeMarking: { type: Boolean, default: false },
    negativeMarkValue: { type: Number, default: 0.25 },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    isPublished: { type: Boolean, default: false },
    randomizeQuestions: { type: Boolean, default: true },
    randomizeOptions: { type: Boolean, default: true },
    questionsPerAttempt: { type: Number },
    security: {
      requireFullscreen: { type: Boolean, default: true },
      requireWebcam: { type: Boolean, default: true },
      maxTabSwitchWarnings: { type: Number, default: 2 },
      maxFullscreenExitWarnings: { type: Number, default: 2 },
      autoSubmitOnCritical: { type: Boolean, default: true },
      faceCheckGraceSeconds: { type: Number, default: 8 },
      lookAwaySustainSeconds: { type: Number, default: 5 }
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

examSchema.index({ startTime: 1, endTime: 1 });
examSchema.index({ isPublished: 1 });

module.exports = mongoose.model('Exam', examSchema);

const mongoose = require('mongoose');

const violationEventSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true, index: true },
    attempt: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamAttempt', required: true, index: true },
    eventType: {
      type: String,
      enum: [
        'TAB_SWITCH', 'VISIBILITY_CHANGE', 'WINDOW_BLUR', 'FULLSCREEN_EXIT',
        'COPY', 'CUT', 'PASTE', 'RIGHT_CLICK', 'SUSPICIOUS_SHORTCUT',
        'WEBCAM_DISCONNECT', 'NO_FACE', 'MULTIPLE_FACES', 'LOOKING_AWAY',
        'REFRESH_ATTEMPT', 'DUPLICATE_SESSION'
      ],
      required: true
    },
    severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], required: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

violationEventSchema.index({ attempt: 1, timestamp: -1 });

module.exports = mongoose.model('ViolationEvent', violationEventSchema);

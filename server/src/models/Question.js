const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema(
  { text: { type: String, required: true, trim: true } },
  { _id: true }
);

const questionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    options: {
      type: [optionSchema],
      validate: (v) => Array.isArray(v) && v.length >= 2 && v.length <= 6
    },
    correctOptionIndex: { type: Number, required: true, min: 0 },
    subject: { type: String, required: true, trim: true, index: true },
    category: { type: String, trim: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    marks: { type: Number, default: 1, min: 0 },
    negativeMarks: { type: Number, default: 0, min: 0 },
    explanation: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

questionSchema.index({ subject: 1, difficulty: 1 });

module.exports = mongoose.model('Question', questionSchema);

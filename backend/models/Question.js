// agent-notes: { ctx: "Aptitude Question Mongoose schema with 4 options, correctAnswer integer index, explanation, solution & questionHash index", deps: ["mongoose"], state: "active", last: "anti@2026-08-04" }

import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  topicId: {
    type: String,
    required: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  topic: {
    type: String,
    required: true,
    index: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'expert'],
    default: 'medium',
    index: true
  },
  question: {
    type: String,
    required: true
  },
  optionA: { type: String },
  optionB: { type: String },
  optionC: { type: String },
  optionD: { type: String },
  options: {
    type: [String],
    default: []
  },
  correctAnswer: {
    type: Number, // 0, 1, 2, or 3
    required: true
  },
  explanation: {
    type: String,
    required: true
  },
  solution: {
    type: String,
    default: ''
  },
  tags: {
    type: [String],
    default: []
  },
  source: {
    type: String,
    default: 'Gemini AI Generator'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  questionHash: {
    type: String,
    required: true,
    unique: true,
    index: true
  }
}, { timestamps: true });

QuestionSchema.index({ topicId: 1, difficulty: 1 });
QuestionSchema.index({ category: 1, topicId: 1 });

export default mongoose.models.Question || mongoose.model('Question', QuestionSchema);

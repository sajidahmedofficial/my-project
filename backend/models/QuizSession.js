// agent-notes: { ctx: "Quiz Session model for user aptitude test attempts & scores", deps: ["mongoose"], state: "active", last: "anti@2026-08-04" }

import mongoose from 'mongoose';

const QuizAnswerSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  selectedOption: { type: String, default: '' },
  isCorrect: { type: Boolean, default: false },
  timeTaken: { type: Number, default: 0 },
  markedForReview: { type: Boolean, default: false }
}, { _id: false });

const QuizSessionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  topicId: {
    type: String,
    required: true
  },
  topicName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'expert', 'all'],
    default: 'medium'
  },
  mode: {
    type: String,
    enum: ['practice', 'test', 'timed'],
    default: 'practice'
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  questions: [{ type: String }], // Array of Question IDs
  answers: [QuizAnswerSchema],
  score: {
    type: Number,
    default: 0
  },
  correctCount: {
    type: Number,
    default: 0
  },
  accuracy: {
    type: Number,
    default: 0
  },
  totalTimeSeconds: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed'],
    default: 'in_progress'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
}, { timestamps: true });

export default mongoose.models.QuizSession || mongoose.model('QuizSession', QuizSessionSchema);

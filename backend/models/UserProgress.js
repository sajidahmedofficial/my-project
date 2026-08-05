// agent-notes: { ctx: "User question progress tracking per question and topic accuracy aggregations", deps: ["mongoose"], state: "active", last: "anti@2026-08-04" }

import mongoose from 'mongoose';

const UserQuestionProgressSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
    default: 'guest_user'
  },
  questionId: {
    type: String,
    required: true,
    index: true
  },
  topicId: {
    type: String,
    required: true,
    index: true
  },
  attempts: {
    type: Number,
    default: 1
  },
  correctAttempts: {
    type: Number,
    default: 0
  },
  incorrectAttempts: {
    type: Number,
    default: 0
  },
  lastAnsweredAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

UserQuestionProgressSchema.index({ userId: 1, questionId: 1 }, { unique: true });
UserQuestionProgressSchema.index({ userId: 1, topicId: 1 });

export default mongoose.models.UserProgress || mongoose.model('UserProgress', UserQuestionProgressSchema);

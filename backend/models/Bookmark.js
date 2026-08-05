// agent-notes: { ctx: "Bookmark schema for saving aptitude questions per user", deps: ["mongoose"], state: "active", last: "anti@2026-08-04" }

import mongoose from 'mongoose';

const BookmarkSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  questionId: {
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
  questionText: {
    type: String,
    required: true
  },
  savedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

BookmarkSchema.index({ userId: 1, questionId: 1 }, { unique: true });

export default mongoose.models.Bookmark || mongoose.model('Bookmark', BookmarkSchema);

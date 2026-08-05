// agent-notes: { ctx: "Topic Mongoose schema for 87 aptitude topics with question targets and count tracking", deps: ["mongoose"], state: "active", last: "anti@2026-08-04" }

import mongoose from 'mongoose';

const TopicSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Quantitative Aptitude',
      'Logical Reasoning',
      'Verbal Ability',
      'Data Interpretation',
      'General Placement Aptitude'
    ],
    index: true
  },
  description: {
    type: String,
    default: ''
  },
  questionTarget: {
    type: Number,
    default: 1000
  },
  easyTarget: {
    type: Number,
    default: 400
  },
  mediumTarget: {
    type: Number,
    default: 400
  },
  hardTarget: {
    type: Number,
    default: 200
  },
  questionCount: {
    type: Number,
    default: 0
  },
  easyCount: {
    type: Number,
    default: 0
  },
  mediumCount: {
    type: Number,
    default: 0
  },
  hardCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.models.Topic || mongoose.model('Topic', TopicSchema);

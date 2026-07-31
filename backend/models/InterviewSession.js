import mongoose from 'mongoose';

const qaSchema = new mongoose.Schema({
  question: String,
  studentAnswer: String,
  modelAnswer: String,
  correctness: Number,
  confidence: Number,
  communication: Number,
  overallScore: Number,
  feedback: String,
  notes: [String]
});

const interviewSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  track: {
    type: String,
    required: true,
    enum: ['frontend', 'backend', 'hr']
  },
  overallScore: {
    type: Number,
    required: true
  },
  correctness: Number,
  confidence: Number,
  communication: Number,
  evaluations: [qaSchema]
}, {
  timestamps: true
});

const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);
export default InterviewSession;

// agent-notes: { ctx: "AssessmentResult relational model recording candidate question responses, answer evaluations, and scores", deps: ["mongoose"], state: "active", last: "anti@2026-08-20" }
import mongoose from 'mongoose';

const assessmentResultSchema = new mongoose.Schema({
  assessmentId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  skillName: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['mcq', 'coding', 'project'], 
    required: true 
  },
  score: { type: Number, required: true },
  correctCount: { type: Number, default: 0 },
  wrongCount: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['passed', 'failed', 'pending'], 
    required: true 
  },
  answers: [{
    questionId: String,
    userAnswer: String,
    isCorrect: Boolean
  }],
  submittedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

const AssessmentResult = mongoose.models.AssessmentResult || mongoose.model('AssessmentResult', assessmentResultSchema);
export default AssessmentResult;

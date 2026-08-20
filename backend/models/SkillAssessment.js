// agent-notes: { ctx: "Skill Assessment model for recording multi-modal MCQ, Code & Project verification results", deps: ["mongoose"], state: "active", last: "anti@2026-08-20" }
import mongoose from 'mongoose';

const skillAssessmentSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  skillName: { type: String, required: true },
  mcqScore: { type: Number, required: true, default: 0 },
  codingScore: { type: Number, required: true, default: 0 },
  projectScore: { type: Number, required: true, default: 0 },
  overallScore: { type: Number, required: true, default: 0 },
  projectUrl: { type: String, default: '' },
  passingThreshold: { type: Number, default: 75 },
  status: { 
    type: String, 
    enum: ['PENDING', 'PASSED', 'FAILED', 'VERIFIED'], 
    default: 'PENDING' 
  },
  aiFeedback: { type: String, default: '' },
  detailedBreakdown: {
    mcqCorrect: { type: Number, default: 0 },
    mcqTotal: { type: Number, default: 0 },
    codeTestsPassed: { type: Number, default: 0 },
    codeTestsTotal: { type: Number, default: 0 },
    projectCriteriaMet: [{ type: String }]
  },
  certificateId: { type: String, default: null },
  attemptNumber: { type: Number, default: 1 },
  completedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

const SkillAssessment = mongoose.models.SkillAssessment || mongoose.model('SkillAssessment', skillAssessmentSchema);
export default SkillAssessment;

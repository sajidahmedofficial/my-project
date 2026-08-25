// agent-notes: { ctx: "SkillVerification relational model recording multi-modal verification proof, repository evidence, and certificate linkage", deps: ["mongoose"], state: "active", last: "anti@2026-08-20" }
import mongoose from 'mongoose';

const skillVerificationSchema = new mongoose.Schema({
  verificationId: { type: String, required: true, unique: true, index: true },
  userId: { type: String, required: true, index: true },
  skillName: { type: String, required: true },
  skillGapId: { type: String, ref: 'SkillGap', default: null },
  mcqScore: { type: Number, required: true },
  codingScore: { type: Number, required: true },
  projectScore: { type: Number, required: true },
  finalScore: { type: Number, required: true },
  passingThreshold: { type: Number, default: 75 },
  status: { 
    type: String, 
    enum: ['pending', 'failed', 'verified'], 
    required: true 
  },
  repositoryUrl: { type: String, default: '' },
  repositoryName: { type: String, default: '' },
  evidence: [{ type: String }],
  certificateId: { type: String, ref: 'Certificate', default: null },
  verifiedAt: { type: Date, default: null }
}, {
  timestamps: true
});

const SkillVerification = mongoose.models.SkillVerification || mongoose.model('SkillVerification', skillVerificationSchema);
export default SkillVerification;

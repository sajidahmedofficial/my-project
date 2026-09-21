// agent-notes: { ctx: "UserSkill relational model linking User, SkillGap, status, proficiency, and verification", deps: ["mongoose"], state: "active", last: "anti@2026-08-20" }
import mongoose from 'mongoose';

const userSkillSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  resumeId: { type: String, ref: 'Resume', default: null },
  skillGapId: { type: String, ref: 'SkillGap', default: null },
  skillName: { type: String, required: true },
  category: { type: String, default: 'Other' },
  status: { 
    type: String, 
    enum: ['strong', 'partial', 'missing', 'verified', 'GAINED', 'LEARNING'], 
    default: 'missing' 
  },
  currentLevel: { type: Number, default: 0 },
  requiredLevel: { type: Number, default: 80 },
  gapPercentage: { type: Number, default: 100 },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  verified: { type: Boolean, default: false },
  verifiedScore: { type: Number, default: null },
  verifiedAt: { type: Date, default: null },
  certificateId: { type: String, ref: 'Certificate', default: null }
}, {
  timestamps: true
});

userSkillSchema.index({ userId: 1, skillName: 1 }, { unique: true });

const UserSkill = mongoose.models.UserSkill || mongoose.model('UserSkill', userSkillSchema);
export default UserSkill;

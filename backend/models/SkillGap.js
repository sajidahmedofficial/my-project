// agent-notes: { ctx: "Skill Gap model storing user target role comparisons, proficiencies, and priorities", deps: ["mongoose"], state: "active", last: "anti@2026-08-20" }
import mongoose from 'mongoose';

const skillGapItemSchema = new mongoose.Schema({
  skillName: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Programming', 'Frameworks', 'Databases', 'Tools', 'Cloud/DevOps', 'Soft Skills', 'Other'],
    default: 'Other'
  },
  status: { 
    type: String, 
    enum: ['STRONG', 'PARTIAL', 'MISSING', 'VERIFIED'], 
    default: 'MISSING' 
  },
  currentProficiency: { 
    type: String, 
    enum: ['None', 'Beginner', 'Intermediate', 'Advanced'], 
    default: 'None' 
  },
  requiredProficiency: { 
    type: String, 
    enum: ['Beginner', 'Intermediate', 'Advanced'], 
    default: 'Intermediate' 
  },
  gapPercentage: { type: Number, default: 100 }, // 0% (no gap) to 100% (complete gap)
  priority: { 
    type: String, 
    enum: ['High', 'Medium', 'Low'], 
    default: 'Medium' 
  },
  reason: { type: String, default: '' },
  verifiedScore: { type: Number, default: null },
  verifiedAt: { type: Date, default: null }
}, { _id: false });

const skillGapSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  targetRole: { type: String, required: true },
  overallMatchScore: { type: Number, default: 0 },
  categoryScores: {
    technicalSkills: { type: Number, default: 0 },
    programming: { type: Number, default: 0 },
    frameworks: { type: Number, default: 0 },
    databases: { type: Number, default: 0 },
    tools: { type: Number, default: 0 },
    cloudDevOps: { type: Number, default: 0 }
  },
  strongSkills: [skillGapItemSchema],
  partialSkills: [skillGapItemSchema],
  missingSkills: [skillGapItemSchema],
  analyzedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

const SkillGap = mongoose.models.SkillGap || mongoose.model('SkillGap', skillGapSchema);
export default SkillGap;

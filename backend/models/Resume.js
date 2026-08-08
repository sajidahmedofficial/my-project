// agent-notes: { ctx: "Mongoose schema for parsed and updated user resumes", deps: ["mongoose"], state: "active", last: "anti@2026-08-06" }
import mongoose from 'mongoose';

const ResumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fileName: { type: String, required: true },
  resumeScore: { type: Number, default: 68 },
  atsScore: { type: Number, default: 72 },
  grammarScore: { type: Number, default: 84 },
  skillGapScore: { type: Number, default: 47 },
  parsedSkills: [{ type: String }],
  problems: [{
    original: String,
    problem: String,
    suggested: String,
    fixed: { type: Boolean, default: false }
  }],
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Resume || mongoose.model('Resume', ResumeSchema);

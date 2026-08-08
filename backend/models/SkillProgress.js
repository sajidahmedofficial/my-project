// agent-notes: { ctx: "Mongoose schema for tracking user skill gain progress", deps: ["mongoose"], state: "active", last: "anti@2026-08-06" }
import mongoose from 'mongoose';

const SkillProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  skillName: { type: String, required: true },
  status: { type: String, enum: ['GAINED', 'LEARNING', 'MISSING'], default: 'MISSING' },
  progress: { type: Number, default: 0 },
  certified: { type: Boolean, default: false },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.SkillProgress || mongoose.model('SkillProgress', SkillProgressSchema);

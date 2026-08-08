// agent-notes: { ctx: "Mongoose schema for role competencies and skill definitions", deps: ["mongoose"], state: "active", last: "anti@2026-08-06" }
import mongoose from 'mongoose';

const SkillSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: { type: String, enum: ['frontend', 'backend', 'database', 'tools', 'deployment'], default: 'frontend' },
  description: String
});

export default mongoose.models.Skill || mongoose.model('Skill', SkillSchema);

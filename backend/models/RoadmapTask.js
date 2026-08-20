// agent-notes: { ctx: "RoadmapTask relational model linking Roadmap, Stage, User, status, and score", deps: ["mongoose"], state: "active", last: "anti@2026-08-20" }
import mongoose from 'mongoose';

const roadmapTaskSchema = new mongoose.Schema({
  taskId: { type: String, required: true, unique: true, index: true },
  roadmapId: { type: String, required: true, ref: 'LearningRoadmap', index: true },
  userId: { type: String, required: true, index: true },
  stageNumber: { type: Number, default: 1 },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  type: { 
    type: String, 
    enum: ['reading', 'practice', 'quiz', 'coding', 'project'], 
    default: 'practice' 
  },
  status: { 
    type: String, 
    enum: ['pending', 'in_progress', 'completed'], 
    default: 'pending' 
  },
  score: { type: Number, default: 0 },
  completedAt: { type: Date, default: null }
}, {
  timestamps: true
});

const RoadmapTask = mongoose.models.RoadmapTask || mongoose.model('RoadmapTask', roadmapTaskSchema);
export default RoadmapTask;

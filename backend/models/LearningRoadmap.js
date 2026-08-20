// agent-notes: { ctx: "Learning Roadmap model tracking structured tasks, taskIds, completion status, and dynamic server-calculated progress", deps: ["mongoose"], state: "active", last: "anti@2026-08-20" }
import mongoose from 'mongoose';

const roadmapTaskSchema = new mongoose.Schema({
  taskId: { type: String, required: true },
  roadmapId: { type: String, default: '' },
  userId: { type: String, default: '' },
  title: { type: String, required: true },
  stageNumber: { type: Number, default: 1 },
  taskType: { 
    type: String, 
    enum: ['topic', 'practice', 'coding', 'project', 'assessment'], 
    default: 'topic' 
  },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard', 'Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
  completed: { type: Boolean, default: false },
  score: { type: Number, default: null },
  completedAt: { type: Date, default: null }
}, { _id: false });

const roadmapStageSchema = new mongoose.Schema({
  stageNumber: { type: Number, required: true },
  title: { type: String, required: true },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  topics: [{ type: String }],
  practiceTasks: [{ type: String }],
  miniProject: { type: String, default: '' },
  tasks: [roadmapTaskSchema],
  stageProgress: { type: Number, default: 0 }
}, { _id: false });

const learningRoadmapSchema = new mongoose.Schema({
  roadmapId: { type: String, index: true },
  userId: { type: String, required: true, index: true },
  targetRole: { type: String, required: true },
  skillName: { type: String, required: true },
  currentLevel: { type: String, default: 'Beginner' },
  targetLevel: { type: String, default: 'Advanced' },
  priority: { type: String, enum: ['High', 'Medium', 'Low', 'high', 'medium', 'low'], default: 'Medium' },
  prerequisites: [{ type: String }],
  estimatedLearningHours: { type: Number, default: 20 },
  stages: [roadmapStageSchema],
  tasks: [roadmapTaskSchema],
  finalProject: {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    repositoryUrl: { type: String, default: '' },
    score: { type: Number, default: null }
  },
  assessmentInfo: {
    mcqCount: { type: Number, default: 10 },
    codingCount: { type: Number, default: 2 },
    passingThreshold: { type: Number, default: 75 }
  },
  overallProgress: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED'], 
    default: 'IN_PROGRESS' 
  }
}, {
  timestamps: true
});

const LearningRoadmap = mongoose.models.LearningRoadmap || mongoose.model('LearningRoadmap', learningRoadmapSchema);
export default LearningRoadmap;

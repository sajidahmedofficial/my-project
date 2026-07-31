// agent-notes: { ctx: "Roadmap MongoDB Mongoose Schema", deps: ["mongoose"], state: "active", last: "anti@2026-07-30" }
const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: String,
  type: { type: String, enum: ['video', 'docs', 'practice', 'project', 'course'] },
  url: String,
  provider: String,
  estimatedTime: String
});

const roadmapSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobRole: { type: String, required: true },
  week: { type: Number, required: true },
  title: { type: String, required: true },
  objectives: [{ type: String }],
  resources: [resourceSchema],
  completed: { type: Boolean, default: false },
  progress: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Roadmap', roadmapSchema);

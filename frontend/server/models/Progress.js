// agent-notes: { ctx: "Progress MongoDB Mongoose Schema", deps: ["mongoose"], state: "active", last: "anti@2026-07-30" }
const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  completion: { type: Number, default: 0 }, // percentage 0-100
  quizScore: { type: Number, default: 0 },
  certificate: {
    issued: { type: Boolean, default: false },
    issuedAt: Date,
    certificateUrl: String,
    title: String
  },
  timeSpent: { type: Number, default: 0 }, // in hours
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Progress', progressSchema);

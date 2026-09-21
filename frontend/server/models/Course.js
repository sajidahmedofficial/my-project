// agent-notes: { ctx: "Course MongoDB Mongoose Schema", deps: ["mongoose"], state: "active", last: "anti@2026-07-30" }
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  provider: { type: String, required: true },
  duration: { type: String, required: true },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
  url: { type: String, required: true },
  skills: [{ type: String }],
  certificate: { type: Boolean, default: true },
  rating: { type: Number, default: 4.8 },
  enrolledStudents: { type: Number, default: 1250 }
});

module.exports = mongoose.model('Course', courseSchema);

// agent-notes: { ctx: "User MongoDB Mongoose Schema", deps: ["mongoose"], state: "active", last: "anti@2026-07-31" }
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  college: { type: String, default: '' },
  degree: { type: String, default: '' },
  department: { type: String, default: '' },
  graduationYear: { type: Number, default: new Date().getFullYear() + 1 },
  careerGoal: { type: String, default: 'Full Stack Engineer' },
  experienceLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  skills: [{ type: String }],
  interests: [{ type: String }],
  learningPreferences: {
    weeklyCommitmentHours: { type: Number, default: 10 },
    pace: { type: String, default: 'Moderate' },
    preferredPlatforms: [{ type: String }]
  },
  resumeURL: { type: String, default: '' },
  roadmapID: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String, default: '' },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);

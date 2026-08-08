// agent-notes: { ctx: "Mongoose schema for User account and authentication profile", deps: ["mongoose"], state: "active", last: "anti@2026-08-06" }
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  targetRole: { type: String, default: 'Full Stack Developer' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.User || mongoose.model('User', UserSchema);

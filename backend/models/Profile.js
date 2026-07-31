import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: String,
  tech: String,
  description: String
});

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skills: [String],
  projects: [projectSchema],
  education: {
    type: String,
    default: ""
  },
  experience: {
    type: String,
    default: ""
  },
  scores: {
    resumeScore: { type: Number, default: 50 },
    skillScore: { type: Number, default: 40 },
    placementReadiness: { type: Number, default: 40 },
    weeklyGoalsProgress: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

const Profile = mongoose.model('Profile', profileSchema);
export default Profile;

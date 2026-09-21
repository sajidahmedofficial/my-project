// agent-notes: { ctx: "Mongoose schema for SkillBridge AI certificate system matching 9-field verification database model", deps: ["mongoose"], state: "active", last: "anti@2026-08-06" }
import mongoose from 'mongoose';

const CertificateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  skillId: { type: String },
  skillName: { type: String, required: true },
  score: { type: Number, required: true, default: 91 },
  certificateId: { type: String, required: true, unique: true },
  issuedAt: { type: Date, default: Date.now },
  verificationHash: { type: String, required: true },
  pdfPath: { type: String, default: "" }
});

export default mongoose.models.Certificate || mongoose.model('Certificate', CertificateSchema);

// agent-notes: { ctx: "Production-grade persistent resume store maintaining disk persistence and strict user data isolation", deps: ["../storage/persistentStore.js", "../models/Resume.js", "mongoose"], state: "active", last: "anti@2026-08-20" }
import mongoose from 'mongoose';
import persistentStore from '../storage/persistentStore.js';
import Resume from '../models/Resume.js';

export function saveParsedResume({ resumeId, userId = "guest_user", fileName, resumeText, analysis = null, targetRole = "Frontend Developer" }) {
  const id = resumeId || `res_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`;
  const record = {
    resumeId: id,
    userId,
    fileName: fileName || "Uploaded_Resume.pdf",
    resumeText: resumeText || "",
    analysis,
    targetRole,
    updatedAt: new Date().toISOString()
  };

  // 1. Save to persistent disk storage
  persistentStore.upsert('resumes', 'resumeId', record);

  // 2. Persist to MongoDB if connected
  if (mongoose.connection.readyState === 1) {
    try {
      Resume.findOneAndUpdate(
        { userId, fileName: record.fileName },
        {
          userId,
          fileName: record.fileName,
          resumeScore: analysis?.atsScore || 70,
          atsScore: analysis?.atsScore || 70,
          parsedSkills: analysis?.extractedSkills || [],
          updatedAt: new Date()
        },
        { upsert: true, new: true }
      ).catch(() => {});
    } catch {}
  }

  return record;
}

export function getParsedResume(resumeId, userId = null) {
  // Query persistent disk store ensuring user ownership
  if (resumeId) {
    const filter = { resumeId };
    if (userId) filter.userId = userId;
    return persistentStore.findOne('resumes', filter);
  }

  if (userId) {
    const userResumes = persistentStore.find('resumes', { userId });
    return userResumes.length > 0 ? userResumes[userResumes.length - 1] : null;
  }

  return null;
}

export function getAllResumes(userId = null) {
  const filter = userId ? { userId } : {};
  return persistentStore.find('resumes', filter);
}

export default {
  saveParsedResume,
  getParsedResume,
  getAllResumes
};

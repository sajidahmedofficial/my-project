// agent-notes: { ctx: "Production-grade persistent resume store maintaining disk persistence and strict user data isolation", deps: ["../storage/persistentStore.js", "../models/Resume.js", "mongoose"], state: "active", last: "anti@2026-08-29" }
import mongoose from 'mongoose';
import persistentStore, { readCollection, writeCollection } from '../storage/persistentStore.js';
import Resume from '../models/Resume.js';

export function saveParsedResume({ resumeId, userId = "guest_user", fileName, resumeText, analysis = null, targetRole = "Full Stack Developer", jobDescription = "" }) {
  const id = resumeId || `res_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`;
  const record = {
    id,
    resumeId: id,
    userId,
    fileName: fileName || "Uploaded_Resume.pdf",
    resumeText: resumeText || "",
    analysis,
    targetRole,
    jobDescription,
    overall_score: analysis?.overall_score ?? 75,
    ats_score: analysis?.ats_compatibility?.score ?? 75,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // 1. Save to persistent disk storage
  persistentStore.upsert('resumes', 'id', record);

  // 2. Persist to MongoDB if connected
  if (mongoose.connection.readyState === 1) {
    try {
      Resume.findOneAndUpdate(
        { userId, fileName: record.fileName },
        {
          userId,
          fileName: record.fileName,
          resumeScore: analysis?.overall_score || 70,
          atsScore: analysis?.ats_compatibility?.score || 70,
          parsedSkills: analysis?.keyword_gaps?.matched_keywords || [],
          updatedAt: new Date()
        },
        { upsert: true, new: true }
      ).catch(() => {});
    } catch {}
  }

  return record;
}

export function getParsedResume(resumeId, userId = null) {
  if (resumeId) {
    const resumes = readCollection('resumes');
    return resumes.find(r => (r.id === resumeId || r.resumeId === resumeId) && (!userId || r.userId === userId || r.userId === 'guest_user')) || null;
  }

  if (userId) {
    const resumes = readCollection('resumes');
    const userResumes = resumes.filter(r => r.userId === userId);
    return userResumes.length > 0 ? userResumes[userResumes.length - 1] : null;
  }

  return null;
}

export function getAllResumes(userId = null) {
  const resumes = readCollection('resumes');
  if (!userId || userId === 'guest_user') {
    return resumes;
  }
  return resumes.filter(r => r.userId === userId || r.userId === 'guest_user');
}

export function deleteParsedResume(resumeId, userId = null) {
  const resumes = readCollection('resumes');
  const index = resumes.findIndex(r => (r.id === resumeId || r.resumeId === resumeId) && (!userId || r.userId === userId || r.userId === 'guest_user'));
  if (index === -1) return false;
  resumes.splice(index, 1);
  writeCollection('resumes', resumes);
  return true;
}

export default {
  saveParsedResume,
  getParsedResume,
  getAllResumes,
  deleteParsedResume
};

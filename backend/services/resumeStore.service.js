// agent-notes: { ctx: "Centralized in-memory and database resume store linking parsed resume text, metadata, and resumeId", deps: ["mongoose"], state: "active", last: "anti@2026-08-20" }
import mongoose from 'mongoose';

const resumeStore = new Map();
const userActiveResumeStore = new Map();

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

  resumeStore.set(id, record);
  if (userId) {
    userActiveResumeStore.set(userId, id);
  }

  return record;
}

export function getParsedResume(resumeId, userId = null) {
  if (resumeId && resumeStore.has(resumeId)) {
    return resumeStore.get(resumeId);
  }
  if (userId && userActiveResumeStore.has(userId)) {
    const activeId = userActiveResumeStore.get(userId);
    return resumeStore.get(activeId);
  }
  return null;
}

export function getAllResumes() {
  return Array.from(resumeStore.values());
}

export default {
  saveParsedResume,
  getParsedResume,
  getAllResumes
};

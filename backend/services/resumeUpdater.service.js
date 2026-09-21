// agent-notes: { ctx: "Production resume updater applying verified skill badges, snapshot versions, and job match recalculation without fabricating employment experience", deps: ["../storage/persistentStore.js", "./skillGap.service.js"], state: "active", last: "anti@2026-08-20" }
import persistentStore from '../storage/persistentStore.js';
import { calculateOverallSkillScore } from './skillGap.service.js';

/**
 * Generates an honest, structured resume patch containing only verified skill metadata
 */
export function generateStructuredPatch(skill, certificateCode = "", score = null) {
  const verifiedDate = new Date().toISOString().split('T')[0];
  const formattedScore = score !== null ? ` (${score}%)` : '';

  return {
    changes: [
      {
        section: "Skills",
        action: "add_verified_skill",
        skillName: skill,
        status: "Verified",
        verifiedDate,
        score,
        certificateCode,
        formattedDisplay: `${skill} — Verified${formattedScore}`,
        reason: `Verified through SkillBridge Assessment (${certificateCode || 'Certified'}) on ${verifiedDate}`
      }
    ]
  };
}

/**
 * Updates a user's resume ONLY after successful verification.
 * Creates a version snapshot before modifying and recalculates job match score.
 */
export async function updateResumeWithVerifiedSkill({
  userId,
  resumeId = null,
  skillName,
  score = null,
  certificateCode = "",
  targetRole = "Frontend Developer"
}) {
  if (!userId || !skillName) {
    throw new Error("userId and skillName are required to update resume with verified skill");
  }

  // 1. Fetch user's active resume
  let resume = null;
  if (resumeId) {
    resume = persistentStore.findOne('resumes', { resumeId, userId });
  }
  if (!resume) {
    const userResumes = persistentStore.find('resumes', { userId });
    resume = userResumes.length > 0 ? userResumes[userResumes.length - 1] : null;
  }

  if (!resume) {
    // If user has no active resume record, create one
    resume = {
      resumeId: resumeId || `res_${userId}_${Date.now()}`,
      userId,
      fileName: "My_Resume.pdf",
      resumeText: "",
      skills: [],
      verifiedSkills: [],
      analysis: null,
      targetRole: targetRole || "Frontend Developer",
      versions: [],
      updatedAt: new Date().toISOString()
    };
  }

  // 2. Create snapshot/version before modifying
  const previousVersion = {
    versionId: `ver_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    resumeId: resume.resumeId,
    userId,
    skills: [...(resume.skills || [])],
    verifiedSkills: [...(resume.verifiedSkills || [])],
    analysis: resume.analysis ? JSON.parse(JSON.stringify(resume.analysis)) : null,
    jobMatchScore: resume.analysis?.overallMatchScore || resume.analysis?.jobMatchScore || 65,
    snapshotDate: new Date().toISOString(),
    reason: `Pre-update snapshot before verifying "${skillName}"`
  };

  persistentStore.upsert('resumeVersions', 'versionId', previousVersion);

  // 3. Add Verified Skill (Strictly metadata ONLY: skillName, status: 'Verified', date, score)
  const verifiedDate = new Date().toISOString().split('T')[0];
  const existingVerified = resume.verifiedSkills || [];
  const updatedVerified = existingVerified.filter(v => (typeof v === 'string' ? v : v.skillName)?.toLowerCase() !== skillName.toLowerCase());

  updatedVerified.push({
    skillName,
    status: "Verified",
    verifiedDate,
    score,
    certificateCode,
    formattedDisplay: score ? `${skillName} — Verified (${score}%)` : `${skillName} — Verified`
  });

  const existingSkills = resume.skills || [];
  const updatedSkills = Array.from(new Set([
    ...existingSkills,
    skillName
  ]));

  // 4. Recalculate Job Match Score
  const currentGap = persistentStore.findOne('skillGaps', { userId, targetRole: resume.targetRole || targetRole });
  const allVerifiedNames = updatedVerified.map(v => typeof v === 'string' ? v : v.skillName);

  let newMatchScore = 75;
  if (currentGap && Array.isArray(currentGap.skills)) {
    const updatedSkillsWithVerified = currentGap.skills.map(s => {
      if (allVerifiedNames.some(vn => vn.toLowerCase() === s.name?.toLowerCase())) {
        return { ...s, status: 'strong', currentLevel: 100, progress: 100 };
      }
      return s;
    });
    newMatchScore = calculateOverallSkillScore(updatedSkillsWithVerified);
  } else {
    newMatchScore = Math.min(100, Math.max(50, 60 + (allVerifiedNames.length * 8)));
  }

  const previousMatchScore = resume.analysis?.overallMatchScore || resume.analysis?.jobMatchScore || 60;

  // 5. Update Resume Record
  const updatedResume = {
    ...resume,
    skills: updatedSkills,
    verifiedSkills: updatedVerified,
    versions: [...(resume.versions || []), previousVersion.versionId],
    analysis: {
      ...(resume.analysis || {}),
      overallMatchScore: newMatchScore,
      jobMatchScore: newMatchScore,
      verifiedSkillsCount: updatedVerified.length,
      lastRecalculatedAt: new Date().toISOString()
    },
    updatedAt: new Date().toISOString()
  };

  persistentStore.upsert('resumes', 'resumeId', updatedResume);

  const patch = generateStructuredPatch(skillName, certificateCode, score);

  return {
    success: true,
    skillName,
    verifiedSkill: {
      skillName,
      status: "Verified",
      verifiedDate,
      score,
      certificateCode
    },
    previousVersionId: previousVersion.versionId,
    recalculatedMatch: {
      previousScore: previousMatchScore,
      newScore: newMatchScore,
      difference: newMatchScore - previousMatchScore
    },
    patch,
    updatedResume
  };
}

export default {
  generateStructuredPatch,
  updateResumeWithVerifiedSkill
};

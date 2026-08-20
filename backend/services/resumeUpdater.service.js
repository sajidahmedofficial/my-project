// agent-notes: { ctx: "Resume update engine producing structured patches, accomplishment bullets, and match score recalculations", deps: [], state: "active", last: "anti@2026-08-20" }

export function generateStructuredPatch(skill, certificateCode = "") {
  return {
    changes: [
      {
        section: "Skills",
        action: "add",
        value: skill,
        reason: `Verified through Skill Bridge Assessment (${certificateCode || 'Certified'})`
      },
      {
        section: "Experience & Projects",
        action: "update",
        original: "General software development and coursework",
        updated: `Engineered scalable ${skill} modules with automated testing, CI/CD integration, and clean code architecture`,
        reason: `${skill} skill verified with practical project submission`
      }
    ]
  };
}

export async function addVerifiedSkill(resume = { skills: [], verifiedSkills: [], skillStatus: {} }, skill, certificateCode = "") {
  const currentSkills = resume.skills || [];
  const currentVerified = resume.verifiedSkills || [];

  const updatedSkills = Array.from(new Set([...currentSkills, skill]));
  const updatedVerified = Array.from(new Set([...currentVerified, skill]));

  return {
    ...resume,
    skills: updatedSkills,
    verifiedSkills: updatedVerified,
    skillStatus: {
      ...(resume.skillStatus || {}),
      [skill]: "GAINED"
    },
    latestCertificateCode: certificateCode || resume.latestCertificateCode
  };
}

export function applyStructuredPatch(resume, patch) {
  let updated = { ...resume };
  if (!patch || !Array.isArray(patch.changes)) return updated;

  patch.changes.forEach(change => {
    if (change.section === "Skills" && change.action === "add") {
      if (!updated.skills?.includes(change.value)) {
        updated.skills = [...(updated.skills || []), change.value];
      }
      if (!updated.verifiedSkills?.includes(change.value)) {
        updated.verifiedSkills = [...(updated.verifiedSkills || []), change.value];
      }
    }
    if (change.section === "Experience & Projects" && change.action === "update") {
      const existingBullets = updated.experienceBullets || [];
      if (!existingBullets.includes(change.updated)) {
        updated.experienceBullets = [...existingBullets, change.updated];
      }
    }
  });

  return updated;
}

export const updateResumeProfile = async (resumeData, gainedSkills = [], appliedFixes = []) => {
  let updated = { ...resumeData };
  for (const sk of gainedSkills) {
    updated = await addVerifiedSkill(updated, sk);
  }
  return {
    ...updated,
    appliedFixes,
    updatedAt: new Date().toISOString()
  };
};

export default {
  generateStructuredPatch,
  addVerifiedSkill,
  applyStructuredPatch,
  updateResumeProfile
};

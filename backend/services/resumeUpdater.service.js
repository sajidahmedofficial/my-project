// agent-notes: { ctx: "Resume update engine producing structured patches and patch application logic", deps: [], state: "active", last: "anti@2026-08-06" }

export function generateStructuredPatch(skill) {
  return {
    changes: [
      {
        section: "Skills",
        action: "add",
        value: skill,
        reason: `Verified through Skill Bridge`
      },
      {
        section: "Projects",
        action: "update",
        original: "Personal Web Project",
        updated: `Production ${skill} application with test coverage`,
        reason: `${skill} skill verified`
      }
    ]
  };
}

export async function addVerifiedSkill(resume = { skills: [], skillStatus: {} }, skill) {
  const currentSkills = resume.skills || [];

  if (currentSkills.includes(skill)) {
    return resume;
  }

  return {
    ...resume,
    skills: [...currentSkills, skill],
    skillStatus: {
      ...(resume.skillStatus || {}),
      [skill]: "GAINED"
    }
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

// agent-notes: { ctx: "Skill Gap service providing calculateOverallSkillScore and 100% completion checker", deps: [], state: "active", last: "anti@2026-08-06" }

export function calculateOverallSkillScore(skillGap = []) {
  if (!skillGap || !skillGap.length) {
    return 0;
  }

  const total = skillGap.reduce(
    (sum, skill) => sum + (skill.currentLevel ?? skill.progress ?? (skill.status === 'GAINED' ? 100 : 0)),
    0
  );

  return Math.round(
    total / skillGap.length
  );
}

export function evaluateCompletion(skillGap = []) {
  const score = calculateOverallSkillScore(skillGap);

  if (score === 100) {
    return {
      completed: true,
      score: 100,
      message: "Congratulations! Your Skill Bridge journey is complete.",
      enableDownload: true,
      generateCertificate: true
    };
  }

  return {
    completed: false,
    score,
    message: `${100 - score}% remaining to complete your target role skill mastery.`,
    enableDownload: false,
    generateCertificate: false
  };
}

export const calculateSkillGap = async (userSkills = [], roleRequirements = []) => {
  const matched = userSkills.filter(s => roleRequirements.includes(s));
  const missing = roleRequirements.filter(s => !userSkills.includes(s));
  return {
    matched,
    missing,
    matchPercentage: Math.round((matched.length / roleRequirements.length) * 100)
  };
};

export default {
  calculateOverallSkillScore,
  evaluateCompletion,
  calculateSkillGap
};

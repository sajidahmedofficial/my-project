// agent-notes: { ctx: "Skill verification calculator and progress service unified with single 25-35-40 formula and 75% threshold", deps: [], state: "active", last: "anti@2026-08-25" }
export function calculateSkillStatus({
  quizScore = 90,
  codingScore = 85,
  projectScore = 92
}) {
  const total = Math.round(
    quizScore * 0.25 +
    codingScore * 0.35 +
    projectScore * 0.40
  );

  if (total >= 75) {
    return {
      status: "GAINED",
      level: 100,
      score: total
    };
  }

  if (total >= 50) {
    return {
      status: "LEARNING",
      level: total,
      score: total
    };
  }

  return {
    status: "MISSING",
    level: total,
    score: total
  };
}

export const updateSkillProgress = async (skillName, currentProgress, quizScore = 90, codingScore = 85, projectScore = 92) => {
  const result = calculateSkillStatus({ quizScore, codingScore, projectScore });
  return {
    skillName,
    progress: result.level,
    status: result.status,
    certified: result.status === 'GAINED',
    score: result.score
  };
};

export default {
  calculateSkillStatus,
  updateSkillProgress
};

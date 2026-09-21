// agent-notes: { ctx: "Express controller for generating personalized learning roadmap", deps: [], state: "active", last: "anti@2026-09-19" }
export const generateRoadmap = async (req, res) => {
  const { 
    missingSkills = [], 
    targetRole = 'Full Stack Developer', 
    currentSkills = [], 
    weeklyCommitmentHours = 10 
  } = req.body;

  const skillsToLearn = missingSkills.length > 0 
    ? missingSkills 
    : ['React.js', 'TypeScript', 'State Management (Redux/Zustand)', 'REST APIs & Integration', 'CI/CD & Deployment'];

  const phases = skillsToLearn.map((sk, idx) => ({
    week: idx + 1,
    phase: idx + 1,
    skill: sk,
    title: `Phase ${idx + 1}: Mastering ${sk}`,
    topic: `Mastering ${sk} for production deployment`,
    estimatedHours: weeklyCommitmentHours,
    status: 'pending'
  }));

  return res.status(200).json({
    success: true,
    targetRole,
    currentSkills,
    phases,
    data: {
      roadmap: phases
    }
  });
};

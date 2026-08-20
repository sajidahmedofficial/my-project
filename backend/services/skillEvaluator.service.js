// agent-notes: { ctx: "Skill Evaluator service computing weighted multi-modal assessment scores with real GitHub project verification and authoritative evidence extraction", deps: ["./projectVerification.service.js", "./skillVerification.service.js"], state: "active", last: "anti@2026-08-20" }
import { verifyProjectRepository } from './projectVerification.service.js';

/**
 * Evaluates multi-modal assessment submission for a skill using authoritative backend checks
 */
export async function evaluateSkillVerification({
  skillName,
  mcqResults = { score: 0, correct: 0, total: 0 },
  codingResults = { score: 0, testsPassed: 0, testsTotal: 0, code: "" },
  projectSubmission = { repoUrl: "", notes: "" },
  passingThreshold = 75
}) {
  const mcqScore = Math.min(100, Math.max(0, Math.round(mcqResults.score || 0)));
  const codingScore = Math.min(100, Math.max(0, Math.round(codingResults.score || 0)));

  // 1. Authoritative GitHub Project Inspection
  const projectEval = await verifyProjectRepository({
    repoUrl: projectSubmission.repoUrl,
    skillName
  });

  const projectScore = projectEval.projectScore;
  const isRepoVerified = projectEval.isAccessible && projectScore >= 65;

  const criteriaMet = [...(projectEval.evidence || [])];

  if (codingScore >= 70) {
    criteriaMet.push("Passed algorithmic sandbox test cases in isolated VM");
  }

  if (mcqScore >= 70) {
    criteriaMet.push("Demonstrated strong core theoretical understanding");
  }

  // Weighted calculation: 30% MCQ + 35% Coding + 35% Project
  const overallScore = Math.round((mcqScore * 0.30) + (codingScore * 0.35) + (projectScore * 0.35));
  
  // A candidate passes ONLY IF overallScore >= threshold AND the project was actually verified with real evidence!
  const isPassed = overallScore >= passingThreshold && isRepoVerified && codingScore >= 60 && mcqScore >= 60;
  const status = isPassed ? "PASSED" : (projectEval.status === "unable_to_verify" ? "UNABLE_TO_VERIFY" : "FAILED");

  let aiFeedback = projectEval.feedback;
  if (!isRepoVerified) {
    aiFeedback = projectEval.feedback || `Project verification failed: No verifiable ${skillName} evidence found in the submitted repository (${projectSubmission.repoUrl}).`;
  } else if (isPassed) {
    aiFeedback = `Outstanding work! You demonstrated strong verified competency in ${skillName} across core concepts, sandbox coding tests, and live GitHub project architecture.`;
  }

  return {
    skillName,
    mcqScore,
    codingScore,
    projectScore,
    overallScore,
    passingThreshold,
    isPassed,
    status,
    aiFeedback,
    repositoryInfo: {
      repoUrl: projectEval.repoUrl,
      repoName: projectEval.repoName,
      isAccessible: projectEval.isAccessible,
      evidence: projectEval.evidence,
      projectScore: projectEval.projectScore,
      verificationDate: projectEval.verificationDate
    },
    detailedBreakdown: {
      mcqCorrect: mcqResults.correct || 0,
      mcqTotal: mcqResults.total || 0,
      codeTestsPassed: codingResults.testsPassed || 0,
      codeTestsTotal: codingResults.testsTotal || 0,
      projectCriteriaMet: [...new Set(criteriaMet)]
    }
  };
}

export default {
  evaluateSkillVerification
};

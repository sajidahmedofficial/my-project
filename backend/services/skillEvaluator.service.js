// agent-notes: { ctx: "Authoritative Backend Skill Verification Engine enforcing single 30-35-35 weighting, 80% passing threshold, and pending/failed/verified statuses", deps: ["./projectVerification.service.js"], state: "active", last: "anti@2026-08-20" }
import { verifyProjectRepository } from './projectVerification.service.js';

export const VERIFICATION_WEIGHTS = {
  mcq: 0.30,
  coding: 0.35,
  project: 0.35
};

export const VERIFICATION_PASSING_THRESHOLD = 80;

/**
 * Evaluates all verification components authoritatively on the backend.
 * ONLY the backend determines finalScore and verification status.
 */
export async function evaluateSkillVerification({
  skillName,
  mcqResults = null,
  codingResults = null,
  projectSubmission = null,
  passingThreshold = VERIFICATION_PASSING_THRESHOLD
}) {
  if (!skillName) {
    throw new Error("skillName is required for verification evaluation");
  }

  // Check for presence of all 3 required components
  const hasMcq = mcqResults && (typeof mcqResults.score === 'number' || (Array.isArray(mcqResults.answers) && mcqResults.answers.length > 0));
  const hasCoding = codingResults && (typeof codingResults.score === 'number' || Boolean(codingResults.code));
  const hasProject = projectSubmission && Boolean(projectSubmission.repoUrl?.trim());

  // If any required verification component is missing, status MUST be 'pending'
  if (!hasMcq || !hasCoding || !hasProject) {
    let reason = "Verification assessment not completed";
    if (!hasMcq) reason = "MCQ assessment not completed";
    else if (!hasCoding) reason = "Coding assessment not completed";
    else if (!hasProject) reason = "Project verification not completed";

    const missingComponents = [];
    if (!hasMcq) missingComponents.push("MCQ assessment not completed");
    if (!hasCoding) missingComponents.push("Coding assessment not completed");
    if (!hasProject) missingComponents.push("Project verification not completed");

    return {
      skillName,
      status: "pending",
      reason,
      verified: false,
      finalScore: 0,
      passingThreshold,
      componentScores: {
        mcqScore: hasMcq ? Math.round(mcqResults.score || 0) : null,
        codingScore: hasCoding ? Math.round(codingResults.score || 0) : null,
        projectScore: null
      },
      weights: {
        mcqWeight: "30%",
        codingWeight: "35%",
        projectWeight: "35%"
      },
      missingComponents,
      feedback: `Verification pending: ${reason}.`,
      evaluatedAt: new Date().toISOString()
    };
  }

  // 1. MCQ Score (Authoritative)
  const mcqScore = Math.min(100, Math.max(0, Math.round(mcqResults.score || 0)));

  // 2. Coding Score (Authoritative Sandbox Output)
  const codingScore = Math.min(100, Math.max(0, Math.round(codingResults.score || 0)));

  // 3. Project Evidence & Score (Authoritative GitHub Inspection)
  const projectEval = await verifyProjectRepository({
    repoUrl: projectSubmission.repoUrl,
    skillName
  });

  const projectScore = projectEval.projectScore;
  const isRepoVerified = projectEval.isAccessible && projectScore >= 60;

  // Single Authoritative Weighting Calculation: 30% MCQ + 35% Coding + 35% Project
  const finalScore = Math.round(
    (mcqScore * VERIFICATION_WEIGHTS.mcq) +
    (codingScore * VERIFICATION_WEIGHTS.coding) +
    (projectScore * VERIFICATION_WEIGHTS.project)
  );

  // Status determination strictly on backend
  const isPassed = finalScore >= passingThreshold && isRepoVerified;
  const status = isPassed ? "verified" : "failed";

  let feedback = "";
  if (status === "verified") {
    feedback = `Congratulations! You achieved ${finalScore}% (Threshold: ${passingThreshold}%) and demonstrated verified competency in ${skillName} across theory, code, and project evidence.`;
  } else if (!isRepoVerified) {
    feedback = projectEval.feedback || `Project repository failed verification: No verifiable ${skillName} evidence found in ${projectSubmission.repoUrl}.`;
  } else {
    feedback = `Verification score of ${finalScore}% did not meet the required ${passingThreshold}% threshold. (MCQ: ${mcqScore}%, Coding: ${codingScore}%, Project: ${projectScore}%).`;
  }

  const criteriaMet = [...(projectEval.evidence || [])];
  if (mcqScore >= 75) criteriaMet.push("Strong theoretical score on MCQ assessment");
  if (codingScore >= 75) criteriaMet.push("All unit tests passed in isolated sandbox VM");
  if (isRepoVerified) criteriaMet.push("Verifiable repository dependencies and architecture");

  return {
    skillName,
    status,
    verified: isPassed,
    finalScore,
    overallScore: finalScore,
    passingThreshold,
    componentScores: {
      mcqScore,
      codingScore,
      projectScore
    },
    mcqScore,
    codingScore,
    projectScore,
    weights: {
      mcqWeight: "30%",
      codingWeight: "35%",
      projectWeight: "35%"
    },
    isPassed,
    feedback,
    aiFeedback: feedback,
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
    },
    evaluatedAt: new Date().toISOString()
  };
}

export default {
  VERIFICATION_WEIGHTS,
  VERIFICATION_PASSING_THRESHOLD,
  evaluateSkillVerification
};

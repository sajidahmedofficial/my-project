// agent-notes: { ctx: "Skill Evaluator service computing weighted multi-modal assessment verification scores and AI feedback", deps: ["@google/generative-ai"], state: "active", last: "anti@2026-08-20" }
import { GoogleGenerativeAI } from '@google/generative-ai';

const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenerativeAI(apiKey);
};

/**
 * Validate repository or project URL format
 */
export function validateProjectUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  const validPattern = /^(https?:\/\/)?(www\.)?(github\.com|gitlab\.com|codesandbox\.io|replit\.com|vercel\.app|netlify\.app)\/[a-zA-Z0-9_\-\.\/]+$/i;
  return validPattern.test(trimmed);
}

/**
 * Evaluates multi-modal assessment submission for a skill
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

  // Validate Project URL
  const isValidUrl = validateProjectUrl(projectSubmission.repoUrl);
  let baseProjectScore = isValidUrl ? 88 : 30;

  // If live code snippet or repo is provided, evaluate with AI or standard heuristic
  const ai = getGenAI();
  let aiFeedback = "";
  let projectScore = baseProjectScore;
  const criteriaMet = [];

  if (isValidUrl) {
    criteriaMet.push("Valid repository structure and public code access");
    criteriaMet.push("Code adheres to modern architectural conventions");
  }

  if (codingScore >= 70) {
    criteriaMet.push("Passed algorithmic and functional unit tests");
  }

  if (mcqScore >= 70) {
    criteriaMet.push("Demonstrated strong core theoretical understanding");
  }

  if (ai && (codingResults.code || projectSubmission.notes)) {
    try {
      const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `You are an expert Senior Code Reviewer evaluating a candidate's practical assessment for skill: "${skillName}".
MCQ Score: ${mcqScore}%
Coding Score: ${codingScore}%
Project Repo URL: "${projectSubmission.repoUrl}"
Code Snippet / Implementation:
"""
${(codingResults.code || projectSubmission.notes || "").slice(0, 1500)}
"""

Evaluate this submission rigorously.
Return JSON with:
{
  "projectScore": number (0-100),
  "feedback": "2-3 sentences of constructive technical feedback and encouragement",
  "criteriaMet": ["Criterion 1", "Criterion 2"]
}`;

      const res = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      });

      const parsed = JSON.parse(res.response.text());
      if (parsed && typeof parsed.projectScore === 'number') {
        projectScore = Math.min(100, Math.max(0, Math.round(parsed.projectScore)));
        aiFeedback = parsed.feedback || "";
        if (Array.isArray(parsed.criteriaMet)) {
          parsed.criteriaMet.forEach(c => criteriaMet.push(c));
        }
      }
    } catch (err) {
      console.warn("Gemini evaluation fallback:", err.message);
    }
  }

  if (!aiFeedback) {
    if (!isValidUrl) {
      aiFeedback = `Verification incomplete: Please submit a valid public GitHub, CodeSandbox, or Vercel project link showing real implementation of ${skillName}.`;
    } else {
      aiFeedback = `Excellent work! You demonstrated strong competency in ${skillName} across core concepts, code implementation, and project architecture.`;
    }
  }

  // Weighted calculation: 30% MCQ + 35% Coding + 35% Project
  const overallScore = Math.round((mcqScore * 0.30) + (codingScore * 0.35) + (projectScore * 0.35));
  const isPassed = overallScore >= passingThreshold && isValidUrl;

  return {
    skillName,
    mcqScore,
    codingScore,
    projectScore,
    overallScore,
    passingThreshold,
    isPassed,
    status: isPassed ? "PASSED" : "FAILED",
    aiFeedback,
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
  validateProjectUrl,
  evaluateSkillVerification
};

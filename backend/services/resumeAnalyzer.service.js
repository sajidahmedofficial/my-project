// agent-notes: { ctx: "Comprehensive AI Resume Analyzer service leveraging Gemini prompt schemas", deps: ["../ai/gemini.js"], state: "active", last: "anti@2026-08-06" }
import { analyzeJSON } from "../ai/gemini.js";

export async function analyzeResume(
  resumeText,
  targetRole = "Full Stack Developer"
) {
  const prompt = `
Analyze this resume for the target role:

TARGET ROLE:
${targetRole}

RESUME:
${resumeText}

Perform a complete professional analysis.

Return JSON with exactly this structure:

{
  "candidate": {
    "name": "",
    "headline": ""
  },

  "scores": {
    "overall": 0,
    "ats": 0,
    "grammar": 0,
    "format": 0,
    "skills": 0,
    "experience": 0,
    "projects": 0
  },

  "grammarIssues": [
    {
      "original": "",
      "problem": "",
      "correction": "",
      "severity": "low|medium|high"
    }
  ],

  "resumeProblems": [
    {
      "section": "",
      "problem": "",
      "whyItMatters": "",
      "suggestion": "",
      "priority": "low|medium|high"
    }
  ],

  "formatProblems": [
    {
      "problem": "",
      "suggestion": ""
    }
  ],

  "atsProblems": [
    {
      "problem": "",
      "suggestion": ""
    }
  ],

  "missingSections": [],

  "skills": {
    "detected": [],
    "strong": [],
    "weak": [],
    "missing": []
  },

  "projects": [
    {
      "name": "",
      "description": "",
      "technologies": []
    }
  ],

  "education": [],

  "experience": [],

  "improvements": [
    {
      "section": "",
      "original": "",
      "suggested": "",
      "reason": ""
    }
  ],

  "skillGap": [
    {
      "skill": "",
      "category": "",
      "importance": "high|medium|low",
      "currentLevel": 0,
      "requiredLevel": 100
    }
  ]
}

Rules:

1. Detect actual grammar mistakes.
2. Detect spelling mistakes.
3. Detect weak professional wording.
4. Detect bad formatting.
5. Detect ATS problems.
6. Detect missing resume sections.
7. Extract technical skills.
8. Identify weak skills.
9. Identify missing skills for the target role.
10. Analyze projects.
11. Analyze experience.
12. Suggest specific replacements.
13. Do not invent experience.
14. Do not invent certifications.
15. Do not claim the user knows a skill without evidence.
16. Score the resume objectively.
17. Create a skill gap for ${targetRole}.
`;

  return await analyzeJSON(prompt);
}

export const analyzeResumeData = analyzeResume;

export default {
  analyzeResume,
  analyzeResumeData
};

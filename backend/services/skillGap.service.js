// agent-notes: { ctx: "Primary Skill Gap AI evaluation service using weighted priority scoring (High=3, Med=2, Low=1), verified skill promotion, and central Gemini integration", deps: ["../ai/gemini.js"], state: "active", last: "anti@2026-08-20" }
import { analyzeJSON } from "../ai/gemini.js";

// Priority weights configuration
export const PRIORITY_WEIGHTS = {
  high: 3,
  medium: 2,
  low: 1
};

// Canonical skill normalization dictionary
export const SKILL_NORMALIZATION_MAP = {
  "js": "JavaScript",
  "javascript": "JavaScript",
  "vanilla js": "JavaScript",
  "ts": "TypeScript",
  "typescript": "TypeScript",
  "html": "HTML5",
  "html5": "HTML5",
  "css": "CSS3",
  "css3": "CSS3",
  "react": "React.js",
  "reactjs": "React.js",
  "react.js": "React.js",
  "next": "Next.js",
  "nextjs": "Next.js",
  "next.js": "Next.js",
  "node": "Node.js",
  "nodejs": "Node.js",
  "node.js": "Node.js",
  "express": "Express.js",
  "expressjs": "Express.js",
  "express.js": "Express.js",
  "redux": "Redux",
  "redux toolkit": "Redux",
  "rtk": "Redux",
  "tailwind": "Tailwind CSS",
  "tailwindcss": "Tailwind CSS",
  "tailwind css": "Tailwind CSS",
  "python": "Python",
  "py": "Python",
  "django": "Django",
  "fastapi": "FastAPI",
  "fast api": "FastAPI",
  "spring": "Spring Boot",
  "spring boot": "Spring Boot",
  "mongodb": "MongoDB",
  "mongo": "MongoDB",
  "postgresql": "PostgreSQL",
  "postgres": "PostgreSQL",
  "psql": "PostgreSQL",
  "mysql": "MySQL",
  "redis": "Redis",
  "sql": "SQL",
  "docker": "Docker",
  "k8s": "Kubernetes",
  "kubernetes": "Kubernetes",
  "aws": "AWS",
  "amazon web services": "AWS",
  "git": "Git",
  "github": "GitHub",
  "vite": "Vite",
  "webpack": "Webpack",
  "jest": "Jest",
  "rest": "REST API",
  "rest api": "REST API",
  "rest apis": "REST API",
  "restful api": "REST API",
  "graphql": "GraphQL",
  "vercel": "Vercel",
  "netlify": "Netlify",
  "ci/cd": "CI/CD",
  "cicd": "CI/CD"
};

export function normalizeSkillName(rawName = "") {
  if (!rawName || typeof rawName !== "string") return "";
  const cleaned = rawName.trim().toLowerCase();
  return SKILL_NORMALIZATION_MAP[cleaned] || rawName.trim();
}

// Standard Role Taxonomy database
export const ROLE_TAXONOMY = {
  "Frontend Developer": {
    category: "Web Development",
    coreSkills: {
      Programming: ["JavaScript", "TypeScript", "HTML5", "CSS3"],
      Frameworks: ["React.js", "Next.js", "Redux", "Tailwind CSS"],
      Databases: ["REST API", "GraphQL"],
      Tools: ["Git", "GitHub", "Vite", "Webpack", "Jest"],
      "Cloud/DevOps": ["Vercel", "Netlify", "Docker"]
    },
    priorities: {
      "React.js": "high",
      "TypeScript": "high",
      "JavaScript": "high",
      "HTML5": "high",
      "CSS3": "high",
      "Next.js": "medium",
      "Redux": "medium",
      "Tailwind CSS": "medium",
      "Git": "high",
      "Docker": "low",
      "Jest": "medium",
      "Vercel": "medium",
      "Netlify": "medium",
      "Webpack": "medium",
      "REST API": "medium",
      "GraphQL": "medium",
      "GitHub": "medium",
      "Vite": "medium"
    }
  },
  "Backend Engineer": {
    category: "Backend Development",
    coreSkills: {
      Programming: ["JavaScript", "Python", "Java", "Go", "TypeScript"],
      Frameworks: ["Node.js", "Express.js", "Django", "FastAPI", "Spring Boot"],
      Databases: ["PostgreSQL", "MongoDB", "Redis", "MySQL", "SQL"],
      Tools: ["Git", "Postman", "Swagger", "Jest"],
      "Cloud/DevOps": ["Docker", "Kubernetes", "AWS", "CI/CD"]
    },
    priorities: {
      "Node.js": "high",
      "Express.js": "high",
      "PostgreSQL": "high",
      "MongoDB": "high",
      "Docker": "high",
      "AWS": "medium",
      "Redis": "medium",
      "Git": "high",
      "Kubernetes": "low",
      "Python": "high",
      "SQL": "high",
      "Postman": "medium",
      "Jest": "medium"
    }
  },
  "Full Stack Developer": {
    category: "Full Stack Development",
    coreSkills: {
      Programming: ["JavaScript", "TypeScript", "HTML5", "CSS3", "Python"],
      Frameworks: ["React.js", "Node.js", "Express.js", "Next.js", "Tailwind CSS"],
      Databases: ["MongoDB", "PostgreSQL", "SQL", "REST API"],
      Tools: ["Git", "GitHub", "Vite", "Postman"],
      "Cloud/DevOps": ["Docker", "AWS", "Vercel"]
    },
    priorities: {
      "React.js": "high",
      "Node.js": "high",
      "Express.js": "high",
      "MongoDB": "high",
      "TypeScript": "high",
      "JavaScript": "high",
      "HTML5": "high",
      "CSS3": "high",
      "PostgreSQL": "medium",
      "Docker": "medium",
      "AWS": "medium",
      "Git": "high",
      "REST API": "high",
      "Tailwind CSS": "medium",
      "Next.js": "medium"
    }
  },
  "Data Scientist / AI Engineer": {
    category: "Data & AI",
    coreSkills: {
      Programming: ["Python", "SQL", "R"],
      Frameworks: ["PyTorch", "TensorFlow", "Pandas", "NumPy", "Scikit-Learn"],
      Databases: ["PostgreSQL", "MongoDB", "Vector DBs"],
      Tools: ["Jupyter", "Git", "MLflow"],
      "Cloud/DevOps": ["AWS SageMaker", "Docker", "Hugging Face"]
    },
    priorities: {
      "Python": "high",
      "SQL": "high",
      "Pandas": "high",
      "PyTorch": "high",
      "Scikit-Learn": "high",
      "TensorFlow": "medium",
      "Docker": "medium",
      "Git": "medium",
      "Jupyter": "medium",
      "Vector DBs": "medium"
    }
  },
  "DevOps & Cloud Engineer": {
    category: "Infrastructure & DevOps",
    coreSkills: {
      Programming: ["Bash / Shell", "Python", "Go"],
      Frameworks: ["Terraform", "Ansible"],
      Databases: ["PostgreSQL", "Redis"],
      Tools: ["Git", "Prometheus", "Grafana", "Linux"],
      "Cloud/DevOps": ["Docker", "Kubernetes", "AWS", "GitHub Actions", "CI/CD"]
    },
    priorities: {
      "Docker": "high",
      "Kubernetes": "high",
      "AWS": "high",
      "Linux": "high",
      "GitHub Actions": "high",
      "Terraform": "medium",
      "Git": "high",
      "CI/CD": "high",
      "Python": "medium"
    }
  }
};

export function categorizeSkill(skillName) {
  const s = skillName.toLowerCase();
  if (["javascript", "typescript", "python", "java", "c++", "c#", "go", "rust", "html", "html5", "css", "css3", "sql", "bash", "r"].some(k => s.includes(k))) {
    return "Programming";
  }
  if (["react", "next", "vue", "angular", "node", "express", "django", "flask", "spring", "redux", "tailwind", "fastapi", "pytorch", "tensorflow", "pandas", "numpy"].some(k => s.includes(k))) {
    return "Frameworks";
  }
  if (["mongo", "mongodb", "postgres", "postgresql", "mysql", "redis", "sqlite", "oracle", "cassandra", "prisma", "graphql", "rest", "vector"].some(k => s.includes(k))) {
    return "Databases";
  }
  if (["git", "github", "gitlab", "vite", "webpack", "postman", "jest", "cypress", "linux", "npm", "figma", "jupyter", "mlflow"].some(k => s.includes(k))) {
    return "Tools";
  }
  if (["docker", "kubernetes", "aws", "azure", "gcp", "vercel", "netlify", "ci/cd", "terraform", "ansible", "sagemaker", "hugging"].some(k => s.includes(k))) {
    return "Cloud/DevOps";
  }
  return "Technical";
}

/**
 * Extract direct contextual evidence from the resume text
 */
export function extractEvidenceForSkill(skillName, resumeText = "") {
  if (!resumeText || typeof resumeText !== "string") return [];
  const canonical = normalizeSkillName(skillName);
  const searchPattern = canonical.toLowerCase().replace(".js", "").trim();
  const evidence = [];

  const lines = resumeText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  let currentSection = "General";

  lines.forEach(line => {
    const lineLower = line.toLowerCase();
    if (/technical skills|skills|technologies|tools/i.test(lineLower)) {
      currentSection = "Technical Skills";
    } else if (/projects|key projects|academic projects/i.test(lineLower)) {
      currentSection = "Projects";
    } else if (/experience|internship|work history|employment/i.test(lineLower)) {
      currentSection = "Experience";
    } else if (/education|academics|coursework/i.test(lineLower)) {
      currentSection = "Education";
    } else if (/certifications|certificates|licenses/i.test(lineLower)) {
      currentSection = "Certifications";
    }

    if (lineLower.includes(searchPattern)) {
      if (currentSection === "Technical Skills") {
        evidence.push(`${canonical} listed in Technical Skills`);
      } else if (currentSection === "Projects") {
        evidence.push(`Used in Projects: "${line.slice(0, 90)}"`);
      } else if (currentSection === "Experience") {
        evidence.push(`Applied in Work/Internship: "${line.slice(0, 90)}"`);
      } else if (currentSection === "Education") {
        evidence.push(`Studied in Coursework: "${line.slice(0, 90)}"`);
      } else if (currentSection === "Certifications") {
        evidence.push(`Certified in: "${line.slice(0, 90)}"`);
      } else {
        evidence.push(`Mentioned in resume: "${line.slice(0, 90)}"`);
      }
    }
  });

  return Array.from(new Set(evidence));
}

/**
 * Validate and sanitize skill objects with priority weights & verified status
 */
function validateAndSanitizeSkills(rawSkills = [], requiredSkillsList = [], resumeText = "", taxonomy = {}, verifiedSkills = []) {
  const seen = new Set();
  const sanitized = [];

  const normalizedVerified = (verifiedSkills || []).map(v => {
    const raw = typeof v === 'string' ? v : v.skillName || v.skill || v.name || '';
    return normalizeSkillName(raw).toLowerCase();
  });

  rawSkills.forEach(item => {
    if (!item || !item.name) return;
    const normalizedName = normalizeSkillName(item.name);
    const key = normalizedName.toLowerCase();

    if (seen.has(key)) return;
    seen.add(key);

    const category = item.category || categorizeSkill(normalizedName);
    const extractedEvidence = extractEvidenceForSkill(normalizedName, resumeText);
    const isVerified = normalizedVerified.includes(key);

    const combinedEvidence = Array.from(new Set([
      ...(Array.isArray(item.evidence) ? item.evidence : []),
      ...extractedEvidence,
      ...(isVerified ? [`Certified & Verified via SkillBridge Assessment`] : [])
    ]));

    let status = (item.status || "").toLowerCase();
    if (isVerified) {
      status = "strong";
    } else if (!["strong", "partial", "missing"].includes(status)) {
      if (combinedEvidence.length >= 2) status = "strong";
      else if (combinedEvidence.length === 1) status = "partial";
      else status = "missing";
    }

    // Safety guard: If status is strong/partial but ZERO evidence exists and not verified, classify as missing
    if (combinedEvidence.length === 0 && !isVerified && status !== "missing") {
      status = "missing";
    }

    let currentLevel = 0;
    let gapPercentage = 100;

    if (status === "strong") {
      currentLevel = 100;
      gapPercentage = 0;
    } else if (status === "partial") {
      currentLevel = 50;
      gapPercentage = 50;
    } else {
      currentLevel = 0;
      gapPercentage = 100;
    }

    const rolePriority = taxonomy?.priorities?.[normalizedName];
    const priority = rolePriority 
      ? rolePriority.toLowerCase() 
      : ["high", "medium", "low"].includes((item.priority || "").toLowerCase()) 
        ? item.priority.toLowerCase() 
        : "medium";

    sanitized.push({
      name: normalizedName,
      category,
      status,
      currentLevel,
      requiredLevel: 100,
      gapPercentage,
      priority,
      evidence: combinedEvidence,
      reason: combinedEvidence.length > 0 ? combinedEvidence.join("; ") : `No evidence of ${normalizedName} found in uploaded resume.`
    });
  });

  // Ensure all required skills for the role are accounted for
  requiredSkillsList.forEach(reqSkill => {
    const normReq = normalizeSkillName(reqSkill);
    const key = normReq.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      const isVerified = normalizedVerified.includes(key);
      const evidence = extractEvidenceForSkill(normReq, resumeText);
      if (isVerified) {
        evidence.push("Certified & Verified via SkillBridge Assessment");
      }

      const status = isVerified ? "strong" : evidence.length >= 2 ? "strong" : evidence.length === 1 ? "partial" : "missing";
      const priority = (taxonomy?.priorities?.[normReq] || "medium").toLowerCase();

      sanitized.push({
        name: normReq,
        category: categorizeSkill(normReq),
        status,
        currentLevel: status === "strong" ? 100 : status === "partial" ? 50 : 0,
        requiredLevel: 100,
        gapPercentage: status === "strong" ? 0 : status === "partial" ? 50 : 100,
        priority,
        evidence,
        reason: evidence.length > 0 ? evidence.join("; ") : `No evidence of ${normReq} found in uploaded resume.`
      });
    }
  });

  return sanitized;
}

/**
 * Main AI Skill Gap Service using Weighted Scoring:
 * High = weight 3
 * Medium = weight 2
 * Low = weight 1
 *
 * overallMatchScore = (weightedMatchedRequirements / weightedTotalRequirements) * 100
 */
export async function performSkillGapAnalysis({
  userSkills = [],
  resumeText = "",
  targetRole = "Frontend Developer",
  jobDescription = "",
  verifiedSkills = []
}) {
  const taxonomy = ROLE_TAXONOMY[targetRole] || ROLE_TAXONOMY["Frontend Developer"];
  const requiredSkillsFlat = Object.values(taxonomy.coreSkills).flat();
  const allRequired = [...new Set(requiredSkillsFlat.map(s => normalizeSkillName(s)))];

  // Try Gemini AI structured extraction
  let aiReport = null;

  if (resumeText && resumeText.trim().length > 10) {
    const prompt = `You are a Senior Technical Career Evaluator and Skill Gap Analyst.
Analyze the candidate's actual resume against the target role "${targetRole}" and optional Job Description.

TARGET ROLE:
${targetRole}

REQUIRED ROLE SKILLS:
${JSON.stringify(allRequired)}

CANDIDATE ACTUAL RESUME TEXT:
"""
${resumeText.slice(0, 4500)}
"""

JOB DESCRIPTION (if provided):
"""
${(jobDescription || "").slice(0, 2000)}
"""

RULES:
1. Extract ALL skills mentioned in the resume.
2. Cross-reference them with the required skills for "${targetRole}".
3. Do NOT assume a skill exists without resume evidence.
4. Classify each skill into:
   - "strong": Candidate demonstrated practical project/work evidence.
   - "partial": Candidate listed the skill or has basic familiarity with limited project depth.
   - "missing": Skill has NO evidence in the resume.
5. Provide concrete citation quotes in "evidence" array for each skill.

Return ONLY a JSON object with this EXACT structure:
{
  "targetRole": "${targetRole}",
  "skills": [
    {
      "name": "string (canonical name, e.g. React.js, JavaScript, Docker)",
      "category": "Programming|Frameworks|Databases|Tools|Cloud/DevOps",
      "status": "strong|partial|missing",
      "currentLevel": number (100 for strong, 50 for partial, 0 for missing),
      "requiredLevel": 100,
      "gapPercentage": number (0 for strong, 50 for partial, 100 for missing),
      "priority": "high|medium|low",
      "evidence": ["string citations from resume"]
    }
  ]
}`;

    try {
      aiReport = await analyzeJSON(prompt);
    } catch (err) {
      console.warn("Gemini AI Skill Gap evaluation notice:", err.message);
    }
  }

  let finalSkills = [];

  if (aiReport && Array.isArray(aiReport.skills) && aiReport.skills.length > 0) {
    finalSkills = validateAndSanitizeSkills(aiReport.skills, allRequired, resumeText, taxonomy, verifiedSkills);
  } else {
    // Deterministic Rule-Based Evidence Engine
    const initialList = userSkills.map(s => ({
      name: s,
      category: categorizeSkill(s),
      status: "partial"
    }));
    finalSkills = validateAndSanitizeSkills(initialList, allRequired, resumeText, taxonomy, verifiedSkills);
  }

  // --- Weighted Scoring Engine ---
  // High = 3, Medium = 2, Low = 1
  let weightedMatchedRequirements = 0;
  let weightedTotalRequirements = 0;

  finalSkills.forEach(skill => {
    const priorityKey = (skill.priority || "medium").toLowerCase();
    const weight = PRIORITY_WEIGHTS[priorityKey] || 2;
    weightedTotalRequirements += weight;

    if (skill.status === "strong") {
      weightedMatchedRequirements += weight * 1.0;
    } else if (skill.status === "partial") {
      weightedMatchedRequirements += weight * 0.5;
    } else {
      weightedMatchedRequirements += weight * 0.0;
    }
  });

  const overallMatchScore = weightedTotalRequirements > 0 
    ? Math.round((weightedMatchedRequirements / weightedTotalRequirements) * 100) 
    : 0;

  const strongSkills = finalSkills.filter(s => s.status === "strong");
  const partialSkills = finalSkills.filter(s => s.status === "partial");
  const missingSkills = finalSkills.filter(s => s.status === "missing");

  // Priority Gaps
  const highPriorityGaps = finalSkills.filter(s => s.status !== "strong" && s.priority?.toLowerCase() === "high");
  const mediumPriorityGaps = finalSkills.filter(s => s.status !== "strong" && s.priority?.toLowerCase() === "medium");
  const lowPriorityGaps = finalSkills.filter(s => s.status !== "strong" && s.priority?.toLowerCase() === "low");

  // Category Domain Scores (Weighted)
  const calculateDomainScore = (categoryName) => {
    const inDomain = finalSkills.filter(s => s.category.toLowerCase() === categoryName.toLowerCase());
    if (!inDomain.length) return 0;
    let domainEarned = 0;
    let domainTotal = 0;

    inDomain.forEach(s => {
      const weight = PRIORITY_WEIGHTS[s.priority?.toLowerCase()] || 2;
      domainTotal += weight;
      if (s.status === "strong") domainEarned += weight * 1.0;
      else if (s.status === "partial") domainEarned += weight * 0.5;
    });

    return domainTotal > 0 ? Math.round((domainEarned / domainTotal) * 100) : 0;
  };

  const categoryScores = {
    technicalSkills: overallMatchScore,
    programming: calculateDomainScore("Programming"),
    frameworks: calculateDomainScore("Frameworks"),
    databases: calculateDomainScore("Databases"),
    tools: calculateDomainScore("Tools"),
    cloudDevOps: calculateDomainScore("Cloud/DevOps")
  };

  // Convert to legacy structure for full backward compatibility
  const formatLegacySkill = (s) => ({
    skillName: s.name,
    category: s.category,
    currentProficiency: s.status === "strong" ? "Advanced" : s.status === "partial" ? "Intermediate" : "None",
    requiredProficiency: s.priority === "high" ? "Advanced" : "Intermediate",
    gapPercentage: s.gapPercentage,
    priority: s.priority.charAt(0).toUpperCase() + s.priority.slice(1),
    evidence: s.evidence,
    reason: s.reason
  });

  return {
    targetRole,
    overallMatchScore,
    weightedSummary: {
      weightedMatchedRequirements,
      weightedTotalRequirements,
      formula: "(weightedMatchedRequirements / weightedTotalRequirements) * 100"
    },
    priorityGaps: {
      high: highPriorityGaps.map(formatLegacySkill),
      medium: mediumPriorityGaps.map(formatLegacySkill),
      low: lowPriorityGaps.map(formatLegacySkill),
      highCount: highPriorityGaps.length,
      mediumCount: mediumPriorityGaps.length,
      lowCount: lowPriorityGaps.length
    },
    categoryScores,
    skills: finalSkills,
    strongSkills: strongSkills.map(formatLegacySkill),
    partialSkills: partialSkills.map(formatLegacySkill),
    missingSkills: missingSkills.map(formatLegacySkill),
    analyzedAt: new Date().toISOString()
  };
}

export function calculateOverallSkillScore(skillGap = []) {
  if (!skillGap || !skillGap.length) return 0;
  let earned = 0;
  let total = 0;

  skillGap.forEach(s => {
    const prio = (s.priority || "medium").toLowerCase();
    const weight = PRIORITY_WEIGHTS[prio] || 2;
    total += weight;
    const isStrong = s.status === "strong" || s.status === "GAINED" || (s.currentLevel >= 100) || (s.progress >= 100);
    const isPartial = s.status === "partial" || s.status === "LEARNING" || (s.currentLevel > 0 && s.currentLevel < 100);
    if (isStrong) earned += weight * 1.0;
    else if (isPartial) earned += weight * 0.5;
  });

  return total > 0 ? Math.round((earned / total) * 100) : 0;
}

export async function calculateSkillGap(userSkills = [], roleRequirements = []) {
  const normalizedUser = (userSkills || []).map(s => normalizeSkillName(typeof s === "string" ? s : s.name || s.skill || "").toLowerCase());
  const missing = [];
  const strong = [];

  (roleRequirements || []).forEach(req => {
    const rawReq = typeof req === "string" ? req : req.name || req.skill || "";
    if (!rawReq) return;
    const reqName = normalizeSkillName(rawReq);
    if (normalizedUser.includes(reqName.toLowerCase())) {
      strong.push({ skill: reqName, status: "GAINED", currentLevel: 100 });
    } else {
      missing.push({ skill: reqName, status: "MISSING", currentLevel: 0 });
    }
  });

  return [...strong, ...missing];
}

export default {
  PRIORITY_WEIGHTS,
  SKILL_NORMALIZATION_MAP,
  normalizeSkillName,
  ROLE_TAXONOMY,
  categorizeSkill,
  extractEvidenceForSkill,
  performSkillGapAnalysis,
  calculateOverallSkillScore,
  calculateSkillGap
};

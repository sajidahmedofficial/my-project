// agent-notes: { ctx: "Primary Skill Gap AI service supporting custom Job Description extraction, required vs preferred separation, weighted scoring (High=3, Med=2, Low=1), and verified skill promotion", deps: ["./geminiService.js"], state: "active", last: "anti@2026-08-25" }
import { analyzeJSON } from "./geminiService.js";

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
  "cicd": "CI/CD",
  "communication": "Communication",
  "problem solving": "Problem Solving",
  "teamwork": "Team Collaboration",
  "collaboration": "Team Collaboration",
  "agile": "Agile / Scrum",
  "scrum": "Agile / Scrum"
};

export function normalizeSkillName(rawName = "") {
  if (!rawName || typeof rawName !== "string") return "";
  const cleaned = rawName.trim().toLowerCase();
  return SKILL_NORMALIZATION_MAP[cleaned] || rawName.trim();
}

// Standard Role Taxonomy database (used when custom JD is not provided)
export const ROLE_TAXONOMY = {
  "Frontend Developer": {
    category: "Web Development",
    coreSkills: {
      Programming: ["JavaScript", "TypeScript", "HTML5", "CSS3"],
      Frameworks: ["React.js", "Next.js", "Redux", "Tailwind CSS"],
      Databases: ["REST API", "GraphQL"],
      Tools: ["Git", "GitHub", "Vite", "Webpack", "Jest"],
      "Cloud/DevOps": ["Vercel", "Netlify", "Docker"],
      "Soft Skills": ["Problem Solving", "Team Collaboration"]
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
      "Cloud/DevOps": ["Docker", "Kubernetes", "AWS", "CI/CD"],
      "Soft Skills": ["Problem Solving", "System Architecture"]
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
      "Cloud/DevOps": ["Docker", "AWS", "Vercel"],
      "Soft Skills": ["Agile / Scrum", "Communication"]
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
      "Next.js": "medium",
      "Tailwind CSS": "medium",
      "REST API": "medium"
    }
  },
  "Full Stack AI Engineer": {
    category: "AI & Full Stack Development",
    coreSkills: {
      Programming: ["JavaScript", "TypeScript", "Python", "HTML5", "CSS3"],
      Frameworks: ["React.js", "Next.js", "Node.js", "FastAPI", "Tailwind CSS"],
      Databases: ["MongoDB", "PostgreSQL", "Vector DBs", "REST API"],
      Tools: ["Git", "GitHub", "Vite", "Docker"],
      "Cloud/DevOps": ["AWS", "Vercel", "Hugging Face"],
      "Soft Skills": ["Problem Solving", "AI Prompt Engineering"]
    },
    priorities: {
      "Python": "high",
      "React.js": "high",
      "Node.js": "high",
      "JavaScript": "high",
      "TypeScript": "high",
      "HTML5": "high",
      "CSS3": "high",
      "FastAPI": "medium",
      "MongoDB": "medium",
      "Git": "high",
      "Docker": "medium",
      "Next.js": "medium",
      "REST API": "medium"
    }
  },
  "Data Scientist / AI Engineer": {
    category: "Data Science & AI",
    coreSkills: {
      Programming: ["Python", "SQL", "R"],
      Frameworks: ["PyTorch", "TensorFlow", "Pandas", "NumPy", "Scikit-Learn"],
      Databases: ["PostgreSQL", "MongoDB", "Vector DBs"],
      Tools: ["Git", "Jupyter", "MLflow", "Postman"],
      "Cloud/DevOps": ["AWS", "Docker", "FastAPI"],
      "Soft Skills": ["Analytical Thinking", "Data Communication"]
    },
    priorities: {
      "Python": "high",
      "SQL": "high",
      "PyTorch": "high",
      "Pandas": "high",
      "NumPy": "high",
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
      "Cloud/DevOps": ["Docker", "Kubernetes", "AWS", "GitHub Actions", "CI/CD"],
      "Soft Skills": ["Incident Response", "Documentation"]
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
  if (["git", "github", "gitlab", "vite", "webpack", "postman", "jest", "cypress", "linux", "npm", "figma", "jupyter", "mlflow", "swagger"].some(k => s.includes(k))) {
    return "Tools";
  }
  if (["docker", "kubernetes", "aws", "azure", "gcp", "vercel", "netlify", "ci/cd", "terraform", "ansible", "sagemaker", "hugging"].some(k => s.includes(k))) {
    return "Cloud/DevOps";
  }
  if (["communication", "problem solving", "teamwork", "collaboration", "agile", "scrum", "leadership", "time management"].some(k => s.includes(k))) {
    return "Soft Skills";
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
 * Extract Structured Requirements directly from a custom Job Description using AI + Rule-based fallback.
 * Separates Required (must-have) vs Preferred (nice-to-have) skills across technical categories.
 */
export async function extractJobDescriptionRequirements(jobDescription = "", fallbackRole = "Software Engineer") {
  if (!jobDescription || jobDescription.trim().length < 15) {
    return null;
  }

  const prompt = `You are a Technical Recruiter and Job Requirements Extraction Engine.
Analyze the following Job Description and extract all requirements with high precision.

JOB DESCRIPTION:
"""
${jobDescription.slice(0, 4000)}
"""

RULES:
1. Distinguish strictly between REQUIRED (must-have, essential, qualifications) and PREFERRED (nice-to-have, bonus, plus, desired).
2. Categorize all technical skills into:
   - programmingLanguages
   - frameworks
   - databases
   - tools
   - cloud
   - softSkills
3. Extract experience requirements (e.g. "3+ years of experience in web development").

Return ONLY a JSON object with this EXACT structure:
{
  "extractedRole": "string (e.g. Senior Full Stack Engineer)",
  "requiredSkills": ["string (e.g. React.js, Node.js, TypeScript, SQL, Docker)"],
  "preferredSkills": ["string (e.g. GraphQL, AWS, Next.js, Redis)"],
  "programmingLanguages": ["string"],
  "frameworks": ["string"],
  "databases": ["string"],
  "tools": ["string"],
  "cloud": ["string"],
  "softSkills": ["string"],
  "experienceRequirements": "string (e.g. 2-4 years full-stack experience)"
}`;

  let aiExtracted = null;
  try {
    aiExtracted = await analyzeJSON(prompt);
  } catch (err) {
    console.warn("Gemini AI JD extraction fallback notice:", err.message);
  }

  if (aiExtracted && (Array.isArray(aiExtracted.requiredSkills) || Array.isArray(aiExtracted.preferredSkills))) {
    const requiredSkills = (aiExtracted.requiredSkills || []).map(normalizeSkillName).filter(Boolean);
    const preferredSkills = (aiExtracted.preferredSkills || []).map(normalizeSkillName).filter(Boolean);
    
    return {
      isCustomJD: true,
      extractedRole: aiExtracted.extractedRole || fallbackRole,
      requiredSkills,
      preferredSkills,
      programmingLanguages: (aiExtracted.programmingLanguages || []).map(normalizeSkillName).filter(Boolean),
      frameworks: (aiExtracted.frameworks || []).map(normalizeSkillName).filter(Boolean),
      databases: (aiExtracted.databases || []).map(normalizeSkillName).filter(Boolean),
      tools: (aiExtracted.tools || []).map(normalizeSkillName).filter(Boolean),
      cloud: (aiExtracted.cloud || []).map(normalizeSkillName).filter(Boolean),
      softSkills: aiExtracted.softSkills || [],
      experienceRequirements: aiExtracted.experienceRequirements || "1+ years relevant industry experience"
    };
  }

  // Deterministic Rule-Based Fallback for Custom JD
  const lines = jobDescription.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  let isPreferredSection = false;
  const required = [];
  const preferred = [];

  const knownSkillBank = [
    "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "HTML5", "CSS3", "SQL",
    "React.js", "Next.js", "Node.js", "Express.js", "Redux", "Tailwind CSS", "Django", "FastAPI", "Spring Boot",
    "MongoDB", "PostgreSQL", "MySQL", "Redis", "GraphQL", "REST API",
    "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Git", "GitHub", "Vite", "Webpack", "Jest", "CI/CD",
    "Problem Solving", "Team Collaboration", "Agile / Scrum", "Communication"
  ];

  lines.forEach(line => {
    const lLower = line.toLowerCase();
    if (/preferred|nice to have|bonus|plus|desired|optional/i.test(lLower)) {
      isPreferredSection = true;
    } else if (/required|must have|qualifications|requirements|essential|minimum/i.test(lLower)) {
      isPreferredSection = false;
    }

    knownSkillBank.forEach(sk => {
      if (lLower.includes(sk.toLowerCase().replace(".js", ""))) {
        if (isPreferredSection) {
          preferred.push(sk);
        } else {
          required.push(sk);
        }
      }
    });
  });

  const finalRequired = Array.from(new Set(required.length > 0 ? required : ["JavaScript", "HTML5", "CSS3", "React.js"]));
  const finalPreferred = Array.from(new Set(preferred.filter(s => !finalRequired.includes(s))));

  return {
    isCustomJD: true,
    extractedRole: fallbackRole,
    requiredSkills: finalRequired,
    preferredSkills: finalPreferred,
    programmingLanguages: finalRequired.filter(s => categorizeSkill(s) === "Programming"),
    frameworks: finalRequired.filter(s => categorizeSkill(s) === "Frameworks"),
    databases: finalRequired.filter(s => categorizeSkill(s) === "Databases"),
    tools: finalRequired.filter(s => categorizeSkill(s) === "Tools"),
    cloud: finalRequired.filter(s => categorizeSkill(s) === "Cloud/DevOps"),
    softSkills: finalRequired.filter(s => categorizeSkill(s) === "Soft Skills"),
    experienceRequirements: "Demonstrated production experience matching requirements"
  };
}

/**
 * Validate and sanitize skill objects with priority weights & verified status.
 * Missing Required skills are assigned HIGH priority (weight 3).
 * Missing Preferred skills are assigned LOW or MEDIUM priority (weight 1 or 2).
 */
function validateAndSanitizeSkills({
  rawSkills = [],
  requiredSkills = [],
  preferredSkills = [],
  resumeText = "",
  userSkills = [],
  verifiedSkills = [],
  isCustomJD = false
}) {
  const seen = new Set();
  const sanitized = [];

  const normalizedVerified = (verifiedSkills || []).map(v => {
    const raw = typeof v === 'string' ? v : v.skillName || v.skill || v.name || '';
    return normalizeSkillName(raw).toLowerCase();
  });

  const normalizedUser = (userSkills || []).map(u => {
    const raw = typeof u === 'string' ? u : u.skillName || u.skill || u.name || '';
    return normalizeSkillName(raw).toLowerCase();
  });

  const normalizedRequired = requiredSkills.map(s => normalizeSkillName(s).toLowerCase());
  const normalizedPreferred = preferredSkills.map(s => normalizeSkillName(s).toLowerCase());

  rawSkills.forEach(item => {
    if (!item || !item.name) return;
    const normalizedName = normalizeSkillName(item.name);
    const key = normalizedName.toLowerCase();

    if (seen.has(key)) return;
    seen.add(key);

    const category = item.category || categorizeSkill(normalizedName);
    const extractedEvidence = extractEvidenceForSkill(normalizedName, resumeText);
    const isVerified = normalizedVerified.includes(key);
    const isUserSkill = normalizedUser.some(u => u === key || u.includes(key) || key.includes(u));

    const combinedEvidence = Array.from(new Set([
      ...(Array.isArray(item.evidence) ? item.evidence : []),
      ...extractedEvidence,
      ...(isUserSkill ? [`Detected in resume skills: ${normalizedName}`] : []),
      ...(isVerified ? [`Certified & Verified via SkillBridge Assessment`] : [])
    ]));

    let status = (item.status || "").toLowerCase();
    if (isVerified || isUserSkill || combinedEvidence.length >= 1) {
      status = "strong";
    } else if (!["strong", "partial", "missing"].includes(status)) {
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

    // Priority Assignment: Missing Required -> High (3). Preferred -> Low (1) or Medium (2).
    const isReq = normalizedRequired.includes(key);
    const isPref = normalizedPreferred.includes(key);
    
    let priority = "medium";
    if (isReq) {
      priority = "high";
    } else if (isPref) {
      priority = "low";
    } else if (["high", "medium", "low"].includes((item.priority || "").toLowerCase())) {
      priority = item.priority.toLowerCase();
    }

    sanitized.push({
      name: normalizedName,
      category,
      status,
      currentLevel,
      requiredLevel: 100,
      gapPercentage,
      priority,
      requirementType: isReq ? "Required" : isPref ? "Preferred" : "Supplementary",
      evidence: combinedEvidence,
      reason: combinedEvidence.length > 0 ? combinedEvidence.join("; ") : `No evidence of ${normalizedName} found in uploaded resume.`
    });
  });

  // Ensure all Required skills from custom JD or taxonomy are accounted for
  requiredSkills.forEach(reqSkill => {
    const normReq = normalizeSkillName(reqSkill);
    const key = normReq.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      const isVerified = normalizedVerified.includes(key);
      const isUserSkill = normalizedUser.some(u => u === key || u.includes(key) || key.includes(u));
      const evidence = extractEvidenceForSkill(normReq, resumeText);
      if (isUserSkill) {
        evidence.push(`Detected in resume skills: ${normReq}`);
      }
      if (isVerified) {
        evidence.push("Certified & Verified via SkillBridge Assessment");
      }

      const status = (isVerified || isUserSkill || evidence.length >= 1) ? "strong" : "missing";

      sanitized.push({
        name: normReq,
        category: categorizeSkill(normReq),
        status,
        currentLevel: status === "strong" ? 100 : status === "partial" ? 50 : 0,
        requiredLevel: 100,
        gapPercentage: status === "strong" ? 0 : status === "partial" ? 50 : 100,
        priority: "high", // Missing required skills always have high priority
        requirementType: "Required",
        evidence,
        reason: evidence.length > 0 ? evidence.join("; ") : `No evidence of required skill ${normReq} found in uploaded resume.`
      });
    }
  });

  // Account for preferred skills if custom JD is provided
  preferredSkills.forEach(prefSkill => {
    const normPref = normalizeSkillName(prefSkill);
    const key = normPref.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      const isVerified = normalizedVerified.includes(key);
      const isUserSkill = normalizedUser.some(u => u === key || u.includes(key) || key.includes(u));
      const evidence = extractEvidenceForSkill(normPref, resumeText);
      if (isUserSkill) {
        evidence.push(`Detected in resume skills: ${normPref}`);
      }
      if (isVerified) {
        evidence.push("Certified & Verified via SkillBridge Assessment");
      }

      const status = (isVerified || isUserSkill || evidence.length >= 1) ? "strong" : "missing";

      sanitized.push({
        name: normPref,
        category: categorizeSkill(normPref),
        status,
        currentLevel: status === "strong" ? 100 : status === "partial" ? 50 : 0,
        requiredLevel: 100,
        gapPercentage: status === "strong" ? 0 : status === "partial" ? 50 : 100,
        priority: "low", // Preferred skills have low priority
        requirementType: "Preferred",
        evidence,
        reason: evidence.length > 0 ? evidence.join("; ") : `Preferred skill ${normPref} not found in uploaded resume.`
      });
    }
  });

  return sanitized;
}

/**
 * Main AI Skill Gap Service using Weighted Scoring:
 * High = weight 3 (Required skills)
 * Medium = weight 2
 * Low = weight 1 (Preferred skills)
 *
 * When custom Job Description is provided, it is used as the PRIMARY SOURCE OF TRUTH.
 */
export async function performSkillGapAnalysis({
  userSkills = [],
  resumeText = "",
  targetRole = "Frontend Developer",
  jobDescription = "",
  verifiedSkills = []
}) {
  const hasCustomJD = Boolean(jobDescription && jobDescription.trim().length >= 20);

  // 1. Extract requirements: Custom JD (Primary) OR Role Taxonomy (Supplementary / Fallback)
  let jdRequirements = null;
  if (hasCustomJD) {
    jdRequirements = await extractJobDescriptionRequirements(jobDescription, targetRole);
  }

  const taxonomy = ROLE_TAXONOMY[targetRole] || ROLE_TAXONOMY["Frontend Developer"];
  const taxonomyRequiredFlat = Object.values(taxonomy.coreSkills).flat().map(normalizeSkillName);

  const requiredSkills = jdRequirements ? jdRequirements.requiredSkills : taxonomyRequiredFlat;
  const preferredSkills = jdRequirements ? jdRequirements.preferredSkills : [];
  const effectiveRole = jdRequirements?.extractedRole || targetRole;

  // 2. Try Gemini AI structured extraction
  let aiReport = null;

  if (resumeText && resumeText.trim().length > 10) {
    const prompt = `You are a Senior Technical Career Evaluator and Skill Gap Analyst.
Analyze the candidate's actual resume against ${hasCustomJD ? 'the provided Custom Job Description (PRIMARY SOURCE OF TRUTH)' : `the target role "${effectiveRole}"`}.

${hasCustomJD ? `PRIMARY JOB DESCRIPTION REQUIREMENTS:
REQUIRED SKILLS: ${JSON.stringify(requiredSkills)}
PREFERRED SKILLS: ${JSON.stringify(preferredSkills)}

FULL JOB DESCRIPTION:
"""
${jobDescription.slice(0, 3000)}
"""` : `TARGET ROLE: ${effectiveRole}
REQUIRED ROLE SKILLS: ${JSON.stringify(requiredSkills)}`}

CANDIDATE ACTUAL RESUME TEXT:
"""
${resumeText.slice(0, 4500)}
"""

RULES:
1. Extract ALL skills mentioned in the resume.
2. Cross-reference them against the ${hasCustomJD ? 'Job Description requirements' : 'Role requirements'}.
3. Assign priority "high" to missing REQUIRED skills and "low" to PREFERRED skills.
4. Classify each skill into:
   - "strong": Candidate demonstrated practical project/work evidence.
   - "partial": Candidate listed the skill or has basic familiarity with limited project depth.
   - "missing": Skill has NO evidence in the resume.
5. Provide concrete citation quotes in "evidence" array for each skill.

Return ONLY a JSON object with this EXACT structure:
{
  "targetRole": "${effectiveRole}",
  "skills": [
    {
      "name": "string (canonical name)",
      "category": "Programming|Frameworks|Databases|Tools|Cloud/DevOps|Soft Skills",
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
    finalSkills = validateAndSanitizeSkills({
      rawSkills: aiReport.skills,
      requiredSkills,
      preferredSkills,
      resumeText,
      userSkills,
      verifiedSkills,
      isCustomJD: hasCustomJD
    });
  } else {
    // Deterministic Rule-Based Evidence Engine
    const initialList = userSkills.map(s => ({
      name: s,
      category: categorizeSkill(s),
      status: "strong"
    }));
    finalSkills = validateAndSanitizeSkills({
      rawSkills: initialList,
      requiredSkills,
      preferredSkills,
      resumeText,
      userSkills,
      verifiedSkills,
      isCustomJD: hasCustomJD
    });
  }

  // --- Weighted Scoring Engine ---
  // High = 3 (Required), Medium = 2, Low = 1 (Preferred)
  let weightedMatchedRequirements = 0;
  let weightedTotalRequirements = 0;

  finalSkills.forEach(s => {
    const weight = PRIORITY_WEIGHTS[s.priority] || 2;
    weightedTotalRequirements += weight;

    if (s.status === "strong") {
      weightedMatchedRequirements += weight * 1.0;
    } else if (s.status === "partial") {
      weightedMatchedRequirements += weight * 0.5;
    }
  });

  const overallMatchScore = weightedTotalRequirements > 0
    ? Math.round((weightedMatchedRequirements / weightedTotalRequirements) * 100)
    : 0;

  // Groupings
  const strongSkills = finalSkills.filter(s => s.status === "strong");
  const partialSkills = finalSkills.filter(s => s.status === "partial");
  const missingSkills = finalSkills.filter(s => s.status === "missing");

  const highPriorityGaps = missingSkills.filter(s => s.priority === "high");
  const mediumPriorityGaps = missingSkills.filter(s => s.priority === "medium");
  const lowPriorityGaps = missingSkills.filter(s => s.priority === "low");

  const formatLegacySkill = s => ({
    skill: s.name,
    name: s.name,
    category: s.category,
    status: s.status === "strong" ? "GAINED" : s.status === "partial" ? "LEARNING" : "MISSING",
    currentLevel: s.currentLevel,
    progress: s.currentLevel,
    requiredLevel: s.requiredLevel,
    gapPercentage: s.gapPercentage,
    priority: s.priority,
    requirementType: s.requirementType,
    evidence: s.evidence,
    reason: s.reason
  });

  // Calculate Category Breakdowns
  const categories = ["Programming", "Frameworks", "Databases", "Tools", "Cloud/DevOps", "Soft Skills"];
  const categoryScores = {};

  categories.forEach(cat => {
    const catSkills = finalSkills.filter(s => s.category === cat);
    if (catSkills.length > 0) {
      let catEarned = 0;
      let catTotal = 0;
      catSkills.forEach(cs => {
        const w = PRIORITY_WEIGHTS[cs.priority] || 2;
        catTotal += w;
        if (cs.status === "strong") catEarned += w * 1.0;
        else if (cs.status === "partial") catEarned += w * 0.5;
      });
      categoryScores[cat] = catTotal > 0 ? Math.round((catEarned / catTotal) * 100) : 0;
    }
  });

  return {
    targetRole: effectiveRole,
    isCustomJD: hasCustomJD,
    jobDescriptionAnalysis: jdRequirements,
    overallMatchScore,
    score: overallMatchScore,
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
    requirementsBreakdown: {
      required: {
        total: requiredSkills.length,
        skills: requiredSkills,
        missing: highPriorityGaps.map(s => s.name)
      },
      preferred: {
        total: preferredSkills.length,
        skills: preferredSkills,
        missing: lowPriorityGaps.map(s => s.name)
      }
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
      missing.push({ skill: reqName, status: "MISSING", currentLevel: 0, priority: "high" });
    }
  });

  return { missing, strong, matchPercentage: roleRequirements.length > 0 ? Math.round((strong.length / roleRequirements.length) * 100) : 0 };
}

export const getSkillGapReport = async (userId, resumeData, targetRole = "Frontend Developer", jobDescription = "") => {
  const resumeText = resumeData?.text || resumeData?.rawText || "";
  const userSkills = resumeData?.skills || [];
  return performSkillGapAnalysis({ userSkills, resumeText, targetRole, jobDescription });
};

export default {
  performSkillGapAnalysis,
  extractJobDescriptionRequirements,
  calculateOverallSkillScore,
  calculateSkillGap,
  getSkillGapReport,
  normalizeSkillName,
  categorizeSkill,
  extractEvidenceForSkill,
  PRIORITY_WEIGHTS,
  ROLE_TAXONOMY,
  SKILL_NORMALIZATION_MAP
};

// agent-notes: { ctx: "Deep AI Skill Gap Analysis service with resume evidence extraction, multi-dimensional section scanning, taxonomy matching, and categorization", deps: ["@google/generative-ai"], state: "active", last: "anti@2026-08-20" }
import { GoogleGenerativeAI } from '@google/generative-ai';

// Standard Taxonomy Definitions for Target Roles
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
      "React.js": "High",
      "TypeScript": "High",
      "JavaScript": "High",
      "HTML5": "High",
      "CSS3": "High",
      "Next.js": "Medium",
      "Redux": "Medium",
      "Tailwind CSS": "Medium",
      "Git": "High",
      "Docker": "Low",
      "Jest": "Medium"
    }
  },
  "Backend Engineer": {
    category: "Backend Development",
    coreSkills: {
      Programming: ["JavaScript", "Python", "Java", "Go", "TypeScript"],
      Frameworks: ["Node.js", "Express.js", "Django", "FastAPI", "Spring Boot"],
      Databases: ["PostgreSQL", "MongoDB", "Redis", "MySQL", "SQL"],
      Tools: ["Git", "Postman", "Swagger", "Jest"],
      "Cloud/DevOps": ["Docker", "Kubernetes", "AWS", "CI/CD Pipelines"]
    },
    priorities: {
      "Node.js": "High",
      "Express.js": "High",
      "PostgreSQL": "High",
      "MongoDB": "High",
      "Docker": "High",
      "AWS": "Medium",
      "Redis": "Medium",
      "Git": "High",
      "Kubernetes": "Low"
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
      "React.js": "High",
      "Node.js": "High",
      "Express.js": "High",
      "MongoDB": "High",
      "TypeScript": "High",
      "PostgreSQL": "Medium",
      "Docker": "Medium",
      "AWS": "Medium",
      "Git": "High"
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
      "Python": "High",
      "SQL": "High",
      "Pandas": "High",
      "PyTorch": "High",
      "Scikit-Learn": "High",
      "TensorFlow": "Medium",
      "Docker": "Medium",
      "Git": "Medium"
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
      "Docker": "High",
      "Kubernetes": "High",
      "AWS": "High",
      "Linux": "High",
      "GitHub Actions": "High",
      "Terraform": "Medium",
      "Git": "High"
    }
  }
};

const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenerativeAI(apiKey);
};

/**
 * Categorize a skill name into technical domain
 */
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
  return "Other";
}

/**
 * Extract contextual evidence snippets for a skill from parsed resume text
 */
export function extractEvidenceForSkill(skillName, resumeText = "") {
  if (!resumeText || typeof resumeText !== 'string') return [];
  const text = resumeText.toLowerCase();
  const skill = skillName.toLowerCase().replace('.js', '').trim();
  const evidence = [];

  const lines = resumeText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  let currentSection = "General";

  lines.forEach(line => {
    const lineLower = line.toLowerCase();

    // Section headers detection
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

    // Check if line contains skill
    if (lineLower.includes(skill)) {
      if (currentSection === "Technical Skills") {
        evidence.push(`${skillName} listed in Technical Skills`);
      } else if (currentSection === "Projects") {
        evidence.push(`Used in Projects section: "${line.slice(0, 80)}"`);
      } else if (currentSection === "Experience") {
        evidence.push(`Applied in Work/Internship experience: "${line.slice(0, 80)}"`);
      } else if (currentSection === "Education") {
        evidence.push(`Studied in Coursework: "${line.slice(0, 80)}"`);
      } else if (currentSection === "Certifications") {
        evidence.push(`Certified in: "${line.slice(0, 80)}"`);
      } else {
        evidence.push(`Mentioned in resume: "${line.slice(0, 80)}"`);
      }
    }
  });

  return Array.from(new Set(evidence));
}

/**
 * AI & Heuristic Skill Gap Analysis Engine directly analyzing uploaded resume text
 */
export async function performSkillGapAnalysis({ userSkills = [], resumeText = "", targetRole = "Frontend Developer", jobDescription = "" }) {
  const taxonomy = ROLE_TAXONOMY[targetRole] || ROLE_TAXONOMY["Frontend Developer"];
  
  // Extract all required skills for the target role
  const requiredSkillsFlat = Object.values(taxonomy.coreSkills).flat();
  const allRequired = [...new Set([...requiredSkillsFlat])];

  const ai = getGenAI();
  if (ai && resumeText) {
    try {
      const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `You are a Senior Technical Hiring Manager and AI Skill Gap Evaluator.
Analyze the candidate's actual resume text against the target role "${targetRole}" and optional Job Description.

TARGET ROLE: ${targetRole}
REQUIRED SKILLS: ${JSON.stringify(allRequired)}

CANDIDATE ACTUAL RESUME TEXT:
"""
${(resumeText || "").slice(0, 4000)}
"""

JOB DESCRIPTION (if provided):
"""
${(jobDescription || "").slice(0, 2000)}
"""

RULES:
1. Do NOT assume a skill exists simply because the user chose the role "${targetRole}".
2. Classify each required skill based ONLY on real resume evidence:
   - "strongSkills": skill is supported by technical skills AND project/work experience evidence.
   - "partialSkills": skill is mentioned briefly or only listed in keywords without in-depth project bullets.
   - "missingSkills": skill is NOT mentioned or has NO evidence in resume.
3. For every skill include an "evidence" array with exact citations/reasons from resume text.

Return pure JSON only matching this schema:
{
  "overallMatchScore": number (0-100),
  "categoryScores": {
    "technicalSkills": number,
    "programming": number,
    "frameworks": number,
    "databases": number,
    "tools": number,
    "cloudDevOps": number
  },
  "strongSkills": [
    { "skillName": "string", "category": "string", "currentProficiency": "Advanced", "requiredProficiency": "Advanced", "gapPercentage": 0, "priority": "High|Medium|Low", "evidence": ["string"], "reason": "string" }
  ],
  "partialSkills": [
    { "skillName": "string", "category": "string", "currentProficiency": "Beginner|Intermediate", "requiredProficiency": "Intermediate|Advanced", "gapPercentage": 45, "priority": "High|Medium|Low", "evidence": ["string"], "reason": "string" }
  ],
  "missingSkills": [
    { "skillName": "string", "category": "string", "currentProficiency": "None", "requiredProficiency": "Intermediate|Advanced", "gapPercentage": 100, "priority": "High|Medium|Low", "evidence": [], "reason": "No evidence found in uploaded resume." }
  ]
}`;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      });

      const parsed = JSON.parse(result.response.text());
      if (parsed && Array.isArray(parsed.missingSkills) && Array.isArray(parsed.strongSkills)) {
        return parsed;
      }
    } catch (err) {
      console.warn("Gemini AI Skill Gap fallback triggered:", err.message);
    }
  }

  // Deep Section-Level Evidence Extractor Heuristics
  const strongSkills = [];
  const partialSkills = [];
  const missingSkills = [];

  const normalizedUserSkills = userSkills.map(s => s.toLowerCase().trim());

  allRequired.forEach(skill => {
    const evidence = extractEvidenceForSkill(skill, resumeText);
    const isDirectSkillInProfile = normalizedUserSkills.includes(skill.toLowerCase());
    const category = categorizeSkill(skill);
    const priority = taxonomy.priorities[skill] || "Medium";

    if (evidence.length >= 2 || (evidence.length >= 1 && isDirectSkillInProfile)) {
      strongSkills.push({
        skillName: skill,
        category,
        currentProficiency: "Advanced",
        requiredProficiency: "Advanced",
        gapPercentage: 0,
        priority,
        evidence,
        reason: evidence.join('; ') || `Demonstrated proficiency in ${skill} verified in resume.`
      });
    } else if (evidence.length === 1 || isDirectSkillInProfile) {
      partialSkills.push({
        skillName: skill,
        category,
        currentProficiency: "Intermediate",
        requiredProficiency: "Advanced",
        gapPercentage: 45,
        priority,
        evidence,
        reason: evidence.length ? evidence[0] : `Listed in profile skills, but needs deeper project evidence in resume.`
      });
    } else {
      missingSkills.push({
        skillName: skill,
        category,
        currentProficiency: "None",
        requiredProficiency: priority === "High" ? "Advanced" : "Intermediate",
        gapPercentage: 100,
        priority,
        evidence: [],
        reason: `No evidence of ${skill} projects, experience, or coursework found in the uploaded resume.`
      });
    }
  });

  const totalEvaluated = allRequired.length;
  const matchPoints = (strongSkills.length * 1.0) + (partialSkills.length * 0.5);
  const overallMatchScore = totalEvaluated > 0 ? Math.round((matchPoints / totalEvaluated) * 100) : 0;

  const calculateCategoryScore = (catName) => {
    const inCat = allRequired.filter(s => categorizeSkill(s) === catName);
    if (!inCat.length) return 0;
    const strongInCat = strongSkills.filter(s => s.category === catName).length;
    const partialInCat = partialSkills.filter(s => s.category === catName).length;
    return Math.round(((strongInCat + partialInCat * 0.5) / inCat.length) * 100);
  };

  return {
    overallMatchScore,
    categoryScores: {
      technicalSkills: overallMatchScore,
      programming: calculateCategoryScore("Programming"),
      frameworks: calculateCategoryScore("Frameworks"),
      databases: calculateCategoryScore("Databases"),
      tools: calculateCategoryScore("Tools"),
      cloudDevOps: calculateCategoryScore("Cloud/DevOps")
    },
    strongSkills,
    partialSkills,
    missingSkills,
    analyzedAt: new Date().toISOString()
  };
}

export function calculateOverallSkillScore(skillGap = []) {
  if (!skillGap || !skillGap.length) return 0;
  const total = skillGap.reduce((sum, skill) => sum + (skill.currentLevel ?? skill.progress ?? (skill.status === 'GAINED' ? 100 : 0)), 0);
  return Math.round(total / skillGap.length);
}

export async function calculateSkillGap(userSkills = [], roleRequirements = []) {
  const normalizedUser = (userSkills || []).map(s => (typeof s === 'string' ? s : s.name || s.skill || '').toLowerCase().trim());
  const missing = [];
  const strong = [];

  (roleRequirements || []).forEach(req => {
    const reqName = typeof req === 'string' ? req : req.name || req.skill || '';
    if (!reqName) return;
    if (normalizedUser.includes(reqName.toLowerCase().trim())) {
      strong.push({ skill: reqName, status: 'GAINED', currentLevel: 100 });
    } else {
      missing.push({ skill: reqName, status: 'MISSING', currentLevel: 0 });
    }
  });

  return [...strong, ...missing];
}

export default {
  ROLE_TAXONOMY,
  categorizeSkill,
  extractEvidenceForSkill,
  performSkillGapAnalysis,
  calculateOverallSkillScore,
  calculateSkillGap
};

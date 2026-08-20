// agent-notes: { ctx: "Deep AI Skill Gap Analysis service with taxonomy matching, categorization, and evidence explanations", deps: ["@google/generative-ai"], state: "active", last: "anti@2026-08-20" }
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
      Databases: ["PostgreSQL", "MongoDB", "Redis", "MySQL"],
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
      Programming: ["JavaScript", "TypeScript", "HTML5", "CSS3"],
      Frameworks: ["React.js", "Node.js", "Express.js", "Next.js", "Tailwind CSS"],
      Databases: ["MongoDB", "PostgreSQL", "REST API"],
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
      Databases: ["PostgreSQL", "MongoDB", "Vector DBs (Pinecone/Milvus)"],
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
 * Categorize a skill name into technical category
 */
export function categorizeSkill(skillName, roleTaxonomy = null) {
  const s = skillName.toLowerCase();
  
  if (["javascript", "typescript", "python", "java", "c++", "c#", "go", "rust", "html", "html5", "css", "css3", "sql", "bash", "r"].some(k => s.includes(k))) {
    return "Programming";
  }
  if (["react", "next", "vue", "angular", "node", "express", "django", "flask", "spring", "redux", "tailwind", "fastapi", "pytorch", "tensorflow", "pandas", "numpy"].some(k => s.includes(k))) {
    return "Frameworks";
  }
  if (["mongo", "mongodb", "postgres", "postgresql", "mysql", "redis", "sqlite", "oracle", "cassandra", "prisma", "graphql", "rest"].some(k => s.includes(k))) {
    return "Databases";
  }
  if (["git", "github", "gitlab", "vite", "webpack", "postman", "jest", "cypress", "linux", "npm", "figma"].some(k => s.includes(k))) {
    return "Tools";
  }
  if (["docker", "kubernetes", "aws", "azure", "gcp", "vercel", "netlify", "ci/cd", "terraform", "ansible"].some(k => s.includes(k))) {
    return "Cloud/DevOps";
  }
  return "Other";
}

/**
 * AI-powered Skill Gap Analysis Engine
 */
export async function performSkillGapAnalysis({ userSkills = [], resumeText = "", targetRole = "Frontend Developer", jobDescription = "" }) {
  const taxonomy = ROLE_TAXONOMY[targetRole] || ROLE_TAXONOMY["Frontend Developer"];
  
  // Extract all required skills for the role
  const requiredSkillsFlat = Object.values(taxonomy.coreSkills).flat();
  const allRequired = [...new Set([...requiredSkillsFlat])];

  const ai = getGenAI();
  if (ai && (resumeText || jobDescription)) {
    try {
      const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `You are an expert AI Career Technical Coach and Skill Gap Evaluator.
Analyze the candidate's skills and resume against the target role "${targetRole}" and optional Job Description.

Candidate Current Skills: ${JSON.stringify(userSkills)}
Target Role: ${targetRole}
Target Role Required Skills: ${JSON.stringify(allRequired)}

Resume Text Excerpt:
"""
${(resumeText || "").slice(0, 3000)}
"""

Job Description (if provided):
"""
${(jobDescription || "").slice(0, 2000)}
"""

Evaluate strictly and return JSON with:
1. "overallMatchScore": percentage (0-100)
2. "categoryScores": { "technicalSkills": number, "programming": number, "frameworks": number, "databases": number, "tools": number, "cloudDevOps": number }
3. "strongSkills": array of { "skillName": string, "category": string, "currentProficiency": "Intermediate"|"Advanced", "requiredProficiency": "Intermediate"|"Advanced", "gapPercentage": 0, "priority": "High"|"Medium"|"Low", "reason": string }
4. "partialSkills": array of { "skillName": string, "category": string, "currentProficiency": "Beginner"|"Intermediate", "requiredProficiency": "Intermediate"|"Advanced", "gapPercentage": number, "priority": "High"|"Medium"|"Low", "reason": string }
5. "missingSkills": array of { "skillName": string, "category": string, "currentProficiency": "None", "requiredProficiency": "Intermediate"|"Advanced", "gapPercentage": 100, "priority": "High"|"Medium"|"Low", "reason": string explaining evidence from resume why it is missing }

Return pure JSON only.`;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      });

      const parsed = JSON.parse(result.response.text());
      if (parsed && Array.isArray(parsed.missingSkills)) {
        return parsed;
      }
    } catch (err) {
      console.warn("Gemini AI Skill Gap fallback triggered:", err.message);
    }
  }

  // Robust Local Fallback Heuristics Engine
  const normalizedUserSkills = userSkills.map(s => s.toLowerCase().trim());
  const resumeLower = (resumeText || "").toLowerCase();

  const strongSkills = [];
  const partialSkills = [];
  const missingSkills = [];

  allRequired.forEach(skill => {
    const sLower = skill.toLowerCase();
    const isDirectMatch = normalizedUserSkills.some(u => u === sLower || (u.includes("react") && sLower.includes("react")) || (u.includes("node") && sLower.includes("node")));
    const isMentionedInResume = resumeLower.includes(sLower);
    const category = categorizeSkill(skill);
    const priority = taxonomy.priorities[skill] || "Medium";

    if (isDirectMatch) {
      strongSkills.push({
        skillName: skill,
        category,
        currentProficiency: "Advanced",
        requiredProficiency: "Advanced",
        gapPercentage: 0,
        priority,
        reason: `Demonstrated proficiency in ${skill} verified in candidate skill profile.`
      });
    } else if (isMentionedInResume) {
      partialSkills.push({
        skillName: skill,
        category,
        currentProficiency: "Beginner",
        requiredProficiency: "Intermediate",
        gapPercentage: 45,
        priority,
        reason: `Mentioned in resume context, but lacks in-depth production project implementation.`
      });
    } else {
      missingSkills.push({
        skillName: skill,
        category,
        currentProficiency: "None",
        requiredProficiency: priority === "High" ? "Advanced" : "Intermediate",
        gapPercentage: 100,
        priority,
        reason: `The resume contains technical foundation but no direct evidence of ${skill} projects, employment, or coursework.`
      });
    }
  });

  const totalEvaluated = allRequired.length;
  const matchPoints = (strongSkills.length * 1.0) + (partialSkills.length * 0.5);
  const overallMatchScore = totalEvaluated > 0 ? Math.round((matchPoints / totalEvaluated) * 100) : 70;

  const calculateCategoryScore = (catName) => {
    const inCat = allRequired.filter(s => categorizeSkill(s) === catName);
    if (!inCat.length) return 75;
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

export const calculateSkillGap = async (userSkills = [], roleRequirements = []) => {
  const matched = userSkills.filter(s => roleRequirements.includes(s));
  const missing = roleRequirements.filter(s => !userSkills.includes(s));
  return {
    matched,
    missing,
    matchPercentage: roleRequirements.length > 0 ? Math.round((matched.length / roleRequirements.length) * 100) : 100
  };
};

export default {
  ROLE_TAXONOMY,
  categorizeSkill,
  performSkillGapAnalysis,
  calculateOverallSkillScore,
  calculateSkillGap
};

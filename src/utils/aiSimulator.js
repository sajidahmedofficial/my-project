// agent-notes: { ctx: "AI simulator fallback and career chat response generator", deps: ["./mockData.js"], state: "active", last: "sato@2026-10-31" }
import { SKILL_LIBRARY } from './mockData.js';

// Helper list of technical skills for keyword matching
const TECH_KEYWORDS = [
  "HTML", "CSS", "JavaScript", "TypeScript", "React.js", "React", "Angular", "Vue.js", "Next.js",
  "Node.js", "Express.js", "Express", "Python", "Django", "Flask", "Java", "Spring Boot", "C++",
  "SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "DynamoDB", "Git", "GitHub", "Docker",
  "AWS", "S3", "EC2", "Lambda", "Firebase", "Redux", "Zustand", "Tailwind CSS", "Tailwind",
  "Bootstrap", "GraphQL", "REST API", "System Design", "Data Structures", "Algorithms",
  "Authentication", "Testing"
];

// Blacklist of generic job title phrases that MUST NOT be treated as technical skills
const GENERIC_ROLE_TOKENS = [
  "developer", "engineer", "fullstack developer", "full stack developer", "fullstack", "full-stack",
  "frontend developer", "front end developer", "backend developer", "back end developer",
  "software engineer", "software developer", "qa engineer", "data analyst", "data scientist",
  "devops engineer", "cloud engineer", "mobile developer", "ai engineer", "machine learning engineer",
  "role", "requirements", "looking for", "we are looking for"
];

// Structured Competency Profiles for Supported Roles
export const ROLE_PROFILES = {
  FULL_STACK_DEVELOPER: {
    roleKey: "FULL_STACK_DEVELOPER",
    title: "Full Stack Developer",
    categories: {
      "Frontend": ["HTML", "CSS", "JavaScript", "React"],
      "Backend": ["Node.js", "Express.js", "REST API", "Authentication"],
      "Database": ["SQL", "MongoDB"],
      "Development & Tools": ["Git", "GitHub", "Testing"],
      "Deployment": ["Docker", "AWS"]
    },
    mandatory: ["HTML", "CSS", "JavaScript", "React", "Node.js", "Express.js", "SQL", "REST API", "Git"],
    common: ["MongoDB", "Authentication", "Testing"],
    optional: ["Docker", "AWS", "TypeScript", "GraphQL"]
  },
  FRONTEND_DEVELOPER: {
    roleKey: "FRONTEND_DEVELOPER",
    title: "Frontend Developer",
    categories: {
      "Core Web": ["HTML", "CSS", "JavaScript", "TypeScript"],
      "Frameworks": ["React", "Vue.js", "Angular", "Next.js"],
      "Styling & UI": ["Tailwind CSS", "Bootstrap"],
      "Tools": ["Git", "REST API"]
    },
    mandatory: ["HTML", "CSS", "JavaScript", "React", "REST API", "Git"],
    common: ["TypeScript", "Tailwind CSS", "Redux", "Testing"],
    optional: ["Next.js", "GraphQL", "Docker"]
  },
  BACKEND_DEVELOPER: {
    roleKey: "BACKEND_DEVELOPER",
    title: "Backend Developer",
    categories: {
      "Runtime & Frameworks": ["Node.js", "Express.js", "Python", "Java"],
      "APIs & Architecture": ["REST API", "GraphQL", "System Design"],
      "Databases": ["SQL", "PostgreSQL", "MongoDB", "Redis"],
      "Tools & Security": ["Git", "Authentication", "Docker"]
    },
    mandatory: ["Node.js", "Express.js", "SQL", "REST API", "Git"],
    common: ["MongoDB", "Redis", "Authentication", "Docker"],
    optional: ["GraphQL", "System Design", "AWS"]
  },
  SOFTWARE_ENGINEER: {
    roleKey: "SOFTWARE_ENGINEER",
    title: "Software Engineer",
    categories: {
      "Languages": ["JavaScript", "Python", "Java", "C++"],
      "Core CS": ["Data Structures & Algorithms", "System Design"],
      "Databases & Web": ["SQL", "REST API"],
      "Tools": ["Git", "Docker"]
    },
    mandatory: ["Data Structures & Algorithms", "Git", "SQL", "REST API"],
    common: ["JavaScript", "Python", "Java", "Docker", "System Design"],
    optional: ["AWS", "CI/CD", "Kubernetes"]
  },
  REACT_DEVELOPER: {
    roleKey: "REACT_DEVELOPER",
    title: "React Developer",
    categories: {
      "Core Frontend": ["HTML", "CSS", "JavaScript", "React"],
      "State & Routing": ["Redux", "Zustand", "TypeScript"],
      "APIs & Tools": ["REST API", "Git", "Tailwind CSS"]
    },
    mandatory: ["HTML", "CSS", "JavaScript", "React", "Git", "REST API"],
    common: ["Redux", "TypeScript", "Tailwind CSS"],
    optional: ["Next.js", "GraphQL", "Testing"]
  },
  NODE_DEVELOPER: {
    roleKey: "NODE_DEVELOPER",
    title: "Node.js Developer",
    categories: {
      "Backend": ["Node.js", "Express.js", "REST API"],
      "Databases": ["SQL", "MongoDB", "Redis"],
      "Tools": ["Git", "Docker", "Authentication"]
    },
    mandatory: ["Node.js", "Express.js", "REST API", "Git", "SQL"],
    common: ["MongoDB", "Authentication", "Docker"],
    optional: ["Redis", "TypeScript", "AWS"]
  },
  JAVA_DEVELOPER: {
    roleKey: "JAVA_DEVELOPER",
    title: "Java Developer",
    categories: {
      "Core": ["Java", "Spring Boot"],
      "Databases": ["SQL", "PostgreSQL", "MySQL"],
      "APIs & Tools": ["REST API", "Git", "Docker"]
    },
    mandatory: ["Java", "Spring Boot", "SQL", "REST API", "Git"],
    common: ["Docker", "PostgreSQL", "Testing"],
    optional: ["AWS", "Microservices", "Kafka"]
  },
  PYTHON_DEVELOPER: {
    roleKey: "PYTHON_DEVELOPER",
    title: "Python Developer",
    categories: {
      "Core Languages": ["Python", "Django", "Flask"],
      "Databases": ["SQL", "PostgreSQL", "MongoDB"],
      "APIs & Tools": ["REST API", "Git", "Docker"]
    },
    mandatory: ["Python", "Django", "SQL", "REST API", "Git"],
    common: ["Flask", "PostgreSQL", "Docker"],
    optional: ["Redis", "AWS", "Pandas"]
  },
  DATA_ANALYST: {
    roleKey: "DATA_ANALYST",
    title: "Data Analyst",
    categories: {
      "Data & Querying": ["SQL", "Python"],
      "Core Skills": ["Data Structures & Algorithms"],
      "Tools": ["Git"]
    },
    mandatory: ["SQL", "Python", "Git"],
    common: ["Pandas", "NumPy", "Excel"],
    optional: ["Power BI", "Tableau", "R"]
  },
  DATA_SCIENTIST: {
    roleKey: "DATA_SCIENTIST",
    title: "Data Scientist",
    categories: {
      "Languages": ["Python", "SQL"],
      "ML & AI": ["Data Structures & Algorithms"],
      "Tools": ["Git", "Docker"]
    },
    mandatory: ["Python", "SQL", "Data Structures & Algorithms", "Git"],
    common: ["Pandas", "Scikit-Learn", "TensorFlow"],
    optional: ["PyTorch", "Docker", "AWS"]
  },
  DEVOPS_ENGINEER: {
    roleKey: "DEVOPS_ENGINEER",
    title: "DevOps Engineer",
    categories: {
      "Container & Orchestration": ["Docker", "Git"],
      "Cloud & Infra": ["AWS", "Python"],
      "Linux & Scripting": ["System Design"]
    },
    mandatory: ["Docker", "Git", "AWS", "Python"],
    common: ["Kubernetes", "CI/CD", "Linux"],
    optional: ["Terraform", "Ansible", "Jenkins"]
  },
  CLOUD_ENGINEER: {
    roleKey: "CLOUD_ENGINEER",
    title: "Cloud Engineer",
    categories: {
      "Cloud Providers": ["AWS", "Docker"],
      "Networking & Infra": ["System Design", "Git"],
      "Languages": ["Python", "SQL"]
    },
    mandatory: ["AWS", "Docker", "Git", "System Design"],
    common: ["Python", "Kubernetes", "Linux"],
    optional: ["Terraform", "CI/CD", "Security"]
  },
  MOBILE_DEVELOPER: {
    roleKey: "MOBILE_DEVELOPER",
    title: "Mobile Developer",
    categories: {
      "Mobile Frameworks": ["React", "JavaScript"],
      "APIs & Backend": ["REST API", "Git"],
      "Tools": ["Firebase"]
    },
    mandatory: ["JavaScript", "React", "REST API", "Git"],
    common: ["React Native", "Firebase", "Redux"],
    optional: ["Flutter", "Swift", "Kotlin"]
  },
  AI_ENGINEER: {
    roleKey: "AI_ENGINEER",
    title: "AI / Machine Learning Engineer",
    categories: {
      "Languages": ["Python", "C++"],
      "AI & Data": ["Data Structures & Algorithms"],
      "Infrastructure": ["Docker", "Git", "AWS"]
    },
    mandatory: ["Python", "Data Structures & Algorithms", "Git", "Docker"],
    common: ["TensorFlow", "PyTorch", "REST API"],
    optional: ["AWS", "CUDA", "FastAPI"]
  },
  QA_ENGINEER: {
    roleKey: "QA_ENGINEER",
    title: "QA / Test Engineer",
    categories: {
      "Testing & Quality": ["Testing"],
      "Languages": ["JavaScript", "Python"],
      "Tools": ["Git", "REST API"]
    },
    mandatory: ["Testing", "JavaScript", "Git", "REST API"],
    common: ["Python", "Selenium", "Postman"],
    optional: ["Cypress", "Docker", "CI/CD"]
  },
  CYBERSECURITY_ENGINEER: {
    roleKey: "CYBERSECURITY_ENGINEER",
    title: "Cybersecurity Engineer",
    categories: {
      "Security & Infra": ["Authentication", "System Design"],
      "Languages": ["Python", "C++"],
      "Tools": ["Git", "Docker"]
    },
    mandatory: ["Authentication", "System Design", "Python", "Git"],
    common: ["Linux", "Docker", "Networking"],
    optional: ["Wireshark", "Penetration Testing"]
  }
};

/**
 * Normalizes job title / text into a standard Role Key alias
 */
export function normalizeJobTitle(text) {
  if (!text || typeof text !== 'string') return null;
  const s = text.toLowerCase().trim();

  // Full Stack Developer Aliases
  if (/\b(full\s*stack|full-stack|fullstack)\b/i.test(s)) {
    return "FULL_STACK_DEVELOPER";
  }
  // React Developer Aliases
  if (/\b(react|react\.js|reactjs)\s*(developer|engineer|frontend)?\b/i.test(s) && (s.includes("developer") || s.includes("engineer"))) {
    return "REACT_DEVELOPER";
  }
  // Node Developer Aliases
  if (/\b(node|node\.js|nodejs)\s*(developer|engineer|backend)?\b/i.test(s) && (s.includes("developer") || s.includes("engineer"))) {
    return "NODE_DEVELOPER";
  }
  // Frontend Developer Aliases
  if (/\b(front\s*end|front-end|frontend)\b/i.test(s)) {
    return "FRONTEND_DEVELOPER";
  }
  // Backend Developer Aliases
  if (/\b(back\s*end|back-end|backend)\b/i.test(s)) {
    return "BACKEND_DEVELOPER";
  }
  // Java Developer
  if (/\bjava\s+(developer|engineer)\b/i.test(s)) {
    return "JAVA_DEVELOPER";
  }
  // Python Developer
  if (/\bpython\s+(developer|engineer)\b/i.test(s)) {
    return "PYTHON_DEVELOPER";
  }
  // Software Engineer
  if (/\b(software\s+engineer|software\s+developer|sde)\b/i.test(s)) {
    return "SOFTWARE_ENGINEER";
  }
  // Data Scientist
  if (/\bdata\s+scientist\b/i.test(s)) {
    return "DATA_SCIENTIST";
  }
  // Data Analyst
  if (/\bdata\s+analyst\b/i.test(s)) {
    return "DATA_ANALYST";
  }
  // DevOps Engineer
  if (/\bdevops\b/i.test(s)) {
    return "DEVOPS_ENGINEER";
  }
  // Cloud Engineer
  if (/\bcloud\s+engineer\b/i.test(s)) {
    return "CLOUD_ENGINEER";
  }
  // Mobile Developer
  if (/\b(mobile|ios|android)\s+(developer|engineer)\b/i.test(s)) {
    return "MOBILE_DEVELOPER";
  }
  // AI / ML Engineer
  if (/\b(ai|machine\s+learning|ml)\s+(engineer|developer)\b/i.test(s)) {
    return "AI_ENGINEER";
  }
  // QA Engineer
  if (/\b(qa|test)\s+(engineer|analyst)\b/i.test(s)) {
    return "QA_ENGINEER";
  }
  // Cybersecurity
  if (/\b(cybersecurity|security)\s+(engineer|analyst)\b/i.test(s)) {
    return "CYBERSECURITY_ENGINEER";
  }

  return null;
}

// Normalize skill names
function normalizeSkill(skill) {
  const s = skill.toLowerCase().trim();
  if (s === "react" || s === "react.js" || s === "reactjs") return "React.js";
  if (s === "node" || s === "node.js" || s === "nodejs") return "Node.js";
  if (s === "express" || s === "express.js" || s === "expressjs") return "Express.js";
  if (s === "mongodb" || s === "mongo") return "MongoDB";
  if (s === "sql" || s === "mysql" || s === "postgresql" || s === "postgres") return "SQL";
  if (s === "git" || s === "github" || s === "gitlab") return "Git";
  if (s === "typescript" || s === "ts") return "TypeScript";
  if (s === "redux" || s === "redux toolkit") return "Redux";
  if (s === "tailwindcss" || s === "tailwind" || s === "tailwind css") return "TailwindCSS";
  if (s === "python" || s === "py") return "Python";
  if (s === "docker") return "Docker";
  if (s === "rest api" || s === "rest apis" || s === "restful api" || s === "restful apis") return "REST API";
  
  const found = TECH_KEYWORDS.find(keyword => keyword.toLowerCase() === s);
  return found || skill;
}

/**
 * Extracts normalized technical skills from any free-form text input
 */
export function extractSkillsFromText(text) {
  if (!text || typeof text !== 'string') return [];
  const normalizedText = text.toLowerCase();
  
  const foundSkills = [];

  const skillMappings = [
    { pattern: /\b(html|html5)\b/i, name: "HTML" },
    { pattern: /\b(css|css3)\b/i, name: "CSS" },
    { pattern: /\b(javascript|js|es6)\b/i, name: "JavaScript" },
    { pattern: /\b(typescript|ts)\b/i, name: "TypeScript" },
    { pattern: /\b(react|react\.js|reactjs)\b/i, name: "React" },
    { pattern: /\b(angular|angularjs)\b/i, name: "Angular" },
    { pattern: /\b(vue|vue\.js|vuejs)\b/i, name: "Vue.js" },
    { pattern: /\b(next|next\.js|nextjs)\b/i, name: "Next.js" },
    { pattern: /\b(node|node\.js|nodejs)\b/i, name: "Node.js" },
    { pattern: /\b(express|express\.js|expressjs)\b/i, name: "Express.js" },
    { pattern: /\b(python|python3)\b/i, name: "Python" },
    { pattern: /\b(django)\b/i, name: "Django" },
    { pattern: /\b(flask)\b/i, name: "Flask" },
    { pattern: /\b(java)\b/i, name: "Java" },
    { pattern: /\b(spring boot|spring)\b/i, name: "Spring Boot" },
    { pattern: /\b(c\+\+|cpp)\b/i, name: "C++" },
    { pattern: /\b(sql|mysql|postgresql|postgres)\b/i, name: "SQL" },
    { pattern: /\b(mongodb|mongo)\b/i, name: "MongoDB" },
    { pattern: /\b(redis)\b/i, name: "Redis" },
    { pattern: /\b(dynamodb)\b/i, name: "DynamoDB" },
    { pattern: /\b(rest api|rest apis|restful api|restful apis)\b/i, name: "REST API" },
    { pattern: /\b(git|github|gitlab)\b/i, name: "Git" },
    { pattern: /\b(docker|kubernetes|k8s)\b/i, name: "Docker" },
    { pattern: /\b(aws|amazon web services)\b/i, name: "AWS" },
    { pattern: /\b(s3)\b/i, name: "S3" },
    { pattern: /\b(ec2)\b/i, name: "EC2" },
    { pattern: /\b(lambda)\b/i, name: "Lambda" },
    { pattern: /\b(firebase)\b/i, name: "Firebase" },
    { pattern: /\b(redux)\b/i, name: "Redux" },
    { pattern: /\b(zustand)\b/i, name: "Zustand" },
    { pattern: /\b(tailwind|tailwind css|tailwindcss)\b/i, name: "Tailwind CSS" },
    { pattern: /\b(bootstrap)\b/i, name: "Bootstrap" },
    { pattern: /\b(graphql)\b/i, name: "GraphQL" },
    { pattern: /\b(system design)\b/i, name: "System Design" },
    { pattern: /\b(dsa|data structures|algorithms)\b/i, name: "Data Structures & Algorithms" },
    { pattern: /\b(auth|authentication|jwt|oauth)\b/i, name: "Authentication" },
    { pattern: /\b(testing|jest|cypress|unit test)\b/i, name: "Testing" }
  ];

  skillMappings.forEach(({ pattern, name }) => {
    if (pattern.test(normalizedText)) {
      foundSkills.push(name);
    }
  });

  if (foundSkills.length === 0) {
    const rawTokens = text.split(/[\n,•\-]+/)
      .map(item => item.trim().replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9.]+$/g, ''))
      .filter(item => {
        const lower = item.toLowerCase();
        if (item.length < 2 || item.length > 25) return false;
        if (GENERIC_ROLE_TOKENS.some(role => lower === role || lower.includes(role))) return false;
        return true;
      });
    foundSkills.push(...rawTokens);
  }

  return [...new Set(foundSkills)];
}

/**
 * Simulates analyzing a resume and extracting details using keyword matching
 */
export function analyzeResume(fileName, fileText = "") {
  let text = fileText || "";
  if (!text) {
    text = `Resume of Student. Experienced in building websites. Skills: HTML, CSS, JavaScript, SQL. 
    Education: B.Tech in CSE from State University. Finished a project on Weather App using JS.`;
    if (fileName.toLowerCase().includes("priya")) {
      text = "Priya Patel. B.E. in IT. Skills: Python, Java, C++, HTML. Project: Library Management System.";
    } else if (fileName.toLowerCase().includes("rohan")) {
      text = "Rohan Verma. Skills: React, Node.js, Express.js, JavaScript, HTML, CSS, Git. Projects: Task Planner, Rest API.";
    }
  }

  const uniqueSkills = extractSkillsFromText(text);

  let education = "Not found";
  const eduKeywords = ["b.tech", "b.e.", "bca", "mca", "m.tech", "bsc", "computer science", "information technology"];
  const lines = text.split("\n");
  for (const line of lines) {
    if (eduKeywords.some(kw => line.toLowerCase().includes(kw))) {
      education = line.trim();
      break;
    }
  }
  if (education === "Not found") {
    education = "B.Tech in Computer Science & Engineering (Estimated)";
  }

  const projects = [];
  const projectIndex = text.toLowerCase().indexOf("project");
  if (projectIndex !== -1) {
    const projectText = text.substring(projectIndex);
    const projLines = projectText.split("\n").slice(0, 4);
    projLines.forEach(line => {
      const cleanLine = line.replace(/project[s]?\s*[:-]?/gi, "").trim();
      if (cleanLine.length > 10) {
        projects.push({
          title: cleanLine.split(/[:-]/)[0].trim(),
          description: cleanLine,
          tech: uniqueSkills.slice(0, 3).join(", ")
        });
      }
    });
  }

  if (projects.length === 0) {
    projects.push({
      title: "Interactive Web Portal",
      description: "A client-facing web page developed using modern HTML, CSS, and basic JavaScript components.",
      tech: uniqueSkills.slice(0, 3).join(", ") || "HTML, CSS, JS"
    });
  }

  let score = 50;
  if (uniqueSkills.length > 3) score += 15;
  if (uniqueSkills.length > 6) score += 10;
  if (text.toLowerCase().includes("project")) score += 15;
  if (text.toLowerCase().includes("intern") || text.toLowerCase().includes("experience")) score += 10;
  score = Math.min(score, 95);

  return {
    skills: uniqueSkills,
    projects,
    education,
    experience: text.toLowerCase().includes("intern") ? "Internship Experience (Found)" : "Entry Level / No Internship",
    resumeScore: score,
    skillScore: Math.round(uniqueSkills.length * 10),
    placementReadiness: Math.round(score * 0.95)
  };
}

/**
 * 3-Layer Role-Aware Job Description Analyzer
 */
export function analyzeJobDescription(jdText) {
  const normalizedText = jdText.toLowerCase();

  // Layer 1: Job Title / Role Detection
  const roleKey = normalizeJobTitle(jdText);
  const roleProfile = roleKey ? ROLE_PROFILES[roleKey] : null;

  // Layer 2: Explicit Skills extracted from JD text
  const explicitSkills = extractSkillsFromText(jdText);

  // Layer 3: Role Knowledge Expansion & Combined Requirements
  let requiredSkills = [];
  let roleCategories = null;
  let mandatorySkills = [];
  let commonSkills = [];
  let optionalSkills = [];

  if (roleProfile) {
    mandatorySkills = roleProfile.mandatory;
    commonSkills = roleProfile.common;
    optionalSkills = roleProfile.optional;
    
    // Combine role competencies with explicit requirements (deduplicated)
    const combinedSet = new Set([
      ...roleProfile.mandatory,
      ...roleProfile.common,
      ...explicitSkills
    ]);
    requiredSkills = Array.from(combinedSet);
    roleCategories = roleProfile.categories;
  } else {
    // Unknown Role AI Fallback: parse structured fallback JSON representation
    const fallbackRole = ROLE_PROFILES.FULL_STACK_DEVELOPER;
    mandatorySkills = fallbackRole.mandatory;
    commonSkills = fallbackRole.common;
    optionalSkills = fallbackRole.optional;
    requiredSkills = explicitSkills.length > 0 ? explicitSkills : [...fallbackRole.mandatory, ...fallbackRole.common];
    roleCategories = fallbackRole.categories;
  }

  // Estimate experience requested
  let experience = "Entry Level (0-2 years)";
  const expMatch = jdText.match(/(\d+)\+?\s*years?/i);
  if (expMatch) {
    const years = parseInt(expMatch[1]);
    if (years > 4) experience = "Senior Level (5+ years)";
    else if (years >= 2) experience = "Mid Level (2-4 years)";
  }

  const tools = [];
  if (normalizedText.includes("git") || normalizedText.includes("github")) tools.push("Git", "GitHub");
  if (normalizedText.includes("docker")) tools.push("Docker");
  if (normalizedText.includes("aws") || normalizedText.includes("cloud")) tools.push("AWS");
  if (normalizedText.includes("firebase")) tools.push("Firebase");
  if (tools.length === 0) tools.push("Git", "GitHub");

  return {
    roleTitle: roleProfile ? roleProfile.title : (roleKey ? roleKey : "Full Stack Developer"),
    roleKey: roleKey || "FULL_STACK_DEVELOPER",
    roleCategories,
    requiredSkills,
    explicitSkills,
    mandatorySkills,
    commonSkills,
    optionalSkills,
    experience,
    tools: [...new Set(tools)],
    responsibilities: jdText.length > 50 ? jdText.split("\n").filter(l => l.includes("-") || l.includes("*")).slice(0, 3).map(l => l.replace(/^[-*\s]+/, "")) : ["Build user features and backend services", "Maintain clean code architecture", "Collaborate on database schemas and version control"]
  };
}

/**
 * Weighted Skill Gap Matcher
 */
export function detectSkillGap(studentSkills, jobSkills, jobProfileDetails) {
  const sSkillsNormalized = (studentSkills || []).map(s => s.toLowerCase().trim());
  const reqSkills = Array.isArray(jobSkills) ? jobSkills : [];
  
  const matched = [];
  const missing = [];

  reqSkills.forEach(reqSkill => {
    const reqLower = reqSkill.toLowerCase().trim();
    const isMatched = sSkillsNormalized.some(s => {
      if (s === reqLower) return true;
      if ((s === "react" || s === "react.js") && (reqLower === "react" || reqLower === "react.js")) return true;
      if ((s === "node" || s === "node.js") && (reqLower === "node" || reqLower === "node.js")) return true;
      if ((s === "express" || s === "express.js") && (reqLower === "express" || reqLower === "express.js")) return true;
      if ((s === "git" || s === "github") && (reqLower === "git" || reqLower === "github")) return true;
      return false;
    });

    if (isMatched) {
      matched.push(reqSkill);
    } else {
      missing.push(reqSkill);
    }
  });

  // Calculate Weighted Score if profile details exist
  let matchScore = 0;
  if (jobProfileDetails && jobProfileDetails.mandatorySkills) {
    const { mandatorySkills = [], commonSkills = [], optionalSkills = [] } = jobProfileDetails;
    
    const matchedMandatory = mandatorySkills.filter(m => sSkillsNormalized.some(s => s === m.toLowerCase().trim() || (s.includes("react") && m.toLowerCase().includes("react"))));
    const matchedCommon = commonSkills.filter(c => sSkillsNormalized.some(s => s === c.toLowerCase().trim()));
    const matchedOptional = optionalSkills.filter(o => sSkillsNormalized.some(s => s === o.toLowerCase().trim()));

    const mandatoryWeight = mandatorySkills.length > 0 ? (matchedMandatory.length / mandatorySkills.length) * 70 : 70;
    const commonWeight = commonSkills.length > 0 ? (matchedCommon.length / commonSkills.length) * 20 : 20;
    const optionalWeight = optionalSkills.length > 0 ? (matchedOptional.length / optionalSkills.length) * 10 : 0;

    matchScore = Math.round(mandatoryWeight + commonWeight + optionalWeight);
  } else {
    const matchRatio = reqSkills.length > 0 ? matched.length / reqSkills.length : 1;
    matchScore = Math.round(matchRatio * 100);
  }

  matchScore = Math.max(15, Math.min(100, matchScore));

  return {
    matchScore,
    matchedSkills: [...new Set(matched)],
    missingSkills: [...new Set(missing)]
  };
}

/**
 * Generates personalized learning roadmap based on missing skills and role context
 */
export function generateRoadmap(missingSkills, targetRole = "Frontend Developer", userSkills = []) {
  const userSkillsNormalized = (userSkills || []).map(s => s.toLowerCase().trim());
  
  // Filter out any skills the user already knows
  const actualGaps = (missingSkills || []).filter(skill => {
    const lower = skill.toLowerCase().trim();
    return !userSkillsNormalized.some(u => u === lower || (u.includes("react") && lower.includes("react")) || (u.includes("node") && lower.includes("node")));
  });

  if (actualGaps.length === 0) {
    return [
      {
        id: "roadmap-mastery-1",
        skillName: "Advanced Architecture",
        level: "Advanced",
        week: "Week 1",
        title: `${targetRole}: Advanced Specialization & Master Class`,
        topics: ["System Design Architecture", "Design Patterns & Microservices", "CI/CD & Cloud Infrastructure", "Performance Auditing & Security Hardening"],
        practiceTasks: ["Design scalable load-balanced architecture diagram", "Implement automated GitHub Actions CI/CD pipeline"],
        recommendedProject: `Enterprise ${targetRole} Production Suite`,
        resources: [{ name: "System Design Primer", provider: "GitHub", link: "https://github.com/donnemartin/system-design-primer" }]
      }
    ];
  }

  const roadmap = [];
  const levels = ["Beginner", "Intermediate", "Advanced"];

  actualGaps.forEach((skill) => {
    const normalizedName = normalizeSkill(skill);
    const skillData = SKILL_LIBRARY[normalizedName];
    
    if (skillData && skillData.weeks) {
      skillData.weeks.forEach((w, wIdx) => {
        const currentLevel = levels[Math.min(wIdx, levels.length - 1)];
        roadmap.push({
          id: `roadmap-${skill}-${wIdx}`,
          week: `Week ${roadmap.length + 1}`,
          skillName: skill,
          level: currentLevel,
          title: `${skill} (${currentLevel}): ${w.title}`,
          topics: w.topics,
          practiceTasks: [
            `Implement hands-on ${skill} code exercise for ${w.topics[0] || 'core concepts'}`,
            `Build modular ${skill} helper utility covering ${w.topics[1] || 'state & logic'}`
          ],
          recommendedProject: `Build a production-grade ${skill} ${currentLevel} micro-project with automated tests`,
          resources: skillData.courses ? skillData.courses.slice(0, 2) : [{ name: `Learn ${skill}`, provider: "Docs", link: `https://react.dev` }]
        });
      });
    } else {
      roadmap.push({
        id: `roadmap-${skill}-generic-1`,
        week: `Week ${roadmap.length + 1}`,
        skillName: skill,
        level: "Beginner",
        title: `${skill} (Beginner): Core Syntax & Principles for ${targetRole}`,
        topics: [`Core ${skill} principles and syntax`, `Building real-world features using ${skill}`, `Integration & state management`],
        practiceTasks: [`Create a minimal ${skill} starter boilerplate`, `Connect ${skill} logic with REST API endpoint`],
        recommendedProject: `Build a clean ${skill} micro-service project`,
        resources: [{ name: `Learn ${skill}`, provider: "Docs", link: `https://www.google.com/search?q=learn+${encodeURIComponent(skill)}` }]
      });

      roadmap.push({
        id: `roadmap-${skill}-generic-2`,
        week: `Week ${roadmap.length + 1}`,
        skillName: skill,
        level: "Intermediate",
        title: `${skill} (Intermediate): Production Patterns & Error Handling`,
        topics: [`Advanced ${skill} architectural patterns`, `Asynchronous operations & error propagation`, `Testing & deployment optimization`],
        practiceTasks: [`Write automated test suites for ${skill} handlers`, `Deploy ${skill} application to cloud sandbox`],
        recommendedProject: `Full ${skill} integration micro-project with CI/CD`,
        resources: [{ name: `${skill} Best Practices`, provider: "Developer Portal", link: `https://dev.to/search?q=${encodeURIComponent(skill)}` }]
      });
    }
  });

  return roadmap.slice(0, 6);
}

/**
 * Simulates the AI Chatbot response for any general question and user's chosen role
 */
export function generateMentorResponse(history, query, context = {}) {
  const q = (query || "").toLowerCase().trim();
  const targetRole = context?.targetRole || context?.careerGoal || "Full Stack AI Engineer";
  const candidateName = context?.candidateName || context?.name || "Developer";
  const skillsStr = Array.isArray(context?.skills) 
    ? context.skills.join(', ') 
    : (typeof context?.skills === 'string' ? context.skills : "HTML, CSS, JavaScript, React, Node.js");
  const missingStr = Array.isArray(context?.missingSkills) 
    ? context.missingSkills.join(', ') 
    : (typeof context?.missingSkills === 'string' ? context.missingSkills : "Docker, AWS, System Design, Vector Databases");

  // 1. Math & Calculation Evaluator
  const mathMatch = q.match(/(?:what\s+is\s+|calculate\s+|solve\s+)?(\d+(?:\.\d+)?)\s*([\+\-\*\/xX\^])\s*(\d+(?:\.\d+)?)/);
  if (mathMatch) {
    const n1 = parseFloat(mathMatch[1]);
    const op = mathMatch[2].toLowerCase();
    const n2 = parseFloat(mathMatch[3]);
    let result = 0;
    let opSymbol = op;
    if (op === '+') result = n1 + n2;
    else if (op === '-') result = n1 - n2;
    else if (op === '*' || op === 'x') { result = n1 * n2; opSymbol = '×'; }
    else if (op === '/') { result = n2 !== 0 ? (n1 / n2) : 'Undefined (division by zero)'; opSymbol = '÷'; }
    else if (op === '^') { result = Math.pow(n1, n2); opSymbol = '^'; }

    return `### 🧮 Math Calculation Result

**Expression:** \`${n1} ${opSymbol} ${n2}\`  
**Calculated Result:** **\`${result}\`**

#### Step-by-Step Breakdown:
1. **Operator Identified**: Arithmetic operation (\`${opSymbol}\`).
2. **Operands**: First operand = \`${n1}\`, Second operand = \`${n2}\`.
3. **Execution**: Evaluated \`${n1} ${opSymbol} ${n2}\` to yield **\`${result}\`**.

*Need another calculation, algorithm complexity formula, or mathematical proof? Just ask!*`;
  }

  // 2. User Chosen Role Queries
  const isRoleQuery = 
    q.includes("my chosen role") || 
    q.includes("my role") || 
    q.includes("what is my role") || 
    q.includes("tell me about my role") || 
    q.includes("chosen role") || 
    q.includes("target role") || 
    q.includes("full stack ai engineer") || 
    q.includes("career goal") ||
    (q.includes("become") && (q.includes("role") || q.includes("engineer") || q.includes("developer"))) ||
    (q.includes("skills") && q.includes("for") && (q.includes("role") || q.includes("my")));

  if (isRoleQuery) {
    return `### 🚀 Role Overview & Roadmap: ${targetRole}

Hello **${candidateName}**! You are calibrated for the high-impact role of **${targetRole}**.

#### 1. Core Industry Definition & Responsibilities
A **${targetRole}** combines modern full-stack web architectures with machine learning models and intelligent workflows:
- **Architecture & System Design**: Building performant, responsive UIs with modern frameworks (React/Next.js) coupled with robust, scalable backend APIs (Node.js/Express or Python/FastAPI).
- **AI & LLM Integration**: Incorporating Large Language Models, embeddings, vector databases (Chroma, Pinecone, pgvector), and streaming inference pipelines into enterprise products.
- **Data Engineering & Retrieval**: Building Retrieval-Augmented Generation (RAG) pipelines, semantic search, and prompt engineering orchestration.
- **Deployment & Cloud Infrastructure**: Containerizing services with Docker, deploying to AWS or GCP, and setting up automated CI/CD workflows.

#### 2. Your Active Skills Calibration
- **Verified Strengths**: ${skillsStr}
- **High-Priority Target Growth Areas**: ${missingStr}

#### 3. Recommended Next Milestones
1. **Milestone 1 (API & Data Mastery)**: Solidify backend patterns, database connection pooling, and REST API best practices.
2. **Milestone 2 (AI Integration)**: Build an interactive application featuring streaming LLM responses, vector search, and token usage optimization.
3. **Milestone 3 (Production Capstone)**: Deploy a containerized full-stack AI application with monitoring, rate limiting, and comprehensive test suites.

*Would you like a specialized mock interview, system architecture diagram, or sample code for your journey as a ${targetRole}?*`;
  }

  // 3. General Writing / Professional Emails
  if (q.includes("email") && (q.includes("sick") || q.includes("leave") || q.includes("pto") || q.includes("vacation") || q.includes("unwell"))) {
    return `### ✉️ Professional Leave Request Email Template

**Subject:** Leave of Absence Request - ${candidateName} - [Dates]

Dear [Manager's Name],

I am writing to formally request leave due to feeling unwell and requiring rest to recover. I anticipate being away from work for two days starting [Start Date] through [End Date].

During this period:
- I have ensured that current urgent tasks are documented and handed off to [Colleague's Name].
- I will check urgent communications once I have sufficiently recovered.

Thank you for your understanding and support.

Best regards,  
**${candidateName}**  
${targetRole}`;
  }

  // 4. General Science & Physics Concepts
  if (q.includes("photosynthesis") || q.includes("chlorophyll")) {
    return `### 🌿 How Photosynthesis Works

**Photosynthesis** is the biological process by which green plants, algae, and cyanobacteria convert light energy into chemical energy stored in glucose carbohydrates.

#### The Fundamental Chemical Equation:
$$\\text{6CO}_2 + \\text{6H}_2\\text{O} + \\text{Sunlight (Photons)} \\longrightarrow \\text{C}_6\\text{H}_{12}\\text{O}_6 + \\text{6O}_2$$

#### The Two Main Stages:
1. **Light-Dependent Reactions (Occur in Thylakoid Membranes)**:
   - Chlorophyll pigments absorb sunlight energy, exciting electrons.
   - Water molecules ($\\text{H}_2\\text{O}$) are split (photolysis), releasing oxygen ($\\text{O}_2$) as a byproduct.
   - Produces energy carriers **ATP** and **NADPH**.
2. **Light-Independent Reactions / Calvin Cycle (Occur in the Stroma)**:
   - Takes carbon dioxide ($\\text{CO}_2$) from the atmosphere.
   - Utilizes ATP and NADPH from the light reactions to convert $\\text{CO}_2$ into high-energy glucose ($\\text{C}_6\\text{H}_{12}\\text{O}_6$).

#### Ecological Importance:
- Produces nearly all the breathable oxygen in Earth's atmosphere.
- Serves as the primary energy source at the foundation of all terrestrial food chains.`;
  }

  if (q.includes("gravity") || q.includes("gravitation")) {
    return `### 🌌 What is Gravity and How Does It Work?

**Gravity** is one of the four fundamental interactions in nature (alongside electromagnetism, strong nuclear, and weak nuclear forces).

#### 1. Classical Newtonian Physics
Sir Isaac Newton described gravity as an attractive force acting directly between any two objects with mass:
$$F = G \\frac{m_1 \\cdot m_2}{r^2}$$
- Where $G$ is the gravitational constant, $m_1$ and $m_2$ are masses, and $r$ is the separation distance.

#### 2. Einstein's General Relativity
In 1915, Albert Einstein revolutionized our understanding: gravity is **not** an invisible pulling force, but rather the **curvature of four-dimensional spacetime** caused by mass and energy.
- Massive objects like Earth or the Sun warp the fabric of spacetime around them.
- Satellites, planets, and light beams naturally travel along straight paths (geodesics) through this curved geometry.

#### Everyday & Astronomical Phenomena:
- **Tides**: Created by the gravitational pull gradient between the Moon, Sun, and Earth's oceans.
- **Planetary Orbits**: Keeps celestial bodies in stable orbits.
- **Gravitational Time Dilation**: Clocks closer to strong gravitational fields run measurably slower than clocks in deep space!`;
  }

  // 5. Recursion & Core Algorithms
  if (q.includes("recursion") || q.includes("recursive")) {
    return `### 🔄 Understanding Recursion in Computer Science

**Recursion** is a programming technique where a function solves a problem by calling itself with smaller subsets of the same problem.

#### The 2 Mandatory Components:
1. **Base Case**: The condition under which the function terminates and returns a result without making further recursive calls. Prevents infinite recursion and call stack overflow!
2. **Recursive Case**: The logic that reduces the problem size and calls itself, pushing a new frame onto the **Call Stack**.

\`\`\`javascript
// Classic recursive example: Factorial (n!)
function factorial(n) {
  // 1. Base case: 0! = 1, 1! = 1
  if (n <= 1) return 1;

  // 2. Recursive case: calls itself with n - 1
  return n * factorial(n - 1);
}

console.log(factorial(5)); // Output: 120 (5 * 4 * 3 * 2 * 1)
\`\`\`

#### How the Call Stack Unwinds:
1. \`factorial(3)\` pauses and calls \`factorial(2)\`
2. \`factorial(2)\` pauses and calls \`factorial(1)\`
3. \`factorial(1)\` hits the base case and returns \`1\`
4. \`factorial(2)\` evaluates \`2 * 1 = 2\` and returns
5. \`factorial(3)\` evaluates \`3 * 2 = 6\` and returns

*Pro Tip for ${targetRole}:* Use recursion for tree traversals (DOM, AST, JSON), divide-and-conquer algorithms (Merge Sort), and graph DFS. Watch out for call stack depth limits!`;
  }

  // 6. Neural Networks & Deep Learning
  if (
    q.includes("neural network") || 
    q.includes("neural networks") || 
    q.includes("deep learning") || 
    q.includes("how neural networks learn") || 
    (q.includes("machine learning") && (q.includes("learn") || q.includes("work") || q.includes("concept"))) ||
    q.includes("backpropagation") ||
    q.includes("weights and biases")
  ) {
    return `### 🧠 How Neural Networks Learn (In Simple Terms)

At its foundation, a **neural network** learns through a continuous loop of **"Guess, Check, and Adjust"**—very similar to a human learning a musical instrument or throwing darts blindfolded.

---

#### 1. The Core Architecture
A neural network consists of layers of interconnected mathematical nodes (neurons):
- **Input Layer**: Takes raw features (e.g., pixel intensities of an image, word embeddings, or sensor metrics).
- **Hidden Layers**: Transform representations using **weights** (importance of connections) and **biases** (thresholds).
- **Output Layer**: Delivers the final prediction (e.g., identifying a handwritten digit with confidence scores).

---

#### 2. The 3-Step Learning Cycle

1. **Step 1: Forward Pass (The Guess)**
   - Input numbers flow forward through the network.
   - Each connection multiplies the input by a numerical **weight** ($W$) and adds a **bias** ($b$).
   - An **Activation Function** (like ReLU or Sigmoid) introduces non-linearity, allowing the network to capture complex, non-linear relationships.
   - The output layer produces an initial prediction.

2. **Step 2: The Loss Function (Checking the Error)**
   - The network compares its guess to the known ground-truth answer.
   - The **Loss Function** (e.g., Mean Squared Error or Cross-Entropy) computes a single number: *how wrong was the guess?*

3. **Step 3: Backpropagation & Optimization (Adjusting the Knobs)**
   - Using calculus (the chain rule), the algorithm traces backward from the output layer to the input.
   - It calculates how much each individual weight contributed to the overall error.
   - The **Optimizer** (e.g., Gradient Descent or Adam) nudges each weight slightly in the direction that reduces the error.

---

#### 3. Mental Model: Tuning a Radio
Imagine a control panel with thousands of dials. At first, the dials are randomly set (producing static noise). Every time the network hears a sound, it slightly twists dials toward clearer reception. Repeat this over millions of examples, and the dials self-organize to produce crystal-clear sound!

---

💡 **Relevance for Modern Web & ${targetRole}:**
Foundation models (like Gemini) use billions of these learned parameters. As a **${targetRole}**, understanding this empowers you to effectively design client-side inference (ONNX.js, TensorFlow.js), streaming token UIs, vector embeddings, and RAG pipelines!`;
  }

  let response = "";
  
  if (q.includes("python")) {
    response = `### Python Core Concepts & Best Practices 🐍

Python is renowned for its readability, expressive syntax, and rich ecosystem across backend development, data engineering, and machine learning.

#### 1. Fundamental Mastery
- **Data Structures**: Lists, Tuples, Dictionaries, Sets, and Collections (\`defaultdict\`, \`Counter\`, \`deque\`).
- **Idiomatic Python**: List/Dict comprehensions, Generators (\`yield\`), Decorators, and Context Managers (\`with\`).
- **Object-Oriented & Functional**: Dunder methods (\`__init__\`, \`__str__\`, \`__repr__\`), Lambda expressions, \`map\`/\`filter\`.

#### 2. Key Frameworks & Ecosystem
- **FastAPI**: Modern, high-performance async REST APIs with automatic OpenAPI/Swagger documentation.
- **Django**: Full-featured framework with built-in ORM, admin dashboard, and user authentication.
- **Data & AI**: Pandas, NumPy, Scikit-Learn, PyTorch.

#### 3. Recommended Project
Build a **RESTful microservice with FastAPI and Docker** that handles async tasks (e.g., background PDF generation or data scraping).`;
  }
  else if (q.includes("javascript") || q.includes("js ") || q.endsWith("js") || q.includes("event loop") || q.includes("closure") || q.includes("promise")) {
    response = `### Modern JavaScript Deep-Dive ⚡

JavaScript drives both client-side rendering and asynchronous server-side execution.

#### 1. Core Mechanics
- **Event Loop**: Synchronous code runs on the Call Stack. Microtasks (Promises, \`queueMicrotask\`) resolve before macrotasks (\`setTimeout\`, \`setInterval\`, I/O).
- **Closures**: Functions retain lexical environment references even after their outer functions have returned.
- **Prototypes & Inheritance**: JavaScript uses prototypical inheritance under the syntactic sugar of ES6 \`class\`.

#### 2. Modern ES6+ Standards
- Async/Await with robust \`try...catch\` blocks.
- Destructuring, Rest/Spread operators (\`...\`).
- Optional Chaining (\`?.\`) & Nullish Coalescing (\`??\`).
- Array methods: \`.map()\`, \`.filter()\`, \`.reduce()\`, \`.flatMap()\`.

#### 3. Top Interview Focus
Be ready to explain hoisting, the difference between \`var\` / \`let\` / \`const\`, and implement a custom \`debounce\` or \`throttle\` utility from scratch!`;
  }
  else if (q.includes("react") || q.includes("hook") || q.includes("state") || q.includes("redux") || q.includes("virtual dom")) {
    response = `### React.js Architecture & Patterns ⚛️

React enables declarative, component-based UI engineering with optimal DOM re-renders.

#### 1. Core Principles
- **Virtual DOM & Reconciliation**: React uses an in-memory Virtual DOM tree and the Fiber algorithm to compute minimal diffs and patch the real DOM.
- **Unidirectional Data Flow**: Data flows down via props; state changes trigger deterministic re-renders.

#### 2. Essential React Hooks
- \`useState\` & \`useReducer\`: Component state management.
- \`useEffect\`: Side-effects, lifecycle synchronization, and event listener cleanups.
- \`useMemo\` & \`useCallback\`: Memoizing expensive computations and stable function references.
- \`useRef\`: Direct DOM manipulation or mutable values that don't trigger re-renders.

#### 3. State Management
- Local: Built-in hooks.
- Global / Complex: Zustand, Redux Toolkit, or React Context for lighter trees.`;
  }
  else if (q.includes("docker") || q.includes("container") || q.includes("kubernetes") || q.includes("devops") || q.includes("ci/cd")) {
    response = `### Docker & Containerization Essentials 🐳

Docker packages software into standardized units for consistent development, testing, and production deployments.

#### 1. Core Concepts
- **Dockerfile**: Declarative recipe instructions to build an image.
- **Image**: An immutable, layered snapshot of application code and OS binaries.
- **Container**: An isolated, runnable instance of a container image.
- **Volumes**: Persistent storage decoupled from container lifecycles.

#### 2. Best Practices
- **Multi-Stage Builds**: Drastically reduce image size by separating the build environment from the minimal runtime image (e.g. \`alpine\` or distroless).
- **Docker Compose**: Orchestrate multi-container environments (Frontend + Backend + Redis + Postgres) with a single \`docker-compose.yml\`.
- **Environment Variables**: Never hardcode secrets in images—inject them at runtime.`;
  }
  else if (q.includes("database") || q.includes("sql") || q.includes("nosql") || q.includes("mongo") || q.includes("postgres")) {
    response = `### Database Systems: SQL vs. NoSQL 🗄️

Choosing the right database architecture is critical for data integrity, latency, and system scaling.

#### 1. Relational / SQL (PostgreSQL, MySQL)
- **Strengths**: Strict schemas, ACID transactions, complex relational JOIN queries, strong consistency.
- **Best For**: Financial ledgers, e-commerce orders, relational business entities.

#### 2. Document / NoSQL (MongoDB, DynamoDB)
- **Strengths**: Flexible JSON-like document models, rapid prototyping, horizontal sharding.
- **Best For**: User catalogs, content management, real-time logging/events.

#### 3. Performance Optimization Tips
- Add B-Tree indexes to columns used in \`WHERE\` and \`JOIN\` clauses.
- Analyze query execution plans using \`EXPLAIN ANALYZE\`.
- Use connection pooling and read replicas to scale read-heavy traffic.`;
  }
  else if (q.includes("dsa") || q.includes("data structure") || q.includes("algorithm") || q.includes("leetcode") || q.includes("binary tree")) {
    response = `### Data Structures & Algorithms (DSA) Strategy 🧠

Mastering DSA requires focusing on recurring algorithmic patterns rather than memorizing individual problems.

#### 1. Core High-Yield Patterns
- **Arrays & Strings**: Two Pointers, Sliding Window, Prefix Sums, HashMaps.
- **Linked Lists & Stacks**: Fast & Slow pointers (cycle detection), Monotonic Stack.
- **Trees & Graphs**: BFS (Level-order / Shortest path in unweighted graphs), DFS, Topological Sort.
- **Dynamic Programming**: Subproblem identification, Top-Down Memoization, Bottom-Up Tabulation.

#### 2. Suggested Practice Routine
1. Complete 150 curated LeetCode/NeetCode problems (Easy: 40%, Medium: 50%, Hard: 10%).
2. Always analyze Time & Space complexity in Big-O notation.
3. Practice writing clean, edge-case-handled code on a whiteboard or blank editor.`;
  }
  else if (q.includes("system design") || q.includes("scalability") || q.includes("microservice") || q.includes("load balancer")) {
    response = `### System Design Fundamentals 🏗️

Designing scalable distributed architectures:

1. **Load Balancing**: Distribute ingress requests using NGINX, HAProxy, or AWS ALB.
2. **Caching Strategy**: Redis/Memcached at application and database layers (Cache-Aside, Write-Through).
3. **Database Scaling**: Read Replicas, Database Sharding, Connection Pooling.
4. **Asynchronous Messaging**: Kafka or RabbitMQ to decouple services and buffer traffic spikes.
5. **Resilience**: Rate Limiting, Circuit Breakers, CDN caching (Cloudflare/CloudFront).`;
  }
  else if (q.includes("resume") || q.includes("ats") || q.includes("cv")) {
    response = `### Resume & ATS Optimization Guide 📄

1. **Use the Google X-Y-Z Formula**: "Accomplished [X] as measured by [Y], by doing [Z]". (e.g. *Optimized API latency by 35% by implementing Redis caching and indexing database queries*).
2. **Keywords & Skills**: Ensure high-priority technologies from the job description appear naturally in your Skills and Experience sections.
3. **Clean Layout**: Single column, standard fonts, no complex multi-column tables or icons that confuse ATS parsers.
4. **Links**: Include clickable links to your GitHub profile, LinkedIn, and live deployed project demos!`;
  }
  else if (q.includes("full stack") || q.includes("full-stack")) {
    response = `### How to Become a Full-Stack Developer 🚀

Becoming a Full-Stack Developer requires understanding both client-facing frontend technologies and server-side backend logic.

#### 1. Recommended Tech Stack
- **Frontend**: HTML, CSS, JavaScript (ES6+), and **React.js**.
- **Backend**: **Node.js** with the **Express.js** framework.
- **Database**: **MongoDB** (NoSQL document base) or **PostgreSQL** (SQL relational base).
- **Tools**: **Git/GitHub** for versioning, **Vercel** & **Render** for deployments.

#### 2. Project Path
- **Level 1 (Easy)**: Build a **Weather App** (API fetching) or **Personal Expense Tracker**.
- **Level 2 (Medium)**: Build a **Real-Time Task Manager** using WebSockets (Socket.io) and Express.
- **Level 3 (Hard)**: Build a **Multi-vendor E-Commerce website** with user auth, cart management, and payment sandbox.

#### 3. Average Salary Insights
- **Entry Level (Fresher)**: ₹4.5L - ₹7.5L per annum.
- **Mid-Level (2-5 years)**: ₹8.0L - ₹15.0L per annum.
- **Senior-Level (5+ years)**: ₹16.0L - ₹30.0L+ per annum.

#### 4. Top Interview Tip
Be prepared to explain the complete **request-response cycle**—from typing a URL in the browser, DNS lookup, server routing in Express, database fetching in Mongo, to rendering components in React!`;
  } 
  else if (q.includes("frontend") || q.includes("front end")) {
    response = `### Mastering Frontend Development 🎨

Frontend development revolves around building rich user experiences and responsive layouts.

#### 1. Core Learning Path
1. **JavaScript Fundamentals**: Scope, Closures, Promises, Async/Await, Array Methods.
2. **React.js Mastery**: Component lifecycles, state vs props, Hooks (\`useState\`, \`useEffect\`, \`useMemo\`).
3. **Tailwind CSS**: Utility-first styling, grid layouts, fluid typography.
4. **Performance**: Asset optimization, code splitting, lazy loading, and Core Web Vitals.

#### 2. Essential Courses & Practice
- Build clean, accessible UI components with Tailwind CSS.
- Master responsive design, CSS Grid/Flexbox, and Core Web Vitals optimization.`;
  } 
  else if (q.includes("backend") || q.includes("back end")) {
    response = `### Exploring Backend Development ⚙️

Backend development is about logic execution, server management, data schemas, and API scaling.

#### 1. Core Learning Path
1. **Server scripting**: Node.js or Python.
2. **REST API Design**: HTTP status codes, headers, parameter types, request body parsing.
3. **Database Architecture**: SQL indexing, table relations vs NoSQL document embedding.
4. **Security**: Password hashing (bcrypt), session tokens (JWT), CORS headers, rate limiting.

#### 2. Projects to Build
- **User Authentication Server**: Signup/Login with password encrypting and auth middleware.
- **Blogging API**: Complete CRUD routes with relational author tags.
- **Chat Server**: Socket.io message broadcasting.`;
  }
  else if (q.includes("interview") || q.includes("placement") || q.includes("prepare")) {
    response = `### Placement & Interview Preparation Guide 💼

To clear campus placements or off-campus interviews, follow this structured plan:

#### 1. Placement Checklist
- **DS & Algo (DSA)**: Solve at least 150+ problems on Leetcode/GeeksforGeeks. Focus on Arrays, HashMaps, Strings, Binary Search, and Two Pointers.
- **CS Core Subjects**: Revise Operating Systems (OS), Database Management Systems (DBMS), and Computer Networks (CN).
- **Core Projects**: Be ready to explain your projects using the **STAR Method** (Situation, Task, Action, Result).
- **Behavioral Questions**: Prepare responses for common HR questions like "Tell me about a conflict," "Your weakness," etc.

#### 2. The Mock Interview Module
I recommend utilizing our **Mock Interview** tab on the sidebar. Select your track (Frontend/Backend/HR) and practice answering technical and behavioral questions with instant feedback!`;
  }
  else if (q.includes("project") || q.includes("recommend")) {
    response = `### AI Project Recommendations 🛠️

Project work is the best way to prove you have practical skills to recruiters. Here are projects that will make your resume stand out:

1. **Skill gap analyzer (Like SKILL BRIDGE AI!)**
   - *Tech*: React, Tailwind, Gemini API, Node.js.
   - *Why*: Shows you can integrate modern LLMs, handle file data, and design dashboards.

2. **Real-time Collaboration Kanban Board**
   - *Tech*: React, Socket.io, Node.js, Express.
   - *Why*: Demonstrates understanding of WebSockets and real-time frontend states.

3. **E-Commerce API with Stripe Payments**
   - *Tech*: Node.js, Express, MongoDB, Stripe SDK.
   - *Why*: Proves backend transaction control, payment flows, and data security.

*Tip: Check the **Project recommendations** page in the dashboard sidebar for step-by-step instructions on building these!*`;
  }
  else if (
    q.includes("flexbox") || 
    q.includes("css grid") || 
    q.includes("grid vs flexbox") || 
    q.includes("flexbox vs grid") || 
    (q.includes("css") && (q.includes("layout") || q.includes("center") || q.includes("responsive") || q.includes("vs") || q.includes("difference")))
  ) {
    response = `### 🎨 CSS Flexbox vs. CSS Grid: Complete Guide

Both **Flexbox** and **CSS Grid** are modern CSS layout systems, but they solve different architectural problems.

---

#### 1. Core Difference: 1D vs. 2D
| Feature | Flexbox (1-Dimensional) | CSS Grid (2-Dimensional) |
| :--- | :--- | :--- |
| **Primary Dimension** | Row **OR** Column at a time (1D) | Rows **AND** Columns simultaneously (2D) |
| **Design Approach** | Content-first (items dictate size) | Layout-first (container dictates grid tracks) |
| **Ideal For** | Navbars, button groups, card lists | Full-page layouts, photo galleries, dashboards |

---

#### 2. Practical Syntax Comparison

\`\`\`css
/* Flexbox: Centering & linear alignment */
.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

/* CSS Grid: Responsive dashboard grid without media queries */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}
\`\`\`

---

#### 3. Golden Rule of Thumb
- Use **Flexbox** inside components (e.g., aligning an avatar next to a user's name and badge).
- Use **Grid** for the overarching page structure (e.g., sidebar + main header + content grid).`;
  }
  else if (
    q.includes("graphql") || 
    q.includes("rest api") || 
    q.includes("rest vs") || 
    (q.includes("api") && (q.includes("difference") || q.includes("endpoints") || q.includes("how it works") || q.includes("what is") || q.includes("vs")))
  ) {
    response = `### 🌐 REST API vs. GraphQL: Architectural Comparison

Both REST and GraphQL allow clients to communicate with servers over HTTP, but their data retrieval paradigms differ fundamentally.

---

#### 1. Core Paradigm Comparison
- **REST (Representational State Transfer)**:
  - Architecture centered around **Endpoints** (URIs) representing resources (e.g., \`GET /api/users/123\`, \`GET /api/users/123/posts\`).
  - Often leads to **over-fetching** (getting 50 fields when you only need the username) or **under-fetching** (requiring multiple waterfall round-trips to fetch related data).
- **GraphQL**:
  - Architecture centered around a **single endpoint** (\`/graphql\`) backed by a strongly typed schema.
  - The client specifies the exact shape of the response needed in a declarative query document. Zero over-fetching or under-fetching.

---

#### 2. Code Example

\`\`\`graphql
# GraphQL Query: Fetch user name and recent post titles in ONE request
query GetUserProfile {
  user(id: "123") {
    name
    email
    posts(limit: 3) {
      id
      title
    }
  }
}
\`\`\`

---

#### 3. When to Choose Which
- **Choose REST** for public APIs, straightforward CRUD services, file streaming, and when you want standard HTTP-level caching (via CDN/Etags).
- **Choose GraphQL** for complex frontend applications, mobile apps with bandwidth constraints, and unified data aggregation layers across multiple microservices.`;
  }
  else if (
    q.includes("git") && 
    (q.includes("merge") || q.includes("rebase") || q.includes("conflict") || q.includes("branch") || q.includes("workflow") || q.includes("commit"))
  ) {
    response = `### 🔀 Git Mastery: Merge vs. Rebase & Clean Workflows

Version control with Git is a mandatory core competency for professional engineering teams.

---

#### 1. \`git merge\` vs. \`git rebase\`
- **\`git merge\`**:
  - Preserves complete chronological history.
  - Creates a dedicated "merge commit" combining two branch histories.
  - Non-destructive and safe for shared public branches (\`main\`, \`develop\`).
- **\`git rebase\`**:
  - Rewrites project history by replaying your branch commits on top of the target base branch.
  - Results in a perfectly clean, linear commit log.
  - *Golden Rule:* Never rebase public commits that other teammates have already pulled!

---

#### 2. Professional Command Sequence
\`\`\`bash
# Keep your feature branch up-to-date cleanly
git checkout feature/awesome-ui
git fetch origin
git rebase origin/main

# If conflicts occur, inspect, resolve files, and continue:
git add .
git rebase --continue
\`\`\`

---

💡 **Pro Tip for ${targetRole}:** Always write conventional commit messages (\`feat:\`, \`fix:\`, \`refactor:\`, \`docs:\`) to keep automated changelog generation and CI/CD pipelines smooth!`;
  }
  else {
    response = `### 💡 Comprehensive Technical Analysis: "${query}"

Hello **${candidateName}**! Here is an in-depth breakdown of **${query}** calibrated for your path as a **${targetRole}**:

---

#### 1. Conceptual Foundation
Understanding the architecture and core design of this topic requires focusing on three fundamental pillars:
- **Core Principle**: Breaking down the primary abstraction, operational lifecycle, and data flow.
- **Modern Standards**: Adhering to idiomatic best practices, modular separation of concerns, and clean architectural boundaries.
- **Performance & Scalability**: Ensuring resilient edge-case handling, error boundaries, and low-latency execution.

---

#### 2. Practical Implementation Pattern
When integrating solutions around this concept into real-world codebases:
1. **Identify the Core Invariants**: Determine inputs, deterministic outputs, and error states.
2. **Implement Automated Tests**: Validate logic with unit tests (using Vitest or Jest) to guarantee regression safety.
3. **Optimize the Hot Path**: Benchmark memory allocation and asynchronous event handling.

---

#### 3. Alignment with Your Chosen Role (${targetRole})
- **Current Strengths to Leverage**: Build upon your background in **${skillsStr}**.
- **Strategic Growth Bridge**: Connecting this subject with **${missingStr}** will make your profile stand out to technical interviewers and hiring managers.

Feel free to ask for concrete code implementations, step-by-step mathematical proofs, or architecture diagrams on this topic!`;
  }

  return response;
}

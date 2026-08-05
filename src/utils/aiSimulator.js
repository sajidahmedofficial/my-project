import { SKILL_LIBRARY, MOCK_INTERVIEWS } from './mockData';

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
  if (s === "react" || s === "react.js" || s === "reactjs") return "React";
  if (s === "node" || s === "node.js" || s === "nodejs") return "Node.js";
  if (s === "express" || s === "express.js" || s === "expressjs") return "Express.js";
  if (s === "mongodb" || s === "mongo") return "MongoDB";
  if (s === "sql" || s === "mysql" || s === "postgresql" || s === "postgres") return "SQL";
  if (s === "git" || s === "github" || s === "gitlab") return "Git";
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
export function generateRoadmap(missingSkills, targetRole = "Full Stack Developer", userSkills = []) {
  const userSkillsNormalized = (userSkills || []).map(s => s.toLowerCase().trim());
  
  // Filter out any skills the user already knows (preventing starting from HTML/CSS if user has them)
  const actualGaps = (missingSkills || []).filter(skill => {
    const lower = skill.toLowerCase().trim();
    return !userSkillsNormalized.some(u => u === lower || (u.includes("react") && lower.includes("react")) || (u.includes("node") && lower.includes("node")));
  });

  if (actualGaps.length === 0) {
    return [
      {
        week: "Week 1",
        title: `${targetRole}: Advanced Specialization`,
        topics: ["System Design Architecture", "Design Patterns & Microservices", "CI/CD & Cloud Infrastructure"],
        resources: [{ name: "System Design Primer", provider: "GitHub", link: "https://github.com/donnemartin/system-design-primer" }]
      }
    ];
  }

  const roadmap = [];
  
  actualGaps.forEach((skill, _index) => {
    const normalizedName = normalizeSkill(skill);
    const skillData = SKILL_LIBRARY[normalizedName];
    
    if (skillData) {
      skillData.weeks.forEach((w, wIdx) => {
        roadmap.push({
          id: `roadmap-${skill}-${wIdx}`,
          week: `Week ${roadmap.length + 1}`,
          skillName: skill,
          title: `${skill}: ${w.title}`,
          topics: w.topics,
          resources: skillData.courses.slice(0, 2)
        });
      });
    } else {
      roadmap.push({
        id: `roadmap-${skill}-generic-1`,
        week: `Week ${roadmap.length + 1}`,
        skillName: skill,
        title: `${skill} Mastery for ${targetRole}`,
        topics: [`Core ${skill} principles and syntax`, `Building real-world features using ${skill}`, `Integration, error handling & deployment`],
        resources: [{ name: `Learn ${skill}`, provider: "Docs", link: `https://www.google.com/search?q=learn+${encodeURIComponent(skill)}` }]
      });
    }
  });

  return roadmap.slice(0, 6);
}

/**
 * Simulates the AI Career Mentor Chatbot response
 */
export function generateMentorResponse(history, query) {
  const q = query.toLowerCase();
  
  let response = "";
  
  if (q.includes("full stack") || q.includes("full-stack")) {
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

#### 3. Average Salary Insights (India)
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

#### 2. Salary Insights
- **Fresher**: ₹3.5L - ₹6.0L per annum.
- **Mid-level**: ₹7.0L - ₹12.0L per annum.

#### 3. Essential Courses
- **Scrimba's Free React Course** (Highly interactive)
- **Javascript.info** (Deep reference manual)
- **Frontend Masters** (Advanced concepts)`;
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
- **Chat Server**: Socket.io message broadcasting.

#### 3. Salary Insights
- **Fresher**: ₹4.0L - ₹7.0L per annum.
- **Mid-level**: ₹8.0L - ₹14.0L per annum.`;
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

1. **AI-Powered Skill gap analyzer (Like SkillBridge!)**
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
  else {
    response = `Hi there! I am your **AI Career Mentor** at SkillBridge. 💡

I can help you navigate your career path, prepare for placements, recommend tech stacks, or structure learning roadmaps.

Try asking me questions like:
- *"How can I become a Full Stack Developer?"*
- *"What should I study for a Frontend interview?"*
- *"Can you recommend backend projects?"*
- *"How do I prepare for placement interviews?"*

Feel free to write your query and I'll outline the required steps, salary insight, and tips!`;
  }

  return response;
}

/**
 * Evaluates student response in mock interviews
 */
export function evaluateInterviewResponse(track, questionIndex, answer) {
  const trackQuestions = MOCK_INTERVIEWS[track] || MOCK_INTERVIEWS.hr;
  const questionObj = trackQuestions[questionIndex];
  
  if (!questionObj) return null;

  const sampleAns = questionObj.sampleAnswer.toLowerCase();
  const studentAns = answer.toLowerCase().trim();

  // If answer is too short
  if (studentAns.length < 15) {
    return {
      correctness: 20,
      confidence: 30,
      communication: 25,
      overallScore: 25,
      feedback: "The answer is too brief. Recruiters expect detailed explanations containing technical vocabulary and logical structures.",
      notes: [
        "Provide more context and state definitions clearly.",
        "Add an example or describe a scenario where this applies.",
        "Ensure your response is at least 2-3 full sentences."
      ]
    };
  }

  // Calculate Correctness
  // Basic overlap of key terms
  const sampleWords = sampleAns.split(/\s+/).filter(w => w.length > 3);
  let matchedWordsCount = 0;
  sampleWords.forEach(w => {
    // Clean punctuation
    const cleanWord = w.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"");
    if (studentAns.includes(cleanWord)) {
      matchedWordsCount++;
    }
  });

  const matchPercent = Math.min(100, Math.round((matchedWordsCount / sampleWords.length) * 120));
  const correctnessScore = Math.max(35, matchPercent);

  // Calculate Confidence
  // Check for hesitation words vs strong vocabulary
  const hesitationWords = ["maybe", "i guess", "probably", "i think", "sort of", "kind of", "not sure"];
  const strongWords = ["definitely", "because", "specifically", "firstly", "in contrast", "for example", "reconciliation", "states", "immutable"];

  let hesitationCount = 0;
  let strongCount = 0;

  hesitationWords.forEach(w => {
    if (studentAns.includes(w)) hesitationCount++;
  });
  strongWords.forEach(w => {
    if (studentAns.includes(w)) strongCount++;
  });

  let confidenceScore = 75;
  confidenceScore -= hesitationCount * 10;
  confidenceScore += strongCount * 5;
  confidenceScore = Math.max(40, Math.min(95, confidenceScore));

  // Calculate Communication
  // Based on sentence structure, word count (should be between 30 and 100 words ideally)
  const wordCount = studentAns.split(/\s+/).length;
  let communicationScore = 80;
  if (wordCount < 25) communicationScore -= 20;
  if (wordCount > 150) communicationScore -= 10; // overly wordy
  if (studentAns.includes("uh") || studentAns.includes("um") || studentAns.includes("like like")) {
    communicationScore -= 15;
  }
  communicationScore = Math.max(45, Math.min(95, communicationScore));

  // Compile overall
  const overallScore = Math.round((correctnessScore * 0.5) + (confidenceScore * 0.25) + (communicationScore * 0.25));

  // Feedback generator
  let feedback = "";
  const notes = [];

  if (overallScore >= 80) {
    feedback = "Excellent response! You've captured the core technical details, spoke with authority, and structured your answer logically.";
    notes.push("You used precise industry terminology appropriately.");
    notes.push("The explanation was direct and concise.");
  } else if (overallScore >= 60) {
    feedback = "Good attempt. You understand the core concept, but you can improve the precision of your terms and speak with more assertiveness.";
    notes.push("Try to eliminate speculative phrases like 'I think' or 'maybe'.");
    notes.push("Focus on the mechanics: explain *how* it functions, not just *what* it is.");
  } else {
    feedback = "Fair attempt. The answer lacks some key technical details or was too short. You should review this topic and practice formulating longer responses.";
    notes.push("Study the sample answer: notice how it covers the lifecycle and scope.");
    notes.push("Practice writing down your answer in structured points (definition, operation, example).");
  }

  return {
    correctness: correctnessScore,
    confidence: confidenceScore,
    communication: communicationScore,
    overallScore,
    feedback,
    notes
  };
}

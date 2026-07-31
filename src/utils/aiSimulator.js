import { SKILL_LIBRARY, MOCK_INTERVIEWS } from './mockData';

// Helper lists of technical skills for keyword matching
const TECH_KEYWORDS = [
  "HTML", "CSS", "JavaScript", "TypeScript", "React.js", "React", "Angular", "Vue.js", "Next.js",
  "Node.js", "Express.js", "Express", "Python", "Django", "Flask", "Java", "Spring Boot", "C++",
  "SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "DynamoDB", "Git", "GitHub", "Docker",
  "AWS", "S3", "EC2", "Lambda", "Firebase", "Redux", "Zustand", "Tailwind CSS", "Tailwind",
  "Bootstrap", "GraphQL", "REST API", "System Design", "Data Structures", "Algorithms"
];

// Normalize skill names to match SKILL_LIBRARY keys
function normalizeSkill(skill) {
  const s = skill.toLowerCase().trim();
  if (s === "react" || s === "react.js") return "React.js";
  if (s === "node" || s === "node.js") return "Node.js";
  if (s === "express" || s === "express.js") return "Express.js";
  if (s === "mongodb" || s === "mongo") return "MongoDB";
  if (s === "sql" || s === "mysql" || s === "postgresql") return "SQL";
  if (s === "git" || s === "github") return "Git";
  
  // Find case-insensitive match in TECH_KEYWORDS
  const found = TECH_KEYWORDS.find(keyword => keyword.toLowerCase() === s);
  return found || skill;
}

/**
 * Simulates analyzing a resume and extracting details using keyword matching
 */
export function analyzeResume(fileName, fileText = "") {
  // If fileText is empty, we create some mock parsing based on the filename
  let text = fileText || "";
  if (!text) {
    text = `Resume of Student. Experienced in building websites. Skills: HTML, CSS, JavaScript, SQL. 
    Education: B.Tech in CSE from State University. Finished a project on Weather App using JS.`;
    if (fileName.toLowerCase().includes("priya")) {
      text = "Priya Patel. B.E. in IT. Skills: Python, Java, C++, HTML. Project: Library Management System.";
    } else if (fileName.toLowerCase().includes("rohan")) {
      text = "Rohan Verma. Skills: React.js, Node.js, Express.js, JavaScript, HTML, CSS, Git. Projects: Task Planner, Rest API.";
    }
  }

  const normalizedText = text.toLowerCase();
  
  // Extract skills
  const foundSkills = [];
  TECH_KEYWORDS.forEach(keyword => {
    // Escape regex characters just in case
    const regex = new RegExp(`\\b${keyword.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
    if (regex.test(normalizedText)) {
      foundSkills.push(normalizeSkill(keyword));
    }
  });
  
  // De-duplicate skills
  const uniqueSkills = [...new Set(foundSkills)];

  // Extract education
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

  // Extract projects
  const projects = [];
  const projectIndex = text.toLowerCase().indexOf("project");
  if (projectIndex !== -1) {
    // Grab text after "projects"
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

  // Calculate Resume Score (based on sections found, skill count, length)
  let score = 50;
  if (uniqueSkills.length > 3) score += 15;
  if (uniqueSkills.length > 6) score += 10;
  if (text.toLowerCase().includes("project")) score += 15;
  if (text.toLowerCase().includes("intern") || text.toLowerCase().includes("experience")) score += 10;
  score = Math.min(score, 95); // max score from analyzer

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
 * Simulates analyzing a Job Description
 */
export function analyzeJobDescription(jdText) {
  const normalizedText = jdText.toLowerCase();
  const extractedSkills = [];
  
  TECH_KEYWORDS.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
    if (regex.test(normalizedText)) {
      extractedSkills.push(normalizeSkill(keyword));
    }
  });

  const uniqueSkills = [...new Set(extractedSkills)];

  // Estimate experience requested
  let experience = "Entry Level (0-2 years)";
  const expMatch = jdText.match(/(\d+)\+?\s*years?/i);
  if (expMatch) {
    const years = parseInt(expMatch[1]);
    if (years > 4) experience = "Senior Level (5+ years)";
    else if (years >= 2) experience = "Mid Level (2-4 years)";
  }

  // Extract tools
  const tools = [];
  if (normalizedText.includes("git")) tools.push("Git");
  if (normalizedText.includes("docker")) tools.push("Docker");
  if (normalizedText.includes("aws") || normalizedText.includes("cloud")) tools.push("AWS");
  if (normalizedText.includes("firebase")) tools.push("Firebase");

  return {
    requiredSkills: uniqueSkills.length > 0 ? uniqueSkills : ["React.js", "Git", "SQL"],
    experience,
    tools: tools.length > 0 ? tools : ["Git"],
    responsibilities: jdText.length > 50 ? jdText.split("\n").filter(l => l.includes("-") || l.includes("*")).slice(0, 3).map(l => l.replace(/^[-*\s]+/, "")) : ["Build user features", "Maintain codebase", "Collaborate with team"]
  };
}

/**
 * Compares Student Skills with Job Requirements
 */
export function detectSkillGap(studentSkills, jobSkills) {
  const sSkillsNormalized = studentSkills.map(s => s.toLowerCase());
  
  const matched = [];
  const missing = [];

  jobSkills.forEach(reqSkill => {
    if (sSkillsNormalized.includes(reqSkill.toLowerCase())) {
      matched.push(reqSkill);
    } else {
      missing.push(reqSkill);
    }
  });

  const matchRatio = jobSkills.length > 0 ? matched.length / jobSkills.length : 1;
  const matchScore = Math.round(matchRatio * 100);

  return {
    matchScore,
    matchedSkills: matched,
    missingSkills: missing
  };
}

/**
 * Generates personalized learning roadmap based on missing skills
 */
export function generateRoadmap(missingSkills) {
  if (missingSkills.length === 0) {
    return [
      {
        week: "Week 1",
        title: "Advanced Specialization",
        topics: ["System Design Architecture", "Design Patterns", "CI/CD Deployment pipelines"],
        resources: [{ name: "System Design Primer", provider: "GitHub", link: "https://github.com/donnemartin/system-design-primer" }]
      }
    ];
  }

  const roadmap = [];
  
  missingSkills.forEach((skill, _index) => {
    const normalizedName = normalizeSkill(skill);
    const skillData = SKILL_LIBRARY[normalizedName];
    
    if (skillData) {
      // Map one skill to a structured week blocks
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
      // Generate a generic week if skill not in library
      roadmap.push({
        id: `roadmap-${skill}-generic-1`,
        week: `Week ${roadmap.length + 1}`,
        skillName: skill,
        title: `${skill} Foundation`,
        topics: [`Introduction to ${skill} core concepts`, `Syntax, architecture and environment setup`, `Writing basic scripts / configurations`],
        resources: [{ name: `Google: Learn ${skill}`, provider: "Search", link: `https://www.google.com/search?q=learn+${encodeURIComponent(skill)}` }]
      });
      roadmap.push({
        id: `roadmap-${skill}-generic-2`,
        week: `Week ${roadmap.length + 1}`,
        skillName: skill,
        title: `${skill} Intermediate & Projects`,
        topics: [`Intermediate variables & API structures`, `Building a simple demo app using ${skill}`, `Debugging and deploying your application`],
        resources: [{ name: `${skill} Official Docs`, provider: "Web", link: `https://www.google.com/search?q=${encodeURIComponent(skill)}+documentation` }]
      });
    }
  });

  return roadmap.slice(0, 6); // Limit roadmap to max 6 weeks to keep it digestible
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

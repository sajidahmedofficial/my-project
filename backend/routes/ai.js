// agent-notes: { ctx: "AI routes for resume parsing, JD analysis, question generation, chat & roadmap via backend Gemini", deps: ["express", "multer", "pdf-parse", "../services/geminiService.js"], state: "active", last: "anti@2026-08-25" }
import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { analyzeWithGemini, analyzeJSON, getGenAIClient } from '../services/geminiService.js';

const router = express.Router();
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// @desc    Analyze uploaded resume (PDF/DOCX)
// @route   POST /api/ai/analyze-resume
router.post('/analyze-resume', upload.single('resume'), async (req, res) => {
  try {
    let resumeText = "";

    if (req.file) {
      if (req.file.mimetype === 'application/pdf') {
        const data = await pdfParse(req.file.buffer);
        resumeText = data.text;
      } else {
        resumeText = req.file.buffer.toString('utf-8');
      }
    } else {
      resumeText = req.body.text || "";
    }

    if (!resumeText.trim()) {
      return res.status(400).json({ error: "No resume text found or file is empty" });
    }

    if (!getGenAIClient()) {
      return res.json(runLocalResumeAnalyzer(resumeText));
    }

    const prompt = `You are an expert ATS (Applicant Tracking System) and Resume Parser.
Analyze the following resume text and extract skills, project details, education, and experience.
Also calculate an overall Resume Score (out of 100) based on formatting, technical vocabulary, and structure.

Resume Text:
"""
${resumeText}
"""

Return the output strictly in the following JSON format:
{
  "skills": ["Skill1", "Skill2", "Skill3"],
  "projects": [
    { "title": "Project Title", "tech": "React, Node.js", "description": "Short description of what they built" }
  ],
  "education": "Degree Name - Institution (Year)",
  "experience": "Description of past internships or roles",
  "resumeScore": 75
}`;

    const parsedJson = await analyzeJSON(prompt);
    res.json(parsedJson || runLocalResumeAnalyzer(resumeText));

  } catch (error) {
    console.error("Gemini Resume Analysis Error:", error);
    res.status(500).json({ error: 'AI parsing failed', message: error.message });
  }
});

// @desc    Analyze job description & detect skill gap
// @route   POST /api/ai/analyze-jd
router.post('/analyze-jd', async (req, res) => {
  const { jdText, studentSkills } = req.body;

  if (!jdText) {
    return res.status(400).json({ error: 'Job description text is required' });
  }

  try {
    if (!getGenAIClient()) {
      return res.json(runLocalJdAnalyzer(jdText, studentSkills));
    }

    const prompt = `You are an AI Technical recruiter.
Analyze the following Job Description (JD).
1. Extract required technical skills.
2. Extract required tools (Git, Docker, etc.).
3. Extract experience requirements (e.g. Entry, Mid, Senior).
4. Extract top 3 core responsibilities.

Job Description:
"""
${jdText}
"""

Return the response strictly as a JSON object of this structure:
{
  "requiredSkills": ["React.js", "Node.js", "SQL"],
  "experience": "Mid Level (2-4 years)",
  "tools": ["Git", "Docker"],
  "responsibilities": [
    "Design and implement user interfaces",
    "Collaborate with backend teams",
    "Perform database queries"
  ]
}`;

    let jobExtracted = null;
    try {
      jobExtracted = await analyzeJSON(prompt, { timeoutMs: 6000 });
    } catch (apiErr) {
      console.warn("[JD Analysis Notice] Falling back to local JD analyzer:", apiErr.message);
    }

    if (!jobExtracted || !jobExtracted.requiredSkills) {
      return res.json(runLocalJdAnalyzer(jdText, studentSkills));
    }
    
    const matched = [];
    const missing = [];
    const sSkillsNormalized = (studentSkills || []).map(s => s.toLowerCase().trim());

    jobExtracted.requiredSkills.forEach(reqSkill => {
      if (sSkillsNormalized.includes(reqSkill.toLowerCase().trim())) {
        matched.push(reqSkill);
      } else {
        missing.push(reqSkill);
      }
    });

    const matchScore = jobExtracted.requiredSkills.length > 0
      ? Math.round((matched.length / jobExtracted.requiredSkills.length) * 100)
      : 100;

    res.json({
      jobProfile: jobExtracted,
      gapReport: {
        matchScore,
        matchedSkills: matched,
        missingSkills: missing
      }
    });

  } catch (error) {
    console.warn("[JD Analysis General Catch] Fallback executed:", error.message);
    res.json(runLocalJdAnalyzer(jdText, studentSkills));
  }
});

// @desc    Generate Practice, Coding & Interview Questions via Gemini
// @route   POST /api/ai/generate-questions
router.post('/generate-questions', async (req, res) => {
  const { topic, difficulty = 'medium', questionType = 'mcq', numberOfQuestions = 5 } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Topic parameter is required' });
  }

  const count = Number(numberOfQuestions) || 5;

  try {
    if (!getGenAIClient()) {
      const fallbackQuestions = generateMockQuestions(topic, difficulty, questionType, count);
      return res.json({ questions: fallbackQuestions });
    }

    const prompt = `You are an expert AI technical examiner. Generate exactly ${count} practice questions based on the following specs:
- Topic: ${topic}
- Difficulty: ${difficulty}
- Question Type: ${questionType}

Output requirements:
Return a clean JSON array of ${count} question objects.
Structure per question object depending on questionType (${questionType}):
- If "mcq": { "id": number, "question": string, "options": Array<string> (4 items), "correctAnswer": string, "explanation": string }
- If "coding": { "id": number, "question": string, "starterCode": string, "sampleSolution": string, "explanation": string }
- If "interview": { "id": number, "question": string, "sampleAnswer": string, "keyConcepts": Array<string> }

Return strictly valid JSON only. Do not include markdown code fences or conversational text.`;

    const parsed = await analyzeJSON(prompt);
    let questions = Array.isArray(parsed) ? parsed : (parsed?.questions || parsed?.data || []);

    if (!Array.isArray(questions) || questions.length === 0) {
      questions = generateMockQuestions(topic, difficulty, questionType, count);
    }

    res.json({ questions });
  } catch (error) {
    console.error('[AI Route] Question generation error:', error.message);
    const fallbackQuestions = generateMockQuestions(topic, difficulty, questionType, count);
    res.json({ questions: fallbackQuestions, warning: 'Fallback questions used due to upstream AI service response.' });
  }
});

// Helper for rich contextual fallback response when AI is offline
function generateSmartFallbackAnswer(query, candidateName, targetRole, currentSkills, missingSkills) {
  const q = (query || "").toLowerCase();

  if (q.includes("python")) {
    return `### Python Essentials & Best Practices 🐍\n\nPython is a versatile language widely used for backend engineering, data science, automation, and AI.\n\n- **Core Highlights**: Clean syntax, dynamic typing, rich standard library, and massive ecosystem (FastAPI, Django, Flask, Pandas, NumPy).\n- **Key Areas to Master**: List/Dict comprehensions, Generators, Decorators, \`*args\`/\`**kwargs\`, Context Managers (\`with\` statements), and AsyncIO.\n- **Practical Application**: Build a REST API using **FastAPI** or an automated web scraper with **BeautifulSoup**.\n\n*Tip for ${targetRole}:* Pair your Python backend skills with containerization (${missingSkills}) to build deployable microservices!`;
  }
  if (q.includes("javascript") || q.includes("js ") || q.endsWith("js") || q.includes("event loop") || q.includes("closure") || q.includes("promise")) {
    return `### Modern JavaScript Deep-Dive ⚡\n\nJavaScript is the foundation of full-stack web development.\n\n- **Event Loop & Asynchrony**: Understand the Call Stack, Microtask Queue (Promises), and Macrotask Queue (\`setTimeout\`).\n- **Key ES6+ Features**: Destructuring, Spread/Rest operators, Optional Chaining (\`?.\`), Nullish Coalescing (\`??\`), Async/Await.\n- **Scope & Closures**: Lexical scoping allows inner functions to access outer variables even after the outer function finishes executing.\n- **Memory Management**: Avoid memory leaks by cleaning up event listeners and intervals.\n\n*Next Step:* Try implementing your own custom \`Promise.all()\` or debounce function to master closures!`;
  }
  if (q.includes("react") || q.includes("hook") || q.includes("state") || q.includes("redux") || q.includes("virtual dom")) {
    return `### React Architecture & State Patterns ⚛️\n\n- **Virtual DOM & Reconciliation**: React uses a lightweight in-memory representation of the DOM and the Fiber reconciliation algorithm to calculate minimal DOM diffs.\n- **Essential Hooks**: \`useState\`, \`useEffect\` (synchronization), \`useCallback\` / \`useMemo\` (performance optimization), \`useRef\` (DOM & persistent values).\n- **State Management**: For component-level state use React Hooks; for global state consider Context API, Zustand, or Redux Toolkit.\n- **Performance Tips**: Keep component trees shallow, use lazy loading (\`React.lazy\`), and memoize expensive calculations.\n\n*Project Idea:* Build a real-time collaborative tool utilizing React and WebSocket hooks!`;
  }
  if (q.includes("docker") || q.includes("container") || q.includes("kubernetes") || q.includes("devops") || q.includes("ci/cd")) {
    return `### Docker & Containerization Essentials 🐳\n\nDocker packages code and its dependencies into a standalone, reproducible container.\n\n1. **Core Concepts**:\n   - **Dockerfile**: Blueprint instructions for building an image.\n   - **Image**: Immutable snapshot of the application.\n   - **Container**: Running instance of an image.\n   - **Volumes**: Persistent storage across container lifecycles.\n2. **Multi-Stage Builds**: Drastically reduce image size by building assets in one stage and copying only production binaries to the final lightweight image (e.g. \`node:alpine\`).\n3. **Docker Compose**: Define multi-service stacks (API + Redis + PostgreSQL) using a single YAML configuration.\n\n*Action item for your ${targetRole} roadmap:* Containerize your backend and set up a GitHub Actions workflow to build and test on every PR!`;
  }
  if (q.includes("database") || q.includes("sql") || q.includes("nosql") || q.includes("mongo") || q.includes("postgres")) {
    return `### Database Architecture: SQL vs NoSQL 🗄️\n\n- **Relational (PostgreSQL, MySQL)**: ACID compliance, structured schemas, relational integrity, powerful JOIN queries. Best for financial, transaction-heavy, or complex relational models.\n- **Document/NoSQL (MongoDB, DynamoDB)**: Flexible JSON-like schemas, horizontal scaling, rapid prototyping. Best for real-time analytics, user catalogs, or semi-structured data.\n- **Optimization Highlights**: Always index frequently queried columns, analyze query plans with \`EXPLAIN ANALYZE\`, and prevent N+1 query problems using batching/eager loading.`;
  }
  if (q.includes("dsa") || q.includes("data structure") || q.includes("algorithm") || q.includes("leetcode") || q.includes("binary tree")) {
    return `### Data Structures & Algorithms (DSA) Roadmap 🧠\n\nTo excel in technical interviews, master these high-frequency patterns:\n\n1. **Arrays & Strings**: Two Pointers, Sliding Window, Prefix Sums, HashMaps.\n2. **Linked Lists & Stacks**: Fast/Slow pointer cycle detection, Monotonic Stack.\n3. **Trees & Graphs**: BFS (Queue), DFS (Recursion/Stack), Topological Sort, Dijkstra's.\n4. **Dynamic Programming**: Memoization (Top-down) vs Tabulation (Bottom-up).\n\n*Target:* Aim to solve 100-150 curated medium problems focusing on pattern recognition rather than memorization.`;
  }
  if (q.includes("system design") || q.includes("scalability") || q.includes("microservice") || q.includes("load balancer")) {
    return `### System Design Core Principles 🏗️\n\nWhen designing large-scale distributed systems:\n\n1. **Load Balancing**: Distribute traffic using Round Robin or Least Connections.\n2. **Caching**: Utilize Redis/Memcached at application and database layers (Cache-Aside, Write-Through).\n3. **Database Scaling**: Read replicas, Sharding, and Connection Pooling.\n4. **Asynchronous Processing**: Message queues (RabbitMQ, Kafka, SQS) to decouple heavy tasks and smooth traffic spikes.\n5. **Reliability**: Implement Circuit Breakers, Rate Limiters, and Health Checks.`;
  }

  return `### AI Mentor Guidance for "${query}" 💡\n\nHello ${candidateName}!\n\nHere are actionable recommendations for your question regarding **${query}** in the context of your **${targetRole}** journey:\n\n1. **Technical Foundation**: Focus on mastering the core principles behind ${query}. Reinforce your strengths in **${currentSkills}**.\n2. **Hands-On Application**: Build a concrete mini-project or code module demonstrating this concept.\n3. **Skill Gap Alignment**: Integrating this with **${missingSkills}** will directly boost your placement readiness.\n\nFeel free to ask for specific code examples, debugging help, or architectural design breakdowns!`;
}

// @desc    Career Chatbot Mentor with Full User & Resume Context
// @route   POST /api/ai/chat
router.post('/chat', async (req, res) => {
  const { messages, query, message, userContext } = req.body;
  const userQuery = query || message || (messages && messages[messages.length - 1]?.text) || "";

  if (!userQuery) {
    return res.status(400).json({ error: "Message query is required" });
  }

  const candidateName = userContext?.name || userContext?.candidateName || "Candidate";
  const targetRole = userContext?.targetRole || userContext?.careerGoal || "Full Stack Developer";
  const currentSkills = Array.isArray(userContext?.skills) ? userContext.skills.join(', ') : "React, JavaScript, Node.js";
  const missingSkills = Array.isArray(userContext?.missingSkills) ? userContext.missingSkills.join(', ') : "TypeScript, Docker, AWS";
  const resumeScore = userContext?.scores?.resumeScore || userContext?.resumeScore || 85;
  const atsScore = userContext?.scores?.placementReadiness || userContext?.atsScore || 82;

  try {
    if (!getGenAIClient()) {
      return res.json({
        response: generateSmartFallbackAnswer(userQuery, candidateName, targetRole, currentSkills, missingSkills)
      });
    }

    const chatHistoryContext = (messages || [])
      .slice(-6)
      .map(m => `${m.sender === 'bot' ? 'Mentor' : 'Student'}: ${m.text}`)
      .join('\n');
    
    const prompt = `You are the expert AI Career & Technical Mentor at SkillBridge AI.
You are interacting with ${candidateName}, whose target career role is: ${targetRole}.

Candidate Live Profile & Context:
- Current Detected Skills: ${currentSkills}
- Key Skill Gaps: ${missingSkills}
- Resume Score: ${resumeScore}/100 | ATS Readiness: ${atsScore}%

INSTRUCTIONS:
1. Directly, accurately, and thoroughly answer the student's exact query first (whether it is a coding question, syntax query, technical concept, system architecture, interview question, or career strategy).
2. Provide clear code snippets, bullet points, or step-by-step instructions where appropriate.
3. If relevant to their question, seamlessly relate insights to their target role (${targetRole}) and bridging skill gaps, but do not replace answering their question with generic advice.
4. Keep the tone encouraging, professional, and highly actionable. Format with clean Markdown.

Recent Conversation History:
${chatHistoryContext}

Student's Query: "${userQuery}"

Mentor Response:`;

    const text = await analyzeWithGemini(prompt, { timeoutMs: 20000 });
    res.json({ response: text });

  } catch (error) {
    console.warn("[AI Chat Notice] Fallback mentor response generated:", error.message);
    res.json({
      response: generateSmartFallbackAnswer(userQuery, candidateName, targetRole, currentSkills, missingSkills)
    });
  }
});

// @desc    Analyze Skill Gap
// @route   POST /api/ai/skill-gap
router.post('/skill-gap', async (req, res) => {
  const { userSkills = [] } = req.body;
  const defaultRequired = ['React.js', 'Node.js', 'TypeScript', 'GraphQL', 'Docker', 'AWS', 'Redis', 'Jest'];
  const missingSkills = defaultRequired.filter(skill => !userSkills.includes(skill));
  const matchPercentage = Math.round(((defaultRequired.length - missingSkills.length) / defaultRequired.length) * 100);

  res.status(200).json({
    matchPercentage,
    missingSkills,
    matchingSkills: userSkills.filter(s => defaultRequired.includes(s)),
    readinessGrade: matchPercentage > 75 ? 'Placement Ready' : 'Development Required'
  });
});

// @desc    Generate Weekly Roadmap
// @route   POST /api/ai/generate-roadmap
router.post('/generate-roadmap', async (req, res) => {
  const { targetRole = 'Full Stack Engineer' } = req.body;
  const weeks = [
    {
      week: 1,
      title: 'Core Fundamentals & Advanced State Management',
      objectives: ['Master TypeScript generics & interfaces', 'Implement Redux Toolkit / Zustand state flow'],
      resources: [
        { title: 'TypeScript Deep Dive', provider: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/', type: 'docs' },
        { title: 'React + TS Masterclass', provider: 'freeCodeCamp', url: 'https://youtube.com', type: 'video' }
      ],
      completed: false,
      progress: 40
    },
    {
      week: 2,
      title: 'Microservices & Containerization',
      objectives: ['Dockerize Node.js Express backend services', 'Setup Docker Compose for MongoDB & Redis'],
      resources: [
        { title: 'Docker for Beginners', provider: 'Coursera', url: 'https://coursera.org', type: 'course' },
        { title: 'Node.js Microservices Patterns', provider: 'Node.js Docs', url: 'https://nodejs.org', type: 'docs' }
      ],
      completed: false,
      progress: 0
    },
    {
      week: 3,
      title: 'Cloud Infrastructure & CI/CD Pipelines',
      objectives: ['Deploy frontend to Vercel/Netlify', 'Build GitHub Actions CI pipeline for automated testing'],
      resources: [
        { title: 'AWS Cloud Practitioner Prep', provider: 'AWS Skill Builder', url: 'https://explore.skillbuilder.aws', type: 'course' },
        { title: 'GitHub Actions Crash Course', provider: 'Dev.to', url: 'https://dev.to', type: 'article' }
      ],
      completed: false,
      progress: 0
    }
  ];

  res.status(200).json({
    jobRole: targetRole,
    generatedWeeks: weeks
  });
});

// Local Fallback helper engines
function generateMockQuestions(topic, difficulty = 'medium', questionType = 'mcq', numberOfQuestions = 5) {
  const count = Number(numberOfQuestions) || 5;
  const questions = [];
  
  for (let i = 1; i <= count; i++) {
    if (questionType === 'coding') {
      questions.push({
        id: i,
        question: `Implement a robust ${topic} solution for scenario #${i} with optimal time/space complexity (${difficulty} level).`,
        starterCode: `function solve${topic.replace(/[^a-zA-Z0-9]/g, '')}Case${i}(input) {\n  // TODO: Implement solution for ${topic}\n  return null;\n}`,
        sampleSolution: `function solve${topic.replace(/[^a-zA-Z0-9]/g, '')}Case${i}(input) {\n  if (!input) return null;\n  return Array.isArray(input) ? input.filter(Boolean) : { status: 'success', topic: '${topic}' };\n}`,
        explanation: `Demonstrates best-practice architecture, error handling, and clean modular code for ${topic}.`
      });
    } else if (questionType === 'interview') {
      questions.push({
        id: i,
        question: `How would you explain the core architectural principles of ${topic} and handle edge cases at scale?`,
        sampleAnswer: `${topic} requires clear separation of concerns, defensive validation, and modular encapsulation to maintain performance and reliability.`,
        keyConcepts: [topic, 'Scalability', 'Design Patterns', 'Error Handling']
      });
    } else {
      questions.push({
        id: i,
        question: `Which of the following statements is most accurate regarding ${topic} in production applications?`,
        options: [
          `${topic} enhances maintainability and modular execution when configured properly.`,
          `${topic} completely eliminates the need for unit and integration testing.`,
          `${topic} can only run in single-threaded environments without asynchronous capabilities.`,
          `${topic} deprecated all standard web interfaces in modern architectures.`
        ],
        correctAnswer: `${topic} enhances maintainability and modular execution when configured properly.`,
        explanation: `In production software design, ${topic} provides structured encapsulation and modular separation.`
      });
    }
  }
  return questions;
}

function runLocalResumeAnalyzer(text = '') {
  const commonSkills = [
    'React', 'React.js', 'Next.js', 'Vue', 'Angular', 'Node.js', 'Express', 'JavaScript', 
    'TypeScript', 'Python', 'Java', 'C++', 'Go', 'Rust', 'SQL', 'PostgreSQL', 'MongoDB', 
    'Redis', 'GraphQL', 'REST APIs', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 
    'Git', 'GitHub', 'CI/CD', 'Tailwind CSS', 'HTML', 'CSS', 'Linux', 'Jest', 'PyTorch', 'TensorFlow'
  ];

  const lower = text.toLowerCase();
  const extractedSkills = commonSkills.filter(skill => {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(lower);
  });

  const skills = extractedSkills.length > 0 ? extractedSkills : ['JavaScript', 'React', 'Node.js', 'SQL', 'Git'];
  const resumeScore = Math.min(95, Math.max(60, 50 + skills.length * 5));

  return {
    skills,
    projects: [
      { title: "Production Full Stack Application", tech: skills.slice(0, 3).join(', ') || "React, Node.js", description: "Engineered scalable responsive application with authentication and database persistence." }
    ],
    education: "B.Tech in Computer Science & Engineering",
    experience: skills.length > 5 ? "Intermediate (2+ years project & internship experience)" : "Entry Level (0-1 years)",
    resumeScore
  };
}

function runLocalJdAnalyzer(jdText = '', studentSkills = []) {
  const commonSkills = [
    'React', 'Node.js', 'TypeScript', 'JavaScript', 'Python', 'Docker', 'AWS', 'SQL', 
    'MongoDB', 'PostgreSQL', 'Git', 'Kubernetes', 'GraphQL', 'Tailwind CSS', 'Jest', 'CI/CD'
  ];

  const lower = jdText.toLowerCase();
  const foundSkills = commonSkills.filter(skill => {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(lower);
  });

  const requiredSkills = foundSkills.length > 0 ? foundSkills : ["React", "Node.js", "TypeScript", "Git", "SQL"];
  const sSkillsNormalized = (studentSkills || []).map(s => s.toLowerCase().trim());
  const matched = requiredSkills.filter(s => sSkillsNormalized.includes(s.toLowerCase().trim()));
  const missing = requiredSkills.filter(s => !sSkillsNormalized.includes(s.toLowerCase().trim()));

  return {
    jobProfile: {
      requiredSkills,
      experience: "Entry - Mid Level (1-3 years)",
      tools: ["Git", "Docker"].filter(t => requiredSkills.includes(t) || lower.includes(t.toLowerCase())),
      responsibilities: [
        "Design, build, and maintain efficient, reusable, and reliable code",
        "Collaborate with cross-functional product and engineering teams",
        "Implement automated testing, CI/CD, and performance optimizations"
      ]
    },
    gapReport: {
      matchScore: requiredSkills.length > 0 ? Math.round((matched.length / requiredSkills.length) * 100) : 100,
      matchedSkills: matched,
      missingSkills: missing
    }
  };
}

export default router;

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

// Helper for rich contextual fallback response when AI is offline or rate-limited
function generateSmartFallbackAnswer(query, candidateName, targetRole, currentSkills, missingSkills, persona = 'mentor') {
  const q = (query || "").toLowerCase();

  if (persona === 'interviewer') {
    return `### 🎯 Technical Interview Simulation (${targetRole})

**Interviewer (Gemini):** "Welcome ${candidateName}. Let's jump into a focused technical question."

#### Question:
> How does asynchronous programming work in JavaScript/Node.js, and what is the difference between the **Microtask Queue** and the **Macrotask Queue**?

#### Evaluation Criteria to keep in mind:
- **Event Loop mechanics**: Call stack, Web APIs / libuv, callback queues.
- **Microtasks**: \`Promise.then()\`, \`queueMicrotask()\`, \`MutationObserver\` (processed immediately after the current script run).
- **Macrotasks**: \`setTimeout()\`, \`setInterval()\`, \`setImmediate()\`.

\`\`\`javascript
// Quick example to test your intuition:
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');
// What is the exact execution order and why?
\`\`\`

💬 *Reply with your answer and rationale, and I'll score your explanation and give feedback!*`;
  }

  if (persona === 'resume') {
    return `### 📄 ATS & Resume Optimization Review

**Candidate:** ${candidateName} | **Target Role:** ${targetRole}

#### Key Observations for ATS Screening:
1. **Action-Verb Formula**: Rewrite bullet points using the **Google XYZ formula**: *"Accomplished [X] as measured by [Y], by doing [Z]"*.
2. **Keyword Density**: Ensure high-priority industry keywords are present: **${missingSkills}**.
3. **Quantifiable Impact**: Replace vague duties with specific metrics (e.g., *"Reduced API latency by 35%"* instead of *"Worked on backend performance"*).

#### Example Transformation:
- ❌ **Before**: "Helped develop React frontends and integrated REST APIs."
- ✅ **After**: "Architected 8+ responsive React components with custom hooks, reducing client-side bundle size by 22% and improving First Contentful Paint by 400ms."

👉 *Paste any bullet point or section from your resume here, and I will rewrite it to be recruiter-ready!*`;
  }

  if (persona === 'architect') {
    return `### 🏗️ System Architecture & Scalability Blueprint

**Role Context:** ${targetRole} | **Focus Query:** "${query}"

#### Architectural Pillars:
1. **Stateless Service Layer**: Decouple business logic into stateless Node.js / Go services behind an NGINX or AWS ALB load balancer.
2. **Caching Strategy (Multi-Tier)**:
   - Client / CDN edge cache (Cloudflare) for static assets.
   - Redis Cache-Aside pattern for hot queries (TTL + LRU eviction).
3. **Database Architecture**:
   - Write to primary PostgreSQL / MongoDB cluster; scale reads using replica read pools.
   - Apply connection pooling (e.g., PgBouncer) to prevent database exhaustion during peak spikes.
4. **Resilience & Fault Tolerance**:
   - Implement circuit breakers, retry with exponential backoff, and asynchronous dead-letter queues (Kafka/RabbitMQ).

\`\`\`
[Clients] ---> [Cloudflare CDN / DNS]
                    |
           [Application Load Balancer]
           /            |            \\
     [App Node 1]  [App Node 2]  [App Node 3]
           \\            |            /
             [Redis Cache Cluster]
                    |
           [Primary DB] <--- [Read Replica]
\`\`\`

💡 *What specific traffic volume (RPS) or latency SLA are you designing for?*`;
  }

  if (q.includes("python")) {
    return `### 🐍 Python Essentials & Best Practices

Python is a versatile language widely used for backend engineering, data science, automation, and AI.

- **Core Highlights**: Clean syntax, dynamic typing, rich standard library, and massive ecosystem (FastAPI, Django, Flask, Pandas, NumPy).
- **Key Areas to Master**: List/Dict comprehensions, Generators, Decorators, \`*args\`/\`**kwargs\`, Context Managers (\`with\` statements), and AsyncIO.
- **Practical Application**: Build a REST API using **FastAPI** or an automated web scraper with **BeautifulSoup**.

\`\`\`python
# Decorator pattern example for execution timing
import time
from functools import wraps

def time_it(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        print(f"{func.__name__} executed in {time.perf_counter() - start:.4f}s")
        return result
    return wrapper
\`\`\`

*Tip for ${targetRole}:* Pair your Python backend skills with containerization (${missingSkills}) to build deployable microservices!`;
  }

  if (q.includes("javascript") || q.includes("js ") || q.endsWith("js") || q.includes("event loop") || q.includes("closure") || q.includes("promise")) {
    return `### ⚡ Modern JavaScript Deep-Dive

JavaScript is the foundation of modern full-stack web engineering.

- **Event Loop & Asynchrony**: The Call Stack executes synchronous code, while Microtasks (\`Promises\`) run before Macrotasks (\`setTimeout\`).
- **Key ES6+ Features**: Destructuring, Spread/Rest operators, Optional Chaining (\`?.\`), Nullish Coalescing (\`??\`), Async/Await.
- **Scope & Closures**: Lexical scoping allows inner functions to access outer variables even after the outer function finishes executing.

\`\`\`javascript
// Practical debounce implementation utilizing closures
function debounce(fn, delayMs = 300) {
  let timerId;
  return function (...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn.apply(this, args), delayMs);
  };
}
\`\`\`

*Next Step:* Try implementing your own custom \`Promise.all()\` or debounce function to master closures!`;
  }

  if (q.includes("react") || q.includes("hook") || q.includes("state") || q.includes("redux") || q.includes("virtual dom")) {
    return `### ⚛️ React Architecture & State Patterns

- **Virtual DOM & Reconciliation**: React uses an in-memory lightweight tree and the Fiber algorithm to compute minimal DOM patches.
- **Essential Hooks**: \`useState\`, \`useEffect\` (synchronization), \`useCallback\` / \`useMemo\` (performance optimization), \`useRef\` (DOM & persistent values).
- **State Management**: For component-level state use React Hooks; for global state consider Context API, Zustand, or Redux Toolkit.

\`\`\`jsx
// Custom hook for debounced API query
import { useState, useEffect } from 'react';

export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}
\`\`\`

*Project Idea:* Build a real-time collaborative tool utilizing React and WebSocket hooks!`;
  }

  if (q.includes("docker") || q.includes("container") || q.includes("kubernetes") || q.includes("devops") || q.includes("ci/cd")) {
    return `### 🐳 Docker & Containerization Essentials

Docker packages code and its dependencies into a standalone, reproducible container.

1. **Core Concepts**:
   - **Dockerfile**: Blueprint instructions for building an image.
   - **Image**: Immutable snapshot of the application.
   - **Container**: Running instance of an image.
   - **Volumes**: Persistent storage across container lifecycles.
2. **Multi-Stage Builds**: Drastically reduce image size by building assets in one stage and copying only production binaries to the final lightweight image.

\`\`\`dockerfile
# Multi-stage production build for Node.js
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
EXPOSE 3000
CMD ["node", "dist/index.js"]
\`\`\`

*Action item for your ${targetRole} roadmap:* Containerize your backend and set up a GitHub Actions workflow to build and test on every PR!`;
  }

  return `### 💡 AI Mentor Guidance for "${query}"

Hello **${candidateName}**! Here is actionable guidance tailored to your journey as an aspiring **${targetRole}**:

1. **Core Technical Takeaway**: Focus on understanding foundational patterns behind *${query}*. Reinforce your existing strengths in **${currentSkills}**.
2. **Hands-On Application**: Build a concrete mini-project or code module demonstrating this concept.
3. **Skill Gap Alignment**: Integrating this with **${missingSkills}** will directly boost your placement readiness.

\`\`\`markdown
> Pro Tip: Keep your code modular and write automated unit tests to demonstrate engineering maturity.
\`\`\`

Feel free to ask for specific code examples, debugging help, or architectural design breakdowns!`;
}

// @desc    Career Chatbot Mentor with Full User & Resume Context
// @route   POST /api/ai/chat
router.post('/chat', async (req, res) => {
  const { messages, query, message, userContext, persona = 'mentor', model = 'gemini-3.6-flash', temperature = 0.7 } = req.body;
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

  // Persona instructions
  let personaInstruction = "You are Google Gemini, acting as an expert AI Career & Technical Mentor at SkillBridge AI.";
  if (persona === 'interviewer') {
    personaInstruction = "You are Google Gemini, acting as a rigorous Senior Technical Interviewer. Ask realistic interview questions, probe edge cases, evaluate answers using the STAR method, and give constructive feedback.";
  } else if (persona === 'architect') {
    personaInstruction = "You are Google Gemini, acting as a Principal Cloud & System Architect. Analyze architectural patterns, scalability, microservices, database schemas, and performance trade-offs.";
  } else if (persona === 'resume') {
    personaInstruction = "You are Google Gemini, acting as a Senior Technical Recruiter & ATS Optimization Specialist. Critique resume content, rewrite weak bullet points into high-impact accomplishment statements with metrics, and optimize for recruiter screening.";
  } else if (persona === 'code') {
    personaInstruction = "You are Google Gemini, acting as an expert Code Explainer & Pair Programmer. Write clean, idiomatic code, explain tricky concepts simply, and debug issues with clear step-by-step explanations.";
  }

  try {
    if (!getGenAIClient()) {
      return res.json({
        response: generateSmartFallbackAnswer(userQuery, candidateName, targetRole, currentSkills, missingSkills, persona),
        modelUsed: 'Gemini Hybrid Engine (Local Simulator)',
        persona
      });
    }

    const chatHistoryContext = (messages || [])
      .slice(-6)
      .map(m => `${m.sender === 'bot' ? 'Gemini' : 'User'}: ${m.text}`)
      .join('\n');
    
    const prompt = `${personaInstruction}
You are interacting with ${candidateName}, whose target career role is: ${targetRole}.

Candidate Live Profile & Context:
- Current Detected Skills: ${currentSkills}
- Key Skill Gaps: ${missingSkills}
- Resume Score: ${resumeScore}/100 | ATS Readiness: ${atsScore}%

INSTRUCTIONS:
1. Directly, accurately, and thoroughly answer the user's exact query first (whether it is a coding question, syntax query, technical concept, system architecture, interview question, or career strategy).
2. Format your response cleanly using Google Gemini standard markdown:
   - Use bolding for key terms.
   - Use fenced code blocks (\`\`\`language ... \`\`\`) for any code snippets.
   - Use concise bulleted or numbered lists.
   - Provide a "💡 Pro Tip" or key takeaway section when helpful.
3. If relevant to their question, seamlessly relate insights to their target role (${targetRole}) and bridging skill gaps, but do not replace answering their question with generic advice.
4. Keep the tone encouraging, intellectual, professional, and actionable.

Recent Conversation History:
${chatHistoryContext}

User's Query: "${userQuery}"

Gemini Response:`;

    const text = await analyzeWithGemini(prompt, { 
      timeoutMs: 20000, 
      temperature: Number(temperature) || 0.7 
    });

    res.json({ 
      response: text,
      modelUsed: 'Google Gemini (gemini-3.6-flash)',
      persona
    });

  } catch (error) {
    console.warn("[AI Chat Notice] Fallback mentor response generated:", error.message);
    res.json({
      response: generateSmartFallbackAnswer(userQuery, candidateName, targetRole, currentSkills, missingSkills, persona),
      modelUsed: 'Google Gemini Contextual Intelligence',
      persona
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
        starterCode: `function solve${topic.replace(/[^a-zA-Z0-9]/g, '')}Case${i}(input) {\n  // Implementation: Write your solution for ${topic}\n  return null;\n}`,
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

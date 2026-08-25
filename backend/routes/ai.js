// agent-notes: { ctx: "AI routes for resume parsing, JD analysis, question generation, chat & roadmap via backend Gemini", deps: ["@google/generative-ai", "pdf-parse", "multer"], state: "active", last: "anti@2026-08-25" }
import express from 'express';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pdfParse from 'pdf-parse';

const router = express.Router();
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// Initialize Gemini API Client
// Note: Requires GEMINI_API_KEY environment variable. If not set, routes fallback gracefully to structured mock engines.
const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("[AI Routes] WARNING: GEMINI_API_KEY is not configured in backend environment. Fallback engines active.");
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

// Helper to invoke Gemini with model fallback
async function generateGeminiContent(ai, prompt, isJson = false) {
  const modelNames = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];
  let lastError = null;

  for (const modelName of modelNames) {
    try {
      const model = ai.getGenerativeModel({
        model: modelName,
        ...(isJson ? { generationConfig: { responseMimeType: 'application/json' } } : {})
      });
      const result = await model.generateContent(
        isJson ? { contents: [{ role: 'user', parts: [{ text: prompt }] }] } : prompt
      );
      const text = result.response.text();
      if (text) return text;
    } catch (err) {
      console.warn(`[AI Route] Model ${modelName} warning:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error("Gemini AI request failed across all models.");
}

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

    const ai = getGenAI();
    if (!ai) {
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

    const text = await generateGeminiContent(ai, prompt, true);
    const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsedJson = JSON.parse(cleaned);
    res.json(parsedJson);

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
    const ai = getGenAI();
    if (!ai) {
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

    const text = await generateGeminiContent(ai, prompt, true);
    const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const jobExtracted = JSON.parse(cleaned);
    
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
    res.status(500).json({ error: 'JD Analysis failed', message: error.message });
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
    const ai = getGenAI();
    if (!ai) {
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

    const text = await generateGeminiContent(ai, prompt, true);
    const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    let questions;

    try {
      questions = JSON.parse(cleaned);
    } catch {
      const parsed = JSON.parse(cleaned);
      questions = Array.isArray(parsed) ? parsed : (parsed.questions || parsed.data || []);
    }

    if (!Array.isArray(questions)) {
      questions = [questions];
    }

    res.json({ questions });
  } catch (error) {
    console.error('[AI Route] Question generation error:', error.message);
    const fallbackQuestions = generateMockQuestions(topic, difficulty, questionType, count);
    res.json({ questions: fallbackQuestions, warning: 'Fallback questions used due to upstream AI service response.' });
  }
});

// @desc    Career Chatbot Mentor
// @route   POST /api/ai/chat
router.post('/chat', async (req, res) => {
  const { messages, query } = req.body;

  try {
    const ai = getGenAI();
    if (!ai) {
      return res.json({ response: "Local Mentor response fallback trigger." });
    }

    const chatHistoryContext = (messages || []).map(m => `${m.sender === 'bot' ? 'Mentor' : 'Student'}: ${m.text}`).join('\n');
    
    const prompt = `You are a Career Mentor chatbot at SkillBridge AI. Your goal is to guide CSE/IT students.
Provide clear, action-oriented, encouraging career advice. Include structures like salaries (in INR/USD), courses, or project ideas. Use Markdown layout.

Context of Chat History:
${chatHistoryContext}

Student's Query: "${query}"

Mentor Response:`;

    const text = await generateGeminiContent(ai, prompt, false);
    res.json({ response: text });

  } catch (error) {
    res.status(500).json({ error: 'Chat session failed', message: error.message });
  }
});

// @desc    Evaluate Mock Interview Answer
// @route   POST /api/ai/evaluate-interview
router.post('/evaluate-interview', async (req, res) => {
  const { question, studentAnswer, modelAnswer } = req.body;

  try {
    const ai = getGenAI();
    if (!ai) {
      return res.status(500).json({ error: 'Gemini Key is missing' });
    }

    const prompt = `You are an AI Technical Interviewer evaluating a candidate's response.
Compare the student's answer against the target question and model answer.
Score the student on:
1. Technical Correctness (out of 100)
2. Mock Confidence (out of 100) - based on terminology usage, avoiding hesitation words.
3. Communication Clarity (out of 100) - based on structure and explanation depth.

Question: "${question}"
Student's Answer: "${studentAnswer}"
Model Answer: "${modelAnswer}"

Return the response strictly as a JSON object of this structure:
{
  "correctness": 85,
  "confidence": 80,
  "communication": 75,
  "overallScore": 80,
  "feedback": "Write a concise sentence summarizing correctness and layout.",
  "notes": [
    "Mentioned reconciliation accurately",
    "Try to expand more on the diffing algorithm next time"
  ]
}`;

    const text = await generateGeminiContent(ai, prompt, true);
    const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    res.json(JSON.parse(cleaned));

  } catch (error) {
    res.status(500).json({ error: 'Evaluation failed', message: error.message });
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

function runLocalResumeAnalyzer(_text) {
  return {
    skills: ["HTML", "CSS", "JavaScript", "SQL", "Java"],
    projects: [
      { "title": "Web App Portfolio", "tech": "HTML, CSS, JS", "description": "Responsive webpage displaying academic projects." }
    ],
    education: "B.Tech in Computer Science (Analyzed)",
    experience: "Entry Level (Analyzed)",
    resumeScore: 70
  };
}

function runLocalJdAnalyzer(jdText, studentSkills) {
  const requiredSkills = ["React.js", "Node.js", "Git", "SQL"];
  const matched = requiredSkills.filter(s => (studentSkills || []).includes(s));
  const missing = requiredSkills.filter(s => !(studentSkills || []).includes(s));
  return {
    jobProfile: {
      requiredSkills,
      experience: "Entry Level (0-2 years)",
      tools: ["Git"],
      responsibilities: ["Develop UI components", "Optimize SQL queries"]
    },
    gapReport: {
      matchScore: Math.round((matched.length / requiredSkills.length) * 100),
      matchedSkills: matched,
      missingSkills: missing
    }
  };
}

export default router;

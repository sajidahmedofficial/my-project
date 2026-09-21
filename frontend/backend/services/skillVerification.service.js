// agent-notes: { ctx: "Skill Verification Assessment service with server-held answer keys, question sanitization, and authoritative scoring", deps: ["../models/SkillAssessment.js"], state: "active", last: "anti@2026-08-20" }
import mongoose from 'mongoose';
import SkillAssessment from '../models/SkillAssessment.js';

// Canonical Question Bank with Hidden Server-Side Correct Answers
export const SKILL_QUESTION_BANK = {
  "React.js": [
    {
      questionId: "q_react_1",
      question: "Why should state updates depending on previous state use functional updates `setCount(prev => prev + 1)` in React?",
      options: [
        { key: "A", text: "To guarantee state updates use the latest state value regardless of batching or asynchronous closures" },
        { key: "B", text: "It forces an immediate synchronous DOM repaint" },
        { key: "C", text: "Functional updates automatically save state to localStorage" },
        { key: "D", text: "It prevents components from ever re-rendering" }
      ],
      correctAnswer: "A"
    },
    {
      questionId: "q_react_2",
      question: "What is the primary purpose of the dependency array in the `useEffect` hook?",
      options: [
        { key: "A", text: "Controls when the effect re-runs based on changed variable references across renders" },
        { key: "B", text: "Defines the CSS styles applied to the component" },
        { key: "C", text: "Imports external libraries asynchronously" },
        { key: "D", text: "Binds methods to the component class instance" }
      ],
      correctAnswer: "A"
    },
    {
      questionId: "q_react_3",
      question: "When should you use `useCallback` or `useMemo` in a React application?",
      options: [
        { key: "A", text: "On every single function and variable without exception" },
        { key: "B", text: "To optimize performance by memoizing expensive calculations or preventing unnecessary child re-renders with reference equality" },
        { key: "C", text: "To replace the need for Redux or Context API" },
        { key: "D", text: "Only when rendering HTML Canvas elements" }
      ],
      correctAnswer: "B"
    },
    {
      questionId: "q_react_4",
      question: "What problem does React Context primarily solve?",
      options: [
        { key: "A", text: "Prop drilling data through many layers of intermediate components" },
        { key: "B", text: "Direct SQL database connections from the browser" },
        { key: "C", text: "Server-side load balancing" },
        { key: "D", text: "Compressing image assets" }
      ],
      correctAnswer: "A"
    },
    {
      questionId: "q_react_5",
      question: "What is a key difference between controlled and uncontrolled form inputs in React?",
      options: [
        { key: "A", text: "Controlled inputs have their current value managed by React state, while uncontrolled inputs manage their own state via the DOM ref" },
        { key: "B", text: "Controlled inputs only accept numbers" },
        { key: "C", text: "Uncontrolled inputs cannot be submitted" },
        { key: "D", text: "Controlled inputs do not support onChange handlers" }
      ],
      correctAnswer: "A"
    }
  ],

  "Node.js": [
    {
      questionId: "q_node_1",
      question: "How does the Node.js event loop handle asynchronous I/O operations without blocking the main execution thread?",
      options: [
        { key: "A", text: "Delegates I/O tasks to the libuv thread pool while processing non-blocking callbacks in the event loop" },
        { key: "B", text: "Creates a new physical OS CPU thread for every incoming HTTP request" },
        { key: "C", text: "Pauses main thread execution until disk read completes" },
        { key: "D", text: "Uses synchronous socket polling exclusively" }
      ],
      correctAnswer: "A"
    },
    {
      questionId: "q_node_2",
      question: "Which Express.js middleware signature correctly defines an error-handling middleware?",
      options: [
        { key: "A", text: "(err, req, res, next)" },
        { key: "B", text: "(req, res, error)" },
        { key: "C", text: "(next, req, res)" },
        { key: "D", text: "(err, res)" }
      ],
      correctAnswer: "A"
    },
    {
      questionId: "q_node_3",
      question: "What is the purpose of Node.js `process.nextTick()`?",
      options: [
        { key: "A", text: "Schedules a callback to be executed immediately after the current operation completes, before the event loop continues" },
        { key: "B", text: "Waits exactly 1000 milliseconds" },
        { key: "C", text: "Restarts the server daemon" },
        { key: "D", text: "Flushes the database write log" }
      ],
      correctAnswer: "A"
    }
  ],

  "JavaScript": [
    {
      questionId: "q_js_1",
      question: "What is a JavaScript closure?",
      options: [
        { key: "A", text: "A function bundled together with references to its lexical environment, giving access to an outer function's scope from an inner function" },
        { key: "B", text: "A method to terminate browser execution" },
        { key: "C", text: "A syntax error that halts script execution" },
        { key: "D", text: "A type of database index" }
      ],
      correctAnswer: "A"
    },
    {
      questionId: "q_js_2",
      question: "What is the key difference between `==` (loose equality) and `===` (strict equality)?",
      options: [
        { key: "A", text: "`===` checks both value and type without type coercion, whereas `==` performs implicit type conversion before comparing" },
        { key: "B", text: "`==` is faster in all browsers" },
        { key: "C", text: "`===` is only for strings" },
        { key: "D", text: "There is no difference in modern ECMAScript" }
      ],
      correctAnswer: "A"
    },
    {
      questionId: "q_js_3",
      question: "How does `Promise.all()` behave if one of the promises rejects?",
      options: [
        { key: "A", text: "It immediately rejects with the reason of the first promise that rejected (fast-fail)" },
        { key: "B", text: "It waits for all other promises and ignores the error" },
        { key: "C", text: "It returns an array of nulls" },
        { key: "D", text: "It automatically retries the rejected promise 3 times" }
      ],
      correctAnswer: "A"
    }
  ],

  "TypeScript": [
    {
      questionId: "q_ts_1",
      question: "What is the primary difference between `type` and `interface` in TypeScript?",
      options: [
        { key: "A", text: "Interfaces can be extended via declaration merging, while type aliases cannot and are ideal for union/intersection primitives" },
        { key: "B", text: "Types only exist at runtime" },
        { key: "C", text: "Interfaces cannot describe object shapes" },
        { key: "D", text: "Interfaces are deprecated in TypeScript 5" }
      ],
      correctAnswer: "A"
    },
    {
      questionId: "q_ts_2",
      question: "Which TypeScript utility type constructs a type with all properties of T set to optional?",
      options: [
        { key: "A", text: "Partial<T>" },
        { key: "B", text: "Required<T>" },
        { key: "C", text: "Pick<T>" },
        { key: "D", text: "Omit<T>" }
      ],
      correctAnswer: "A"
    }
  ],

  "Docker": [
    {
      questionId: "q_docker_1",
      question: "What is the primary benefit of multi-stage Docker builds?",
      options: [
        { key: "A", text: "Reduces final image size by discarding intermediate build tools and SDK dependencies" },
        { key: "B", text: "Runs containers in multiple cloud regions simultaneously" },
        { key: "C", text: "Automatically encrypts database files" },
        { key: "D", text: "Eliminates the need for a Dockerfile" }
      ],
      correctAnswer: "A"
    },
    {
      questionId: "q_docker_2",
      question: "Which Docker command mounts a host directory into a running container for persistent data?",
      options: [
        { key: "A", text: "-v or --volume" },
        { key: "B", text: "--copy" },
        { key: "C", text: "--link" },
        { key: "D", text: "--port" }
      ],
      correctAnswer: "A"
    }
  ],

  "Next.js": [
    {
      questionId: "q_next_1",
      question: "In Next.js App Router, what is the default rendering behavior of React components?",
      options: [
        { key: "A", text: "React Server Components (RSC) rendered on the server unless marked with 'use client'" },
        { key: "B", text: "Client-side Single Page App (SPA) rendering" },
        { key: "C", text: "Static HTML export only" },
        { key: "D", text: "Web Worker rendering" }
      ],
      correctAnswer: "A"
    },
    {
      questionId: "q_next_2",
      question: "How do Server Actions in Next.js handle form mutations?",
      options: [
        { key: "A", text: "Execute directly on the server and trigger automatic revalidation of cache tags or paths" },
        { key: "B", text: "Execute as client-side localStorage transactions" },
        { key: "C", text: "Require a standalone microservice container" },
        { key: "D", text: "Convert forms to WebSocket streams" }
      ],
      correctAnswer: "A"
    }
  ]
};

// In-Memory Assessment Store
export const activeAssessmentSessions = new Map();

/**
 * Get sanitized questions for a skill (correct answers stripped)
 */
export function getSanitizedQuestionsForSkill(skillName, userId = "guest_user") {
  const normKey = Object.keys(SKILL_QUESTION_BANK).find(k => k.toLowerCase() === skillName?.toLowerCase()) || "React.js";
  const bank = SKILL_QUESTION_BANK[normKey] || SKILL_QUESTION_BANK["React.js"];

  const assessmentId = `asmt_${normKey.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  // Strip correctAnswer field before sending to client!
  const sanitizedQuestions = bank.map(q => ({
    questionId: q.questionId,
    question: q.question,
    options: q.options
  }));

  // Store server-side answer key in active sessions
  const answerMap = {};
  bank.forEach(q => {
    answerMap[q.questionId] = q.correctAnswer;
  });

  activeAssessmentSessions.set(assessmentId, {
    assessmentId,
    skillName: normKey,
    userId,
    answerMap,
    totalQuestions: bank.length,
    createdAt: new Date()
  });

  return {
    assessmentId,
    skillName: normKey,
    totalQuestions: bank.length,
    questions: sanitizedQuestions
  };
}

/**
 * Authoritatively evaluates submitted MCQ answers on the backend
 */
export async function evaluateMcqSubmission({ assessmentId, skillName, userId = "guest_user", answers = [], passingThreshold = 75 }) {
  let targetBank = null;
  let answerMap = null;

  // 1. Check active session
  if (assessmentId && activeAssessmentSessions.has(assessmentId)) {
    const session = activeAssessmentSessions.get(assessmentId);
    answerMap = session.answerMap;
    targetBank = SKILL_QUESTION_BANK[session.skillName];
  }

  // 2. Fallback to canonical bank by skillName
  if (!answerMap) {
    const normKey = Object.keys(SKILL_QUESTION_BANK).find(k => k.toLowerCase() === skillName?.toLowerCase()) || "React.js";
    targetBank = SKILL_QUESTION_BANK[normKey] || SKILL_QUESTION_BANK["React.js"];
    answerMap = {};
    targetBank.forEach(q => {
      answerMap[q.questionId] = q.correctAnswer;
    });
  }

  const totalQuestions = targetBank ? targetBank.length : (answers.length || 1);
  let correctCount = 0;
  const breakdown = [];

  // Compare submitted answers with backend stored correct answers
  (answers || []).forEach(sub => {
    const qId = sub.questionId;
    const submittedAnswer = typeof sub.answer === 'number' 
      ? (sub.answer === 0 ? "A" : sub.answer === 1 ? "B" : sub.answer === 2 ? "C" : "D")
      : String(sub.answer || '').trim().toUpperCase();

    const expected = answerMap[qId] || (targetBank && targetBank[breakdown.length]?.correctAnswer) || "A";
    const isCorrect = submittedAnswer === expected;

    if (isCorrect) {
      correctCount++;
    }

    breakdown.push({
      questionId: qId,
      userAnswer: submittedAnswer,
      correctAnswer: expected,
      isCorrect
    });
  });

  // Calculate official server score
  const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const wrongCount = Math.max(0, totalQuestions - correctCount);
  const isPassed = score >= passingThreshold;
  const status = isPassed ? "PASSED" : "FAILED";

  // Persist result in MongoDB if connected
  if (mongoose.connection.readyState === 1) {
    try {
      await SkillAssessment.create({
        userId,
        skillName: skillName || "React.js",
        mcqScore: score,
        codingScore: 0,
        projectScore: 0,
        overallScore: score,
        passingThreshold,
        status: isPassed ? 'PASSED' : 'FAILED',
        detailedBreakdown: {
          mcqCorrect: correctCount,
          mcqTotal: totalQuestions,
          codeTestsPassed: 0,
          codeTestsTotal: 0,
          projectCriteriaMet: []
        }
      });
    } catch (dbErr) {
      console.warn("MongoDB SkillAssessment save warning:", dbErr.message);
    }
  }

  return {
    assessmentId: assessmentId || `asmt_${Date.now()}`,
    skillName: skillName || "React.js",
    userId,
    score,
    correctCount,
    wrongCount,
    totalQuestions,
    passingThreshold,
    status,
    isPassed,
    breakdown,
    evaluatedAt: new Date().toISOString()
  };
}

export default {
  SKILL_QUESTION_BANK,
  getSanitizedQuestionsForSkill,
  evaluateMcqSubmission
};

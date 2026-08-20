// agent-notes: { ctx: "Personalized multi-stage Roadmap Generator service with Gemini AI structured generation, MCQs, coding challenges, and capstone blueprints", deps: ["../ai/gemini.js", "./skillGap.service.js"], state: "active", last: "anti@2026-08-20" }
import { analyzeJSON } from "../ai/gemini.js";
import { normalizeSkillName } from "./skillGap.service.js";

// Curated curriculum blueprints for popular skills
const SKILL_CURRICULUM_BLUEPRINTS = {
  "React.js": {
    prerequisites: ["JavaScript (ES6+)", "HTML5 / DOM", "CSS3 / Flexbox"],
    estimatedHours: 25,
    stages: [
      {
        stageNumber: 1,
        title: "Stage 1: React Fundamentals & Component Architecture",
        level: "Beginner",
        topics: ["JSX Syntax & Rules", "Functional Components", "Props & Dynamic Rendering", "Event Handling"],
        practiceTasks: ["Build an interactive Profile Card component", "Pass dynamic prop lists from Parent to Child components"],
        miniProject: "Interactive User Directory with Live Search Filter"
      },
      {
        stageNumber: 2,
        title: "Stage 2: State Management & Hooks Mastery",
        level: "Intermediate",
        topics: ["useState Hook for Local State", "useEffect for Side Effects & Lifecycle", "Controlled Form Inputs", "Lifting State Up"],
        practiceTasks: ["Create a controlled multi-step checkout form", "Fetch JSON placeholder posts and render with loading states"],
        miniProject: "TaskFlow Kanban Board with Local Storage Persistence"
      },
      {
        stageNumber: 3,
        title: "Stage 3: Advanced Patterns, Context & Production Deployment",
        level: "Advanced",
        topics: ["useContext & Global State", "Custom Hooks Architecture", "React Router DOM & Route Guards", "Performance Optimization with useMemo/useCallback"],
        practiceTasks: ["Implement Dark/Light theme toggle using React Context", "Create custom useFetch hook with retry logic"],
        miniProject: "Full React Job & Internship Portal with Authentication"
      }
    ],
    mcqs: [
      {
        question: "What is the primary purpose of the useEffect hook in React?",
        options: ["To create state variables", "To perform side effects like data fetching or DOM mutations", "To render JSX directly", "To style components"],
        correctAnswer: 1
      },
      {
        question: "Why should state never be mutated directly in React?",
        options: ["It causes syntax errors", "React relies on immutability to detect state changes and trigger re-renders", "It deletes component props", "Direct mutation is only allowed in classes"],
        correctAnswer: 1
      }
    ],
    codingChallenges: [
      {
        title: "Controlled Counter with Bounds",
        description: "Implement a counter hook that prevents the count from exceeding max or falling below min.",
        starterCode: "function useBoundedCounter(initial, min, max) {\n  // Implement logic\n}"
      }
    ],
    finalProject: {
      title: "Build a Production React Job Portal with Live Filters & Search",
      description: "Full-fledged React single page application with routing, global state, API integrations, and responsive UI."
    }
  },
  "TypeScript": {
    prerequisites: ["JavaScript Fundamentals"],
    estimatedHours: 20,
    stages: [
      {
        stageNumber: 1,
        title: "Stage 1: Primitive Types, Type Inference & Interfaces",
        level: "Beginner",
        topics: ["Type Annotations & Inferences", "Interfaces vs Type Aliases", "Union & Literal Types", "Function Signatures"],
        practiceTasks: ["Define strict TypeScript interfaces for User and Product models", "Write typed helper utility functions"],
        miniProject: "Typed In-Memory Data Store"
      },
      {
        stageNumber: 2,
        title: "Stage 2: Generics & Advanced Type System",
        level: "Intermediate",
        topics: ["Generic Functions & Classes", "Utility Types (Partial, Pick, Omit, Record)", "Type Guards & Narrowing", "Keyof & Mapped Types"],
        practiceTasks: ["Write a generic API response wrapper function", "Create safe type assertions and custom type predicates"],
        miniProject: "Typed HTTP Client Utility with Automatic Schema Validation"
      },
      {
        stageNumber: 3,
        title: "Stage 3: React + TypeScript Production Architecture",
        level: "Advanced",
        topics: ["Typing React Props & State", "Generic Components", "Typing Event Handlers & Refs", "Strict Compiler Settings (tsconfig.json)"],
        practiceTasks: ["Migrate a legacy JS component to strict TypeScript", "Type complex form event handlers and hook returns"],
        miniProject: "Production Enterprise Dashboard with Typed Context & Custom Hooks"
      }
    ],
    mcqs: [
      {
        question: "Which TypeScript keyword is used to create a type that cannot be reassigned?",
        options: ["readonly", "static", "const", "final"],
        correctAnswer: 0
      }
    ],
    codingChallenges: [
      {
        title: "Generic Array Filter",
        description: "Write a type-safe generic filter function that accepts an array of type T and a predicate returning boolean.",
        starterCode: "function safeFilter<T>(arr: T[], predicate: (item: T) => boolean): T[] {\n  // Implement logic\n}"
      }
    ],
    finalProject: {
      title: "Type-Safe Component Design System",
      description: "Reusable UI component library built with strict TypeScript generics and comprehensive unit tests."
    }
  },
  "Next.js": {
    prerequisites: ["React.js", "TypeScript basics"],
    estimatedHours: 25,
    stages: [
      {
        stageNumber: 1,
        title: "Stage 1: App Router & Server Components",
        level: "Beginner",
        topics: ["App Router File Conventions", "Server vs Client Components", "Layouts & Nested Routes", "Link & Image Optimization"],
        practiceTasks: ["Create a multi-page routing structure using App Router", "Implement optimized responsive images"],
        miniProject: "Modern Tech Blog with Static Route Generation"
      },
      {
        stageNumber: 2,
        title: "Stage 2: Data Fetching, Server Actions & Caching",
        level: "Intermediate",
        topics: ["Server Actions for Form Submissions", "fetch() Caching & Revalidation", "Dynamic Route Parameters", "Route Handlers (API Endpoints)"],
        practiceTasks: ["Implement server action mutation with revalidatePath", "Create a Next.js REST API route handler"],
        miniProject: "Full-Stack E-Commerce Product Showcase with Server Actions"
      },
      {
        stageNumber: 3,
        title: "Stage 3: Authentication, SEO & Production Deployment",
        level: "Advanced",
        topics: ["Middleware Authentication Guard", "Metadata API for SEO", "Vercel Edge Deployment", "Environment Variables & Rate Limiting"],
        practiceTasks: ["Set up Next.js middleware checking auth tokens", "Configure dynamic OpenGraph metadata tags"],
        miniProject: "Production SaaS Landing & Dashboard Platform with Next.js"
      }
    ],
    mcqs: [
      {
        question: "In Next.js App Router, which directive marks a component to execute on the client?",
        options: ["'use client'", "'use client-side'", "'use dom'", "'client-only'"],
        correctAnswer: 0
      }
    ],
    codingChallenges: [
      {
        title: "Next.js Route Handler",
        description: "Create a route handler returning JSON response with custom HTTP status code.",
        starterCode: "import { NextResponse } from 'next/server';\nexport async function GET() {\n  // Return Response\n}"
      }
    ],
    finalProject: {
      title: "Full-Stack Next.js AI Career Platform",
      description: "Server-rendered SaaS application with App Router, server actions, authentication, and Vercel cloud deployment."
    }
  },
  "Docker": {
    prerequisites: ["Basic Linux Commands", "Web Development basics"],
    estimatedHours: 15,
    stages: [
      {
        stageNumber: 1,
        title: "Stage 1: Containers, Images & Docker CLI",
        level: "Beginner",
        topics: ["Containers vs Virtual Machines", "Docker Architecture & Daemon", "Docker CLI (run, ps, stop, exec)", "Port Forwarding & Volumes"],
        practiceTasks: ["Run Nginx and Node containers locally with port mapping", "Mount local files into running container via volumes"],
        miniProject: "Containerized Static Web Server"
      },
      {
        stageNumber: 2,
        title: "Stage 2: Writing Production Dockerfiles",
        level: "Intermediate",
        topics: ["Dockerfile Directives (FROM, WORKDIR, COPY, CMD)", "Multi-Stage Builds for Size Optimization", ".dockerignore Best Practices", "Container Security & Non-root Users"],
        practiceTasks: ["Write a multi-stage Dockerfile for a React/Node app reducing image size by 70%", "Run healthchecks on containers"],
        miniProject: "Optimized Multi-Stage Containerized Web App"
      },
      {
        stageNumber: 3,
        title: "Stage 3: Docker Compose & Microservice Orchestration",
        level: "Advanced",
        topics: ["Docker Compose YAML Syntax", "Multi-Container Networks", "Database Service Containers with Persistent Volumes", "Deploying to Cloud ECS / Kubernetes"],
        practiceTasks: ["Create docker-compose.yml linking Frontend, Backend, and MongoDB", "Configure container restart policies and environment files"],
        miniProject: "Full-Stack Multi-Container Orchestration with Docker Compose"
      }
    ],
    mcqs: [
      {
        question: "Which Dockerfile instruction specifies the base image to build upon?",
        options: ["BASE", "FROM", "ORIGIN", "IMAGE"],
        correctAnswer: 1
      }
    ],
    codingChallenges: [
      {
        title: "Dockerfile Multi-Stage",
        description: "Write Dockerfile instructions for building a lightweight Node.js production image.",
        starterCode: "# Write Dockerfile stages\nFROM node:20-alpine AS build"
      }
    ],
    finalProject: {
      title: "Automated Multi-Service Containerized Deployment",
      description: "Production Docker Compose architecture connecting React client, Express API, MongoDB database, and Redis cache."
    }
  }
};

/**
 * Generate structured roadmap for a specific skill and target role using backend AI
 */
export async function generatePersonalizedRoadmap({
  skillName,
  targetRole = "Frontend Developer",
  currentLevel = "Beginner",
  targetLevel = "Advanced",
  priority = "High"
}) {
  const canonicalSkill = normalizeSkillName(skillName);
  const blueprint = SKILL_CURRICULUM_BLUEPRINTS[canonicalSkill];

  if (blueprint) {
    return {
      skillName: canonicalSkill,
      targetRole,
      currentLevel,
      targetLevel,
      priority,
      prerequisites: blueprint.prerequisites,
      estimatedLearningHours: blueprint.estimatedHours,
      stages: blueprint.stages,
      mcqs: blueprint.mcqs || [],
      codingChallenges: blueprint.codingChallenges || [],
      finalProject: blueprint.finalProject,
      finalAssessment: {
        mcqCount: 10,
        codingCount: 2,
        passingThreshold: 75
      },
      overallProgress: 0,
      status: "IN_PROGRESS",
      generatedAt: new Date().toISOString()
    };
  }

  // Use Central Gemini API integration
  const prompt = `You are a Principal Software Engineering Educator and Curriculum Architect.
Generate a rigorous 3-stage personalized learning roadmap for learning "${canonicalSkill}" for the role of "${targetRole}".
Current Level: "${currentLevel}". Target Level: "${targetLevel}".

Return ONLY a JSON object with this EXACT structure:
{
  "skillName": "${canonicalSkill}",
  "targetRole": "${targetRole}",
  "currentLevel": "${currentLevel}",
  "targetLevel": "${targetLevel}",
  "priority": "${priority}",
  "prerequisites": ["Prerequisite 1", "Prerequisite 2"],
  "estimatedLearningHours": 20,
  "stages": [
    {
      "stageNumber": 1,
      "title": "Stage 1: ${canonicalSkill} Fundamentals & Core Syntax",
      "level": "Beginner",
      "topics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
      "practiceTasks": ["Task 1", "Task 2"],
      "miniProject": "Beginner Project Title & Scope"
    },
    {
      "stageNumber": 2,
      "title": "Stage 2: Core Patterns & Real-World Application",
      "level": "Intermediate",
      "topics": ["Topic 5", "Topic 6", "Topic 7", "Topic 8"],
      "practiceTasks": ["Task 3", "Task 4"],
      "miniProject": "Intermediate Project Title & Scope"
    },
    {
      "stageNumber": 3,
      "title": "Stage 3: Production Architecture, Optimization & Testing",
      "level": "Advanced",
      "topics": ["Topic 9", "Topic 10", "Topic 11", "Topic 12"],
      "practiceTasks": ["Task 5", "Task 6"],
      "miniProject": "Advanced Project Title & Scope"
    }
  ],
  "mcqs": [
    {
      "question": "Question testing fundamental knowledge of ${canonicalSkill}?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0
    }
  ],
  "codingChallenges": [
    {
      "title": "${canonicalSkill} Practical Problem",
      "description": "Problem description",
      "starterCode": "// Starter code here"
    }
  ],
  "finalProject": {
    "title": "Production ${canonicalSkill} Full-Stack Application",
    "description": "Comprehensive capstone project integrating ${canonicalSkill} with clean architecture and tests."
  },
  "finalAssessment": {
    "mcqCount": 10,
    "codingCount": 2,
    "passingThreshold": 75
  }
}`;

  try {
    const aiResult = await analyzeJSON(prompt);
    if (aiResult && Array.isArray(aiResult.stages) && aiResult.stages.length > 0) {
      return {
        ...aiResult,
        skillName: canonicalSkill,
        overallProgress: 0,
        status: "IN_PROGRESS",
        generatedAt: new Date().toISOString()
      };
    }
  } catch (err) {
    console.warn(`Gemini AI roadmap generation for ${canonicalSkill} error:`, err.message);
  }

  // Fallback blueprint
  return {
    skillName: canonicalSkill,
    targetRole,
    currentLevel,
    targetLevel,
    priority,
    prerequisites: ["Core Computer Science Fundamentals", "Modern Web Architecture"],
    estimatedLearningHours: 20,
    stages: [
      {
        stageNumber: 1,
        title: `Stage 1: ${canonicalSkill} Fundamentals & Core Syntax`,
        level: "Beginner",
        topics: [`Core ${canonicalSkill} Syntax & Setup`, `Standard Library & Idioms`, `Data Structures & Flow Control`],
        practiceTasks: [`Write basic ${canonicalSkill} boilerplate scripts`, `Solve algorithmic challenges using ${canonicalSkill}`],
        miniProject: `${canonicalSkill} Starter Utility Script`
      },
      {
        stageNumber: 2,
        title: `Stage 2: ${canonicalSkill} Application Architecture & Error Handling`,
        level: "Intermediate",
        topics: [`Modular Architecture in ${canonicalSkill}`, `Asynchronous Workflows & Exception Handling`, `Testing & Debugging Strategies`],
        practiceTasks: [`Write unit tests with mock fixtures for ${canonicalSkill}`, `Implement robust error-recovery middleware`],
        miniProject: `${canonicalSkill} Production Microservice`
      },
      {
        stageNumber: 3,
        title: `Stage 3: Production Mastery, Optimization & Cloud Integration`,
        level: "Advanced",
        topics: [`Performance Tuning & Memory Profiling`, `Security Hardening & Best Practices`, `CI/CD Automation & Deployment`],
        practiceTasks: [`Benchmark performance and eliminate bottlenecks in ${canonicalSkill}`, `Configure automated GitHub Actions pipeline`],
        miniProject: `Enterprise ${canonicalSkill} Production Application`
      }
    ],
    mcqs: [
      {
        question: `What is a primary architectural best practice when developing with ${canonicalSkill}?`,
        options: ["Writing monolithic scripts", "Maintaining modular, testable components with error handling", "Ignoring types and testing", "Disabling production logging"],
        correctAnswer: 1
      }
    ],
    codingChallenges: [
      {
        title: `${canonicalSkill} Implementation Challenge`,
        description: `Implement a modular function in ${canonicalSkill} that processes data with error validation.`,
        starterCode: `// Implement ${canonicalSkill} function\nfunction processData(input) {\n  // Logic\n}`
      }
    ],
    finalProject: {
      title: `Full-Featured ${canonicalSkill} Cloud Application`,
      description: `Production-ready application implementing ${canonicalSkill} with automated tests, security checks, and cloud deployment.`
    },
    finalAssessment: { mcqCount: 10, codingCount: 2, passingThreshold: 75 },
    overallProgress: 0,
    status: "IN_PROGRESS",
    generatedAt: new Date().toISOString()
  };
}

export default {
  generatePersonalizedRoadmap
};

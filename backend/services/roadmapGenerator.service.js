// agent-notes: { ctx: "Personalized multi-stage Roadmap Generator service creating dynamic tasks, projects & assessment milestones", deps: ["@google/generative-ai"], state: "active", last: "anti@2026-08-20" }
import { GoogleGenerativeAI } from '@google/generative-ai';

const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenerativeAI(apiKey);
};

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
    finalProject: {
      title: "Full-Stack Next.js AI Career Platform",
      description: "Server-rendered SaaS application with App Router, server actions, authentication, and Vercel cloud deployment."
    }
  },
  "Node.js": {
    prerequisites: ["JavaScript ES6+", "Asynchronous Programming (Promises, async/await)"],
    estimatedHours: 25,
    stages: [
      {
        stageNumber: 1,
        title: "Stage 1: Node Core, Modules & Asynchronous I/O",
        level: "Beginner",
        topics: ["Event Loop Architecture", "CommonJS vs ESM Modules", "File System (fs) & Path Modules", "Creating Native HTTP Servers"],
        practiceTasks: ["Build a CLI file organizer using Node fs module", "Create a basic HTTP server returning JSON"],
        miniProject: "Command-Line File Analyzer & Logger"
      },
      {
        stageNumber: 2,
        title: "Stage 2: Express.js Framework & Middleware",
        level: "Intermediate",
        topics: ["Express App Setup", "Middleware Stack & Pipeline", "Routing & Controllers", "Error Handling Middleware"],
        practiceTasks: ["Build a custom rate-limiting and request-logging middleware", "Structure clean router modules for CRUD"],
        miniProject: "RESTful API Server with Input Validation (Joi/Zod)"
      },
      {
        stageNumber: 3,
        title: "Stage 3: Databases, Authentication & Production Deployment",
        level: "Advanced",
        topics: ["Database Integration (MongoDB / PostgreSQL)", "JWT & Bcrypt Authentication", "Environment Configuration (.env)", "Dockerization & Cloud Deploy"],
        practiceTasks: ["Implement secure JWT login and protected route guards", "Connect Mongoose / Prisma ORM with connection pooling"],
        miniProject: "Production Microservice Backend with MongoDB & JWT Auth"
      }
    ],
    finalProject: {
      title: "Enterprise REST API Backend Service",
      description: "Robust Express backend service featuring token authentication, database persistence, unit tests, and Docker support."
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
        topics: ["Docker Compose YAML Syntax", "Multi-Container Networks", "Database Service Containers with Persistent Volumes", "Deploying to AWS ECS / Render"],
        practiceTasks: ["Create docker-compose.yml linking Frontend, Backend, and MongoDB", "Configure container restart policies and environment files"],
        miniProject: "Full-Stack Multi-Container Orchestration with Docker Compose"
      }
    ],
    finalProject: {
      title: "Automated Multi-Service Containerized Deployment",
      description: "Production Docker Compose architecture connecting React client, Express API, MongoDB database, and Redis cache."
    }
  }
};

/**
 * Generate structured roadmap for a specific skill and target role
 */
export async function generatePersonalizedRoadmap({ skillName, targetRole = "Frontend Developer", currentLevel = "Beginner", targetLevel = "Advanced", priority = "High" }) {
  const blueprint = SKILL_CURRICULUM_BLUEPRINTS[skillName];

  if (blueprint) {
    return {
      skillName,
      targetRole,
      currentLevel,
      targetLevel,
      priority,
      prerequisites: blueprint.prerequisites,
      estimatedLearningHours: blueprint.estimatedHours,
      stages: blueprint.stages,
      finalProject: blueprint.finalProject,
      assessmentInfo: {
        mcqCount: 10,
        codingCount: 2,
        passingThreshold: 75
      },
      overallProgress: 0,
      status: "IN_PROGRESS"
    };
  }

  // Generative AI or Generic Blueprint Fallback
  const ai = getGenAI();
  if (ai) {
    try {
      const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `Generate a rigorous 3-stage personalized learning roadmap for learning "${skillName}" as a ${targetRole}.
Target Level: ${targetLevel}.
Return JSON matching this exact structure:
{
  "skillName": "${skillName}",
  "targetRole": "${targetRole}",
  "currentLevel": "${currentLevel}",
  "targetLevel": "${targetLevel}",
  "priority": "${priority}",
  "prerequisites": ["Prereq 1", "Prereq 2"],
  "estimatedLearningHours": 20,
  "stages": [
    {
      "stageNumber": 1,
      "title": "Stage 1: ${skillName} Fundamentals & Core Syntax",
      "level": "Beginner",
      "topics": ["Topic 1", "Topic 2", "Topic 3"],
      "practiceTasks": ["Task 1", "Task 2"],
      "miniProject": "Beginner Project Name & Brief"
    },
    {
      "stageNumber": 2,
      "title": "Stage 2: Core Patterns & Real-World Implementation",
      "level": "Intermediate",
      "topics": ["Topic 4", "Topic 5", "Topic 6"],
      "practiceTasks": ["Task 3", "Task 4"],
      "miniProject": "Intermediate Project Name & Brief"
    },
    {
      "stageNumber": 3,
      "title": "Stage 3: Advanced Architecture & Production Mastery",
      "level": "Advanced",
      "topics": ["Topic 7", "Topic 8", "Topic 9"],
      "practiceTasks": ["Task 5", "Task 6"],
      "miniProject": "Advanced Project Name & Brief"
    }
  ],
  "finalProject": {
    "title": "Production ${skillName} Application",
    "description": "Comprehensive capstone project description"
  },
  "assessmentInfo": { "mcqCount": 10, "codingCount": 2, "passingThreshold": 75 },
  "overallProgress": 0,
  "status": "IN_PROGRESS"
}`;

      const res = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      });

      const parsed = JSON.parse(res.response.text());
      if (parsed && Array.isArray(parsed.stages)) {
        return parsed;
      }
    } catch (err) {
      console.warn(`Gemini AI roadmap generation for ${skillName} fallback:`, err.message);
    }
  }

  // Generic fallback blueprint
  return {
    skillName,
    targetRole,
    currentLevel,
    targetLevel,
    priority,
    prerequisites: ["Core Computer Science Fundamentals"],
    estimatedLearningHours: 20,
    stages: [
      {
        stageNumber: 1,
        title: `Stage 1: ${skillName} Fundamentals & Core Syntax`,
        level: "Beginner",
        topics: [`Core ${skillName} Syntax & Setup`, `Standard Library & Idioms`, `Data Structures & Flow Control`],
        practiceTasks: [`Write basic ${skillName} boilerplate scripts`, `Solve 5 algorithmic challenges using ${skillName}`],
        miniProject: `${skillName} Starter Utility Script`
      },
      {
        stageNumber: 2,
        title: `Stage 2: ${skillName} Application Architecture & Error Handling`,
        level: "Intermediate",
        topics: [`Modular Architecture in ${skillName}`, `Asynchronous Workflows & Exception Handling`, `Testing & Debugging Strategies`],
        practiceTasks: [`Write unit tests with mock fixtures for ${skillName}`, `Implement robust error-recovery middleware`],
        miniProject: `${skillName} Production Microservice`
      },
      {
        stageNumber: 3,
        title: `Stage 3: Production Mastery, Optimization & Cloud Integration`,
        level: "Advanced",
        topics: [`Performance Tuning & Memory Profiling`, `Security Hardening & Best Practices`, `CI/CD Automation & Deployment`],
        practiceTasks: [`Benchmark performance and eliminate bottlenecks in ${skillName}`, `Configure automated GitHub Actions pipeline`],
        miniProject: `Enterprise ${skillName} Production Application`
      }
    ],
    finalProject: {
      title: `Full-Featured ${skillName} Cloud Application`,
      description: `Production-ready application implementing ${skillName} with automated tests, security checks, and cloud deployment.`
    },
    assessmentInfo: { mcqCount: 10, codingCount: 2, passingThreshold: 75 },
    overallProgress: 0,
    status: "IN_PROGRESS"
  };
}

export default {
  generatePersonalizedRoadmap
};

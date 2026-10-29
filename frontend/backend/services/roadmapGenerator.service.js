// agent-notes: { ctx: "Personalized multi-stage Roadmap Generator service with Gemini AI structured generation, MCQs, coding challenges, and capstone blueprints", deps: ["./geminiService.js", "./skillGap.service.js"], state: "active", last: "anti@2026-10-29" }
import { analyzeJSON } from "./geminiService.js";
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
  },
  "PostgreSQL": {
    prerequisites: ["SQL Basics", "Relational Database Concepts"],
    estimatedHours: 20,
    stages: [
      {
        stageNumber: 1,
        title: "Stage 1: PostgreSQL Setup, Schemas & DDL/DML Fundamentals",
        level: "Beginner",
        topics: ["PostgreSQL Installation & psql CLI", "Table Creation, Data Types & Constraints", "CRUD Operations (INSERT, SELECT, UPDATE, DELETE)", "Foreign Keys & Relational Integrity"],
        practiceTasks: ["Design and write DDL schema for a multi-tenant user database", "Write complex SELECT queries with filtering and pattern matching"],
        miniProject: "E-Commerce Relational Database Schema & Seeder"
      },
      {
        stageNumber: 2,
        title: "Stage 2: Advanced Queries, Joins, Indexing & Transactions",
        level: "Intermediate",
        topics: ["INNER, LEFT, RIGHT & FULL OUTER Joins", "B-Tree, GIN & GiST Indexes", "ACID Transactions & Row Locking (SELECT FOR UPDATE)", "Subqueries, CTEs & Window Functions"],
        practiceTasks: ["Optimize slow queries using B-Tree and composite indexes", "Implement transaction rollbacks for concurrent balance transfers"],
        miniProject: "Financial Ledger Database with Strict ACID Concurrency"
      },
      {
        stageNumber: 3,
        title: "Stage 3: Performance Tuning, EXPLAIN ANALYZE & Cloud Scaling",
        level: "Advanced",
        topics: ["EXPLAIN ANALYZE Query Plan Profiling", "Connection Pooling (PgBouncer)", "Partitioning & Sharding Large Tables", "Read Replicas, Backup & Disaster Recovery"],
        practiceTasks: ["Analyze query execution plans and eliminate sequential scans", "Configure table partitioning by range or date hash"],
        miniProject: "High-Throughput Analytics Warehouse with Table Partitioning"
      }
    ],
    mcqs: [
      {
        question: "Which index type in PostgreSQL is best suited for JSONB and full-text search columns?",
        options: ["B-Tree", "GIN (Generalized Inverted Index)", "Hash", "BRIN"],
        correctAnswer: 1
      }
    ],
    codingChallenges: [
      {
        title: "PostgreSQL Window Function Query",
        description: "Write a SQL query using DENSE_RANK() to calculate employee salary rankings per department.",
        starterCode: "-- Write PostgreSQL query\nSELECT department_id, employee_id, salary,\n       DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) as rank\nFROM employees;"
      }
    ],
    finalProject: {
      title: "Enterprise Multi-Tenant Relational Database Architecture",
      description: "Production-grade PostgreSQL schema with role-based access control, automated backups, connection pooling, and sub-millisecond query optimization."
    }
  },
  "Tailwind CSS": {
    prerequisites: ["HTML5", "CSS3 Fundamentals", "Responsive Design Basics"],
    estimatedHours: 15,
    stages: [
      {
        stageNumber: 1,
        title: "Stage 1: Utility-First Fundamentals & Box Model",
        level: "Beginner",
        topics: ["Utility-First Philosophy vs Semantic CSS", "Typography, Spacing & Sizing Utilities", "Color Palettes, Opacity & Gradients", "Borders, Rings & Shadows"],
        practiceTasks: ["Style an interactive pricing table using pure Tailwind utilities", "Create responsive hero section cards without custom CSS"],
        miniProject: "Modern SaaS Landing Page Hero & Feature Section"
      },
      {
        stageNumber: 2,
        title: "Stage 2: Flexbox, Grid, Pseudo-States & Dark Mode",
        level: "Intermediate",
        topics: ["Flexbox & CSS Grid Alignment", "Hover, Focus, Active & Group-Hover States", "Responsive Breakpoints (sm, md, lg, xl, 2xl)", "Dark Mode (class strategy & media strategy)"],
        practiceTasks: ["Build an adaptive navbar with mobile hamburger menu drawer", "Implement theme switcher toggling dark mode classes"],
        miniProject: "Responsive Analytics Dashboard with Dark Mode Toggle"
      },
      {
        stageNumber: 3,
        title: "Stage 3: Design Systems, Config, Plugins & JIT Engine",
        level: "Advanced",
        topics: ["tailwind.config.js Custom Tokens & Themes", "Custom Plugins & Utility Extensions", "Extracting Component Classes with @apply", "JIT Performance Optimization & Purging"],
        practiceTasks: ["Create a custom corporate color palette and typography plugin", "Optimize production bundle size using Tailwind JIT compilation"],
        miniProject: "Production Enterprise UI Component Design System"
      }
    ],
    mcqs: [
      {
        question: "How do you style a child element when hovering over its parent in Tailwind CSS?",
        options: ["parent:hover", "group-hover", "peer-hover", "hover:child"],
        correctAnswer: 1
      }
    ],
    codingChallenges: [
      {
        title: "Tailwind Responsive Grid Card",
        description: "Write Tailwind class names to create a card grid: 1 column on mobile, 2 on tablet, and 4 on desktop with 1rem gap.",
        starterCode: "<div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4\">\n  {/* Card items */}\n</div>"
      }
    ],
    finalProject: {
      title: "Comprehensive Tailwind SaaS Application UI",
      description: "Full-scale modern web application interface featuring complex data tables, animated modals, dynamic graphs, and full dark-mode support."
    }
  },
  "HTML5": {
    prerequisites: ["Basic Computer Literacy", "Web Browsing Principles"],
    estimatedHours: 12,
    stages: [
      {
        stageNumber: 1,
        title: "Stage 1: Semantic Document Architecture & Accessibility (a11y)",
        level: "Beginner",
        topics: ["Semantic Tags (header, nav, main, article, section, footer)", "Heading Hierarchy & Content Structure", "Web Accessibility (ARIA roles, alt attributes, landmarks)", "Hyperlinks, Anchors & Document Metadata"],
        practiceTasks: ["Refactor legacy div-soup into semantic HTML5 layout", "Conduct automated accessibility audits with zero ARIA errors"],
        miniProject: "Fully Accessible Semantic Documentation Portal"
      },
      {
        stageNumber: 2,
        title: "Stage 2: Forms, Native Validation & Rich Media",
        level: "Intermediate",
        topics: ["Modern Form Inputs (email, date, tel, number, range)", "Client-Side Form Validation Attributes (required, pattern, min/max)", "Audio & Video Elements with Custom Captions (track)", "HTML5 Canvas API for 2D Graphics"],
        practiceTasks: ["Build an interactive multi-field application form with native regex validation", "Embed responsive audio/video with accessibility subtitles"],
        miniProject: "Interactive Multi-Step Application Form with Validation"
      },
      {
        stageNumber: 3,
        title: "Stage 3: Advanced HTML5 APIs, Web Storage & SEO",
        level: "Advanced",
        topics: ["Web Storage API (localStorage, sessionStorage, IndexedDB)", "Geolocation, Drag and Drop & Clipboard APIs", "Search Engine Optimization (OpenGraph, Schema.org Microdata)", "Web Workers & Service Worker PWA Manifests"],
        practiceTasks: ["Implement offline note persistence using Web Storage", "Add rich OpenGraph metadata tags and Twitter Card schema"],
        miniProject: "Progressive Web App (PWA) Offline-Ready Portal"
      }
    ],
    mcqs: [
      {
        question: "Which HTML5 tag is the most semantically appropriate for self-contained, syndicatable content like a blog post or news item?",
        options: ["<section>", "<article>", "<div>", "<aside>"],
        correctAnswer: 1
      }
    ],
    codingChallenges: [
      {
        title: "Semantic Accessible Form",
        description: "Write an accessible HTML form with explicit label association and required email validation.",
        starterCode: "<form>\n  <label for=\"email\">Email Address</label>\n  <input type=\"email\" id=\"email\" name=\"email\" required aria-required=\"true\" />\n  <button type=\"submit\">Submit</button>\n</form>"
      }
    ],
    finalProject: {
      title: "W3C Standards-Compliant Responsive Web Application",
      description: "Complete accessible web portal adhering to WCAG 2.1 AA standards, featuring rich semantic tags, schema microdata, offline storage, and SEO optimization."
    }
  },
  "CSS3": {
    prerequisites: ["HTML5 Basics"],
    estimatedHours: 15,
    stages: [
      {
        stageNumber: 1,
        title: "Stage 1: CSS Selectors, Specificity & Box Model Mastery",
        level: "Beginner",
        topics: ["Universal, Class, ID & Attribute Selectors", "CSS Specificity Calculation & The Cascade", "Box Model: Content, Padding, Border, Margin & box-sizing: border-box", "Display Modes (block, inline, inline-block, none)"],
        practiceTasks: ["Build pixel-perfect card components solving margin collapse", "Calculate and resolve CSS selector specificity conflicts"],
        miniProject: "Pixel-Perfect Portfolio Card Showcase"
      },
      {
        stageNumber: 2,
        title: "Stage 2: Modern Layouts: Flexbox & CSS Grid",
        level: "Intermediate",
        topics: ["Flex Container & Item Alignment (justify-content, align-items, flex-grow)", "CSS Grid Track Sizing, fr Units, repeat() & minmax()", "Grid Template Areas & Auto-Placing Layouts", "Media Queries & Mobile-First Responsive Breakpoints"],
        practiceTasks: ["Create a 12-column responsive layout with CSS Grid", "Build a centered modal dialog with flexible button bars"],
        miniProject: "Complex Magazine Grid Layout with Responsive Breakpoints"
      },
      {
        stageNumber: 3,
        title: "Stage 3: Animations, Custom Properties & Next-Gen CSS",
        level: "Advanced",
        topics: ["CSS Custom Properties (Variables) & Theme Switching", "CSS Transitions & Keyframe Animations (@keyframes)", "Transforms (2D/3D translate, scale, rotate)", "Container Queries & Modern Pseudo-Classes (:has, :is, :where)"],
        practiceTasks: ["Build smooth 60fps micro-interaction hover and loading spinners", "Implement dynamic theme engine using CSS variables"],
        miniProject: "Interactive Animated Dashboard with Theme Customizer"
      }
    ],
    mcqs: [
      {
        question: "Which CSS property causes padding and border to be included within an element's total specified width and height?",
        options: ["box-sizing: content-box", "box-sizing: border-box", "overflow: hidden", "display: flow-root"],
        correctAnswer: 1
      }
    ],
    codingChallenges: [
      {
        title: "CSS Centering with Flexbox",
        description: "Write CSS rules to perfectly center child items horizontally and vertically inside a container.",
        starterCode: ".container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n}"
      }
    ],
    finalProject: {
      title: "Interactive Animated Design System Showcase",
      description: "Full-featured CSS3 design system with custom CSS variable themes, fluid typography, 3D card tilt effects, and responsive grid layouts."
    }
  },
  "FastAPI": {
    prerequisites: ["Python 3.8+ Fundamentals", "REST Concepts"],
    estimatedHours: 20,
    stages: [
      {
        stageNumber: 1,
        title: "Stage 1: FastAPI Core, Routing & Pydantic Validation",
        level: "Beginner",
        topics: ["FastAPI Setup & ASGI Uvicorn Server", "Path & Query Parameters with Type Hints", "Pydantic Request & Response Models", "Automatic Interactive OpenAPI / Swagger Documentation"],
        practiceTasks: ["Build a CRUD REST API with typed Pydantic models", "Enforce query validation rules with Query() and Path()"],
        miniProject: "Book Library REST API with Auto-Generated Swagger Docs"
      },
      {
        stageNumber: 2,
        title: "Stage 2: Dependency Injection, Async DB & Authentication",
        level: "Intermediate",
        topics: ["FastAPI Depends() Dependency Injection System", "Async Database Connections with SQLAlchemy 2.0 / Tortoise", "OAuth2 Password Flow & JWT Token Authentication", "HTTP Status Codes & Custom Exception Handlers"],
        practiceTasks: ["Implement secure user registration and login with bcrypt & JWT", "Create reusable database session dependencies using async with"],
        miniProject: "Secure User Auth & Profile Service with Async PostgreSQL"
      },
      {
        stageNumber: 3,
        title: "Stage 3: Background Tasks, WebSockets & Production Deployment",
        level: "Advanced",
        topics: ["BackgroundTasks for Async Job Processing", "Real-Time WebSocket Communication", "Middleware (CORS, Rate Limiting, Request Logging)", "Dockerization, Gunicorn Process Manager & Pytest Async Testing"],
        practiceTasks: ["Write async unit and integration tests using TestClient and pytest", "Create a real-time notification endpoint using WebSockets"],
        miniProject: "Production High-Performance Async Microservice"
      }
    ],
    mcqs: [
      {
        question: "What Python library does FastAPI use for data parsing, type validation, and serialization?",
        options: ["Marshmallow", "Pydantic", "Cerberus", "Django Forms"],
        correctAnswer: 1
      }
    ],
    codingChallenges: [
      {
        title: "FastAPI Endpoint with Pydantic Model",
        description: "Create a FastAPI POST endpoint '/items' that accepts an Item model and returns HTTP 201.",
        starterCode: "from fastapi import FastAPI, status\nfrom pydantic import BaseModel\n\napp = FastAPI()\n\nclass Item(BaseModel):\n    name: str\n    price: float\n\n@app.post('/items', status_code=status.HTTP_201_CREATED)\nasync def create_item(item: Item):\n    return item"
      }
    ],
    finalProject: {
      title: "Real-Time Enterprise Async Backend Service",
      description: "Full-featured FastAPI microservice featuring async database interactions, JWT authentication, background email queues, WebSocket live updates, and complete test suite."
    }
  },
  "MongoDB": {
    prerequisites: ["Basic Database Concepts", "JSON Format"],
    estimatedHours: 18,
    stages: [
      {
        stageNumber: 1,
        title: "Stage 1: Document Model, Collections & Mongo Shell CRUD",
        level: "Beginner",
        topics: ["NoSQL Concepts vs Relational Databases", "BSON Document Structure & ObjectIds", "Insert, Find, Update & Delete Commands in mongosh", "Query Operators ($gt, $in, $and, $or, $regex)"],
        practiceTasks: ["Perform complex document queries using logical and comparison operators", "Update nested document fields and arrays using $set and $push"],
        miniProject: "Content Management Document Store"
      },
      {
        stageNumber: 2,
        title: "Stage 2: Aggregation Pipeline & Indexing Strategies",
        level: "Intermediate",
        topics: ["Aggregation Stages ($match, $group, $project, $lookup, $unwind)", "Single-Field, Compound & Text Indexes", "Index Performance with explain('executionStats')", "Data Modeling Patterns (Embedding vs Referencing)"],
        practiceTasks: ["Build an aggregation pipeline calculating monthly revenue by category", "Create compound indexes eliminating in-memory sorting bottlenecks"],
        miniProject: "E-Commerce Analytics Engine with Aggregation Pipelines"
      },
      {
        stageNumber: 3,
        title: "Stage 3: Mongoose ODM, Transactions & Atlas Cloud Scaling",
        level: "Advanced",
        topics: ["Mongoose Schema Definition, Middleware & Virtuals", "Multi-Document ACID Transactions with Sessions", "Replica Sets, High Availability & Automated Failover", "MongoDB Atlas Cluster Configuration & Security Hardening"],
        practiceTasks: ["Write Mongoose pre-save hooks for password hashing", "Implement a multi-collection transaction with rollback on failure"],
        miniProject: "Scalable Multi-Tenant Document Database with Mongoose"
      }
    ],
    mcqs: [
      {
        question: "Which MongoDB aggregation stage is used to perform a left outer join to another collection?",
        options: ["$join", "$lookup", "$merge", "$combine"],
        correctAnswer: 1
      }
    ],
    codingChallenges: [
      {
        title: "MongoDB Aggregation Pipeline",
        description: "Write an aggregation pipeline array that filters for active users and calculates total order count by user ID.",
        starterCode: "const pipeline = [\n  { $match: { status: 'active' } },\n  { $group: { _id: '$userId', totalOrders: { $sum: 1 } } }\n];"
      }
    ],
    finalProject: {
      title: "High-Volume Real-Time Social Platform Database",
      description: "Enterprise MongoDB architecture featuring optimized compound indexes, automated multi-stage aggregations, Mongoose data modeling, and multi-document transactions."
    }
  },
  "REST API": {
    prerequisites: ["HTTP Protocol Basics", "JSON Data Format"],
    estimatedHours: 16,
    stages: [
      {
        stageNumber: 1,
        title: "Stage 1: HTTP Fundamentals, URI Design & Resource Modeling",
        level: "Beginner",
        topics: ["HTTP Verbs (GET, POST, PUT, PATCH, DELETE, OPTIONS)", "Standard HTTP Status Codes (2xx, 3xx, 4xx, 5xx)", "Resource-Oriented URI Naming Conventions", "Request & Response Headers (Content-Type, Authorization, Accept)"],
        practiceTasks: ["Design RESTful URL schemas for an e-commerce platform", "Map proper HTTP status codes to various API failure scenarios"],
        miniProject: "RESTful Resource Directory Specification"
      },
      {
        stageNumber: 2,
        title: "Stage 2: Pagination, Filtering, Auth & Error Contracts",
        level: "Intermediate",
        topics: ["Cursor vs Offset Pagination Strategies", "Query Parameter Filtering, Sorting & Field Selection", "Stateless Authentication (Bearer JWT & API Keys)", "Standardized RFC 7807 Error Response Payloads"],
        practiceTasks: ["Implement robust offset and cursor pagination with link headers", "Create centralized error middleware with RFC 7807 problem details"],
        miniProject: "Production REST API with Filtering, Sorting & Pagination"
      },
      {
        stageNumber: 3,
        title: "Stage 3: Security, OpenAPI Spec, Versioning & Rate Limiting",
        level: "Advanced",
        topics: ["OpenAPI 3.0 (Swagger) Specification Authoring", "API Versioning Strategies (URI, Header, Query Param)", "Rate Limiting, Throttling & DDoS Defense", "HTTP Caching (ETag, Cache-Control, Conditional Requests)"],
        practiceTasks: ["Generate OpenAPI documentation and interactive Mock server", "Configure Redis token-bucket rate limiter for public endpoints"],
        miniProject: "Enterprise API Gateway with Rate Limiting & Swagger"
      }
    ],
    mcqs: [
      {
        question: "Which HTTP method should be used to make a partial update to an existing resource?",
        options: ["PUT", "PATCH", "POST", "UPDATE"],
        correctAnswer: 1
      }
    ],
    codingChallenges: [
      {
        title: "RESTful Error Response Contract",
        description: "Write a JSON response adhering to RFC 7807 problem details for an invalid request parameter.",
        starterCode: "const errorResponse = {\n  type: 'https://example.com/errors/invalid-parameter',\n  title: 'Invalid Parameter',\n  status: 400,\n  detail: 'The email address provided is malformed.',\n  instance: '/api/v1/users'\n};"
      }
    ],
    finalProject: {
      title: "Enterprise Public REST API Gateway",
      description: "Robust public-facing REST API adhering to OpenAPI 3.0 specifications, complete with JWT authentication, Redis rate limiting, conditional caching, and comprehensive test suite."
    }
  },
  "Git": {
    prerequisites: ["Terminal / Command Line Basics"],
    estimatedHours: 12,
    stages: [
      {
        stageNumber: 1,
        title: "Stage 1: Git Core Architecture, Staging & Commits",
        level: "Beginner",
        topics: ["Working Directory, Staging Area & Repository (.git)", "Initializing, Cloning & Status (git init, clone, status)", "Commits, Diff & Commit Messages (git add, commit, diff, log)", "Branching & Switching (git branch, switch, checkout)"],
        practiceTasks: ["Initialize local repository and create atomic semantic commits", "Create and switch between feature and bugfix branches"],
        miniProject: "Multi-Branch Local Repository Workflow"
      },
      {
        stageNumber: 2,
        title: "Stage 2: Remote Collaboration, PRs & Resolving Conflicts",
        level: "Intermediate",
        topics: ["Remotes & Upstreams (git remote, push, fetch, pull)", "Pull Requests & GitHub/GitLab Collaboration Workflows", "Merge Strategies (Fast-forward, 3-way merge, Squash)", "Detecting, Understanding & Resolving Merge Conflicts"],
        practiceTasks: ["Simulate and resolve complex two-branch merge conflicts", "Create pull requests with squash merges maintaining clean history"],
        miniProject: "Collaborative Team Git Repository with Branch Protection"
      },
      {
        stageNumber: 3,
        title: "Stage 3: Interactive Rebase, Bisect, Hooks & Monorepo Workflows",
        level: "Advanced",
        topics: ["Interactive Rebase (git rebase -i: squash, edit, reword)", "Debugging with git bisect to find regression commits", "Git Stash, Worktrees & Submodules", "Client & Server Git Hooks (Husky, commitlint, pre-commit)"],
        practiceTasks: ["Clean up messy branch commit history using interactive rebase", "Configure Husky pre-commit hooks running lint and tests"],
        miniProject: "Automated Enterprise Git Flow with CI/CD Hooks"
      }
    ],
    mcqs: [
      {
        question: "Which command allows you to combine multiple commits into a single commit while preserving a clean Git history?",
        options: ["git merge --no-ff", "git rebase -i (squash)", "git branch -m", "git revert HEAD"],
        correctAnswer: 1
      }
    ],
    codingChallenges: [
      {
        title: "Git Command Workflow",
        description: "List the sequence of Git commands to create a new branch 'feature/login', stage changes, and commit with a message.",
        starterCode: "# Sequence of commands:\ngit checkout -b feature/login\ngit add .\ngit commit -m \"feat: implement login page\""
      }
    ],
    finalProject: {
      title: "Automated Enterprise Git Workflow & Pipeline",
      description: "Full production Git repository configured with branch protection rules, semantic release automation, automated linting via Husky hooks, and clean conventional commits."
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

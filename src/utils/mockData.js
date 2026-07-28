// Mock Data for SkillBridge AI Platform

export const RESUME_PRESETS = [
  {
    id: "preset-frontend",
    name: "Aarav Sharma - Frontend Enthusiast",
    description: "Academic score: 8.5 CGPA. Knows basic HTML/CSS/JS, lacks React, state management, and deployment tools.",
    skills: ["HTML", "CSS", "JavaScript", "SQL", "Java"],
    projects: [
      {
        title: "Personal Portfolio",
        tech: "HTML, CSS, JS",
        description: "A responsive portfolio website showcasing academic achievements and basic JavaScript widgets."
      },
      {
        title: "Basic Calculator",
        tech: "HTML, CSS, JS",
        description: "A calculator app with standard arithmetic functions and dark/light mode toggle."
      }
    ],
    education: "B.Tech in Computer Science - VIT (Graduating 2027)",
    experience: "Web Development Intern at local startup (2 Months)",
    scores: {
      resumeScore: 68,
      skillScore: 55,
      placementReadiness: 50,
      weeklyGoalsProgress: 33
    }
  },
  {
    id: "preset-backend",
    name: "Priya Patel - Backend Beginner",
    description: "Academic score: 8.9 CGPA. Knows Python and Java, lacks Node.js, databases, Docker, and system design.",
    skills: ["Python", "Java", "C++", "HTML"],
    projects: [
      {
        title: "Library Management System",
        tech: "Java, OOP",
        description: "Console-based application to manage books, patrons, and borrow/return transactions."
      }
    ],
    education: "B.E. in Information Technology - DTU (Graduating 2027)",
    experience: "None",
    scores: {
      resumeScore: 62,
      skillScore: 48,
      placementReadiness: 40,
      weeklyGoalsProgress: 0
    }
  },
  {
    id: "preset-fullstack",
    name: "Rohan Verma - Aspiring Full Stack Dev",
    description: "Academic score: 7.8 CGPA. Knows React and Node, needs MongoDB, security, AWS, and Mock interview preparation.",
    skills: ["React.js", "Node.js", "Express.js", "JavaScript", "HTML", "CSS", "Git"],
    projects: [
      {
        title: "Task Planner",
        tech: "React, LocalStorage",
        description: "Interactive task board with drag-and-drop features and priority filtering."
      },
      {
        title: "Rest API Server",
        tech: "Node.js, Express",
        description: "Mock REST API endpoints for user validation and product fetching."
      }
    ],
    education: "B.Tech in Computer Science - SRM University (Graduating 2026)",
    experience: "Freelance Frontend Dev (6 Months)",
    scores: {
      resumeScore: 82,
      skillScore: 75,
      placementReadiness: 72,
      weeklyGoalsProgress: 66
    }
  }
];

export const JOB_PRESETS = [
  {
    id: "job-google-frontend",
    company: "Google",
    title: "Associate Frontend Engineer",
    description: `About the role:
We are looking for a Frontend Engineer to build web interfaces that are beautiful, accessible, and fast.
Required Skills:
- Professional experience with JavaScript/TypeScript, HTML5, CSS3.
- Hands-on experience with modern frameworks, specifically React.js or Angular.
- Strong understanding of version control system Git.
- Exposure to responsive web design, state management (Redux/Zustand), and REST APIs.
- Familiarity with build tools (Vite, Webpack) and unit testing (Jest/Vitest) is a plus.`
  },
  {
    id: "job-amazon-sde",
    company: "Amazon",
    title: "Software Development Engineer - Backend",
    description: `About the role:
Amazon is seeking software engineers to design, build, and deploy highly scalable backend services.
Required Skills:
- Solid programming foundation in Java, Python, or C++.
- Hands-on experience with backend frameworks like Node.js (Express) or Spring Boot.
- Deep knowledge of SQL databases (PostgreSQL, MySQL) and NoSQL databases (MongoDB, DynamoDB).
- Understanding of Web Services / REST APIs and system architecture.
- Experience with AWS services (EC2, S3, Lambda) and version control (Git) is preferred.`
  },
  {
    id: "job-meta-fullstack",
    company: "Meta",
    title: "Full Stack Engineer (L3)",
    description: `About the role:
You will build full-stack interfaces, APIs, and data models to power next-generation social products.
Required Skills:
- Extensive knowledge of JavaScript (ES6+), React.js, Tailwind CSS.
- Sturdy backend experience using Node.js / Express.js.
- Strong database foundation, especially MongoDB, Redis, or PostgreSQL.
- Solid understanding of Git, RESTful API design, and cloud deployments (AWS, Vercel).
- Analytical mind with problem-solving skills in data structures and algorithms.`
  }
];

export const SKILL_LIBRARY = {
  "React.js": {
    category: "Frontend",
    description: "A popular open-source JavaScript library for building user interfaces, developed by Meta.",
    difficulty: "Medium",
    courses: [
      { name: "Scrimba: Learn React for Free", provider: "Scrimba", link: "https://scrimba.com/learn/learnreact" },
      { name: "React official documentation & tutorials", provider: "React.dev", link: "https://react.dev/learn" },
      { name: "Academind React Crash Course", provider: "YouTube", link: "https://www.youtube.com/watch?v=Dorf8i6lCuk" }
    ],
    weeks: [
      { title: "Week 1: React Basics", topics: ["JSX syntax", "Functional Components", "Props and rendering lists", "Handling events"] },
      { title: "Week 2: State & Hooks", topics: ["useState hook", "useEffect hook for side-effects", "Lifting state up", "Controlled components"] },
      { title: "Week 3: Context & Routing", topics: ["useContext hook for global state", "React Router DOM", "Nested routes", "Route guards"] },
      { title: "Week 4: Project building", topics: ["API integrations with Axios", "Build an interactive Dashboard", "Deploy on Vercel"] }
    ]
  },
  "Node.js": {
    category: "Backend",
    description: "An open-source, cross-platform JavaScript runtime environment that executes JS code outside a web browser.",
    difficulty: "Medium",
    courses: [
      { name: "FreeCodeCamp: Node.js & Express Course", provider: "FreeCodeCamp", link: "https://www.freecodecamp.org/news/free-node-js-course-2/" },
      { name: "Node.js Tutorial for Beginners", provider: "Mosh (YouTube)", link: "https://www.youtube.com/watch?v=TlB_eWDSMt4" }
    ],
    weeks: [
      { title: "Week 1: Node Core & File System", topics: ["Event loop mechanics", "Require vs Import modules", "FS module & path operations", "Http server creation"] },
      { title: "Week 2: Express.js Framework", topics: ["Express server setup", "Middleware stack architecture", "Router module", "Query & route parameters"] },
      { title: "Week 3: REST API Design", topics: ["HTTP methods (GET, POST, PUT, DELETE)", "JSON payloads & status codes", "Input validation (Joi/Zod)", "Error handling middleware"] },
      { title: "Week 4: Database Connection", topics: ["Connecting Mongo/SQL", "Environment config (.env)", "Deploying server on Render/Heroku"] }
    ]
  },
  "MongoDB": {
    category: "Database",
    description: "A source-available, document-oriented NoSQL database program, using JSON-like documents with schemas.",
    difficulty: "Easy",
    courses: [
      { name: "MongoDB University: Intro to MongoDB", provider: "MongoDB", link: "https://learn.mongodb.com/" },
      { name: "MongoDB Crash Course", provider: "Traversy Media", link: "https://www.youtube.com/watch?v=-56x56UppDU" }
    ],
    weeks: [
      { title: "Week 1: Document Concepts", topics: ["Collections and Documents", "BSON format", "Atlas cloud setup", "Compass UI tool"] },
      { title: "Week 2: CRUD Operations", topics: ["insertMany & find filters", "updateOperators ($set, $inc)", "deleteOne & deleteMany", "Field projections"] },
      { title: "Week 3: Mongoose ODM", topics: ["Mongoose Schemas", "Model compilation", "Data validation rules", "Virtual attributes & Hooks"] },
      { title: "Week 4: Relational Queries", topics: ["DB populate / Joins", "Aggregation frameworks", "Indexing fields for speed"] }
    ]
  },
  "Git": {
    category: "Tools",
    description: "A free and open source distributed version control system designed to handle everything from small to very large projects.",
    difficulty: "Easy",
    courses: [
      { name: "Git & GitHub Crash Course", provider: "FreeCodeCamp", link: "https://www.youtube.com/watch?v=RGOj5yH7evk" },
      { name: "Learn Git Branching (Interactive Game)", provider: "Github", link: "https://learngitbranching.js.org/" }
    ],
    weeks: [
      { title: "Week 1: Versioning Essentials", topics: ["git init & git clone", "The three stages (Working, Staging, Commit)", "git status & git log", "Configuring user profile"] },
      { title: "Week 2: Branching & Merging", topics: ["Creating branches", "git merge & conflicts resolution", "git checkout vs git switch", "Stashing changes"] },
      { title: "Week 3: GitHub Collaboration", topics: ["Adding remotes", "git push & git pull", "Creating Pull Requests", "Forks & upstream syncing"] },
      { title: "Week 4: Advanced Git commands", topics: ["git rebase basics", "git cherry-pick", "Interactive staging", "Undoing commits (git reset vs git revert)"] }
    ]
  },
  "SQL": {
    category: "Database",
    description: "A domain-specific language used in programming and designed for managing data held in a RDBMS.",
    difficulty: "Easy",
    courses: [
      { name: "SQL Tutorial for Beginners", provider: "Mosh (YouTube)", link: "https://www.youtube.com/watch?v=7S_tz1z_5bA" },
      { name: "SQLZoo Interactive Exercises", provider: "SQLZoo", link: "https://sqlzoo.net/" }
    ],
    weeks: [
      { title: "Week 1: SQL Queries Basics", topics: ["SELECT & WHERE filters", "ORDER BY & LIMIT", "Operators (AND, OR, LIKE, IN)", "Null value checks"] },
      { title: "Week 2: Joins & Unions", topics: ["INNER JOIN", "LEFT & RIGHT JOIN", "Self joins & multiple table joins", "UNION operator"] },
      { title: "Week 3: Aggregates & Groups", topics: ["SUM, AVG, MIN, MAX, COUNT", "GROUP BY syntax", "HAVING clauses for groups", "String functions"] },
      { title: "Week 4: Subqueries & DDL", topics: ["Nested subqueries", "CREATE, ALTER, DROP tables", "Primary & Foreign keys", "Transaction syntax"] }
    ]
  }
};

export const MOCK_INTERVIEWS = {
  frontend: [
    {
      id: "q-fe-1",
      type: "Technical",
      question: "What is the difference between state and props in React?",
      sampleAnswer: "State represents the local, mutable data managed internally by a component itself, which triggers a re-render when modified. Props (short for properties) are read-only inputs passed down from parent components to children, allowing parameters to flow downward.",
      hints: "Think about who manages the data, and if it can be modified from within the component."
    },
    {
      id: "q-fe-2",
      type: "Technical",
      question: "Explain the Virtual DOM and how React updates the UI.",
      sampleAnswer: "The Virtual DOM is a lightweight, in-memory representation of the real DOM. When state changes, React creates a new virtual DOM tree, compares it with the previous virtual DOM tree (a process called reconciliation or 'diffing'), and updates only the changed parts in the real browser DOM to maximize performance.",
      hints: "Mention reconciliation, the diffing algorithm, and batch DOM updates."
    },
    {
      id: "q-fe-3",
      type: "Technical",
      question: "What are React hooks, and what rules must they follow?",
      sampleAnswer: "React Hooks are functions that let functional components tap into state and lifecycle features (e.g. useState, useEffect). The two core rules are: 1. Hooks must only be called at the top level of your component (never inside loops, conditions, or nested functions). 2. Hooks must only be called from React function components or custom hooks.",
      hints: "Discuss top-level calls and calling them only inside React functions."
    },
    {
      id: "q-fe-4",
      type: "Aptitude",
      question: "If a web page is taking 5 seconds to load, what are the first 3 steps you would take to diagnose and optimize the performance?",
      sampleAnswer: "First, I would open Chrome DevTools Network Tab/Lighthouse to run an audit and analyze file sizes and request times. Second, I would optimize asset delivery: compress images, minify JS/CSS bundles, and split code via lazy loading. Third, I would check database query latency, enable API caching (CDN), and eliminate render-blocking scripts.",
      hints: "Mention tools like Chrome DevTools, asset sizes, bundle sizes, lazy loading, and CDNs."
    },
    {
      id: "q-fe-5",
      type: "HR",
      question: "Tell me about a time you faced a difficult conflict during a team project, and how you resolved it.",
      sampleAnswer: "During a group project, we had a disagreement regarding the choice of technology stack. One teammate wanted to use a complex framework they were learning, while others preferred standard tech. I resolved it by scheduling a meeting, laying out the project deadline, mapping out the learning curves, and deciding on a hybrid approach where we stuck to core tech but created one experimental feature. This kept everyone motivated and we met our deadline.",
      hints: "Focus on active listening, objective criteria, compromises, and project outcomes."
    }
  ],
  backend: [
    {
      id: "q-be-1",
      type: "Technical",
      question: "What is middleware in Express, and how does it work?",
      sampleAnswer: "Middleware functions are functions that have access to the request object (req), response object (res), and the next middleware function in the application's request-response cycle. They can execute code, modify req/res, end the cycle, or call next() to pass control forward.",
      hints: "Talk about request/response manipulation and the next() function."
    },
    {
      id: "q-be-2",
      type: "Technical",
      question: "Compare SQL and NoSQL databases. When would you use MongoDB over PostgreSQL?",
      sampleAnswer: "SQL databases (like PostgreSQL) are relational, table-based, schemas-bound, and support ACID transactions, ideal for structured data like banking. NoSQL (like MongoDB) are document-based, schema-less, and scale horizontally, ideal for unstructured, rapidly changing data or massive feeds.",
      hints: "Focus on schemas, scaling, relationships, and transaction structures."
    },
    {
      id: "q-be-3",
      type: "Technical",
      question: "How do you secure a REST API? Describe at least three methods.",
      sampleAnswer: "First, use HTTPS to encrypt traffic. Second, use JWT (JSON Web Tokens) or session cookies for secure user authentication, storing keys safely. Third, implement rate limiting to prevent DDOS, validate and sanitize all inputs to prevent SQL injections, and set security headers using Helmet.",
      hints: "Mention HTTPS, JWT auth, input sanitization, rate limiting, and CORS."
    },
    {
      id: "q-be-4",
      type: "Aptitude",
      question: "Explain the concept of database indexing. What are the trade-offs?",
      sampleAnswer: "Indexing is a technique to optimize query performance by creating a data structure (often a B-Tree) that allows the database to find rows quickly without scaning the entire table. The trade-offs are that indexes occupy extra disk space, and they slow down write operations (INSERT, UPDATE, DELETE) since the index must be updated as well.",
      hints: "Mention read acceleration versus write degradation and storage overhead."
    },
    {
      id: "q-be-5",
      type: "HR",
      question: "Why do you want to work as a Backend Engineer at our company, and what are your long-term career goals?",
      sampleAnswer: "I love backend engineering because I enjoy solving complex logic puzzles, managing databases, and building architectures that scale. Your company handles billions of operations daily, which is the perfect challenge. In the long term, I want to lead systems engineering teams and design distributed architectures that power critical services.",
      hints: "Connect your passion for backend with the company's engineering scale and your growth path."
    }
  ],
  hr: [
    {
      id: "q-hr-1",
      type: "HR",
      question: "Introduce yourself. Tell me about your background and key skills.",
      sampleAnswer: "I am a computer science student passionate about software engineering. Over the past few years, I've built full-stack projects using React, Node.js, and MongoDB. I enjoy bridge-building between UI aesthetics and scalable server logic. I'm also active in code challenges and have completed two frontend internships.",
      hints: "Summarize education, core technical stack, key projects, and your passion."
    },
    {
      id: "q-hr-2",
      type: "HR",
      question: "What is your greatest technical strength, and what is a weakness you are actively working on?",
      sampleAnswer: "My strength is my rapid adaptability; I can pick up new frameworks and APIs quickly (like teaching myself React in two weeks). My weakness is that I sometimes get lost in perfecting edge cases and code aesthetics, which can slow me down. I've been resolving this by setting strict timers and defining MVPs first.",
      hints: "Choose a real technical strength, and a constructive weakness that you are showing steps to improve."
    },
    {
      id: "q-hr-3",
      type: "Technical",
      question: "What does placement readiness mean to you, and how are you preparing for it?",
      sampleAnswer: "Placement readiness means having both technical competence (problem-solving, core CS fundamentals, coding projects) and communication skills to explain my logic. I prepare by practicing data structures on Leetcode, conducting mock interviews, keeping my portfolio updated with full-stack projects, and learning core database indexing.",
      hints: "Define both hard skills (coding, core concepts) and soft skills (communication, collaboration)."
    },
    {
      id: "q-hr-4",
      type: "Aptitude",
      question: "You have two critical projects due at the same time: one for class and one for a client. You don't have enough hours to complete both at 100%. What is your strategy?",
      sampleAnswer: "I would prioritize transparency and triage. First, I'd evaluate the exact requirements of both. I would reach out to both the professor and client to see if a short extension is possible. If not, I would scale down the scope of both projects to focus on delivering high-quality core MVPs rather than incomplete premium models, ensuring both receive working products on time.",
      hints: "Address communication, prioritization, MVP scoping, and managing expectations."
    },
    {
      id: "q-hr-5",
      type: "HR",
      question: "Where do you see yourself in five years?",
      sampleAnswer: "In five years, I see myself as a Senior Full Stack Engineer, taking ownership of core product features and designing system schemas. I also hope to mentor junior devs, contribute to open-source software, and play an active role in driving technology decisions that help solve real-world problems at scale.",
      hints: "Discuss technical growth, leadership/mentorship, and creating business impact."
    }
  ]
};

export const PROJECT_RECOMMENDATIONS = [
  {
    title: "E-Commerce Microservices Platform",
    difficulty: "Hard",
    timeEstimate: "40 Hours",
    tags: ["React.js", "Node.js", "MongoDB", "Express.js", "Docker"],
    description: "A scale-ready online store with distinct servers for auth, products, and checkout.",
    features: [
      "JWT-based gateway routing with Express",
      "Stripe payment gateway sandbox integration",
      "State management using Zustand",
      "Dockerized services for independent scaling"
    ],
    guidelines: [
      "Start by coding the product listing frontend",
      "Set up individual Express servers for Users and Orders",
      "Implement MongoDB document relationships with aggregate queries",
      "Add Dockerfiles and compose them locally"
    ]
  },
  {
    title: "AI Resume & Portfolio Builder",
    difficulty: "Medium",
    timeEstimate: "24 Hours",
    tags: ["React.js", "Tailwind CSS", "Gemini API", "Node.js"],
    description: "An app that lets students write details, uses AI to optimize wording, and generates a printable portfolio.",
    features: [
      "Vibrant glassmorphic theme with edit sliders",
      "Gemini API prompt templates for bullet-point optimization",
      "PDF export using html2canvas and jsPDF",
      "Responsive portfolio web templates"
    ],
    guidelines: [
      "Design form wizards to gather user skills and experiences",
      "Integrate Gemini text refinement prompts",
      "Code clean, Tailwind-styled print layouts",
      "Hook up HTML-to-PDF export scripts"
    ]
  },
  {
    title: "Collaborative Real-time Task Board",
    difficulty: "Medium",
    timeEstimate: "20 Hours",
    tags: ["React.js", "Node.js", "Socket.io", "MongoDB"],
    description: "A Kanban-style task manager where changes update instantly across open browsers.",
    features: [
      "Drag-and-drop task column boards",
      "WebSocket events for concurrent state synchronization",
      "User activity logs with avatars",
      "Database models with automated change updates"
    ],
    guidelines: [
      "Create the frontend board layout with beautiful task items",
      "Implement Socket.io client-server sync channels",
      "Save changes to MongoDB collections",
      "Add interactive user typing/dragging indicators"
    ]
  },
  {
    title: "Personal Finance & Analytics Hub",
    difficulty: "Easy",
    timeEstimate: "12 Hours",
    tags: ["HTML", "CSS", "JavaScript", "Chart.js"],
    description: "A tracker for incomes and expenses that renders beautiful analytics and projections.",
    features: [
      "Income/Expense form list logs with LocalStorage",
      "Sleek category distribution pie charts",
      "Progress bar indicators for monthly budget limits",
      "CSV report downloader"
    ],
    guidelines: [
      "Write standard HTML forms and input validation",
      "Use JavaScript to compute sums and save arrays in LocalStorage",
      "Hook up Chart.js to render monthly budgets",
      "Apply CSS grid for layout responsiveness"
    ]
  }
];

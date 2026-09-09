// Mock Data for SkillBridge AI Platform

export const RESUME_PRESETS = [
  {
    id: "preset-sajid",
    name: "Sajid Ahmed M - Full Stack & AI Developer",
    description: "Academic score: 8.25 CGPA (82%). Expert in React.js, Node.js, Express.js, Python, SQL, REST APIs & AI Integrations.",
    skills: ["HTML", "CSS", "JavaScript", "React.js", "Node.js", "Express.js", "Python", "SQL", "Git", "REST APIs", "AI Application Development"],
    projects: [
      {
        title: "AI Voice Assistant",
        tech: "Conversational AI, Voice Processing, Python",
        description: "Alexa-inspired assistant featuring conversational AI, speech processing, and smart automation."
      },
      {
        title: "AI Skill Gap Analyzer",
        tech: "React, Node.js, Gemini API",
        description: "Application that evaluates resumes, detects structural issues, and provides targeted skill gap recommendations."
      },
      {
        title: "Task Diary",
        tech: "React, LocalStorage, Vercel",
        description: "Responsive task-management app for creating, updating, and tracking daily tasks."
      }
    ],
    education: "B.E. Computer Science & Engineering - Vaigai College of Engineering (Graduating 2027)",
    experience: "Prompt Engineer / Full Stack Web Developer / AI Intern at Celite",
    scores: {
      resumeScore: 92,
      skillScore: 88,
      placementReadiness: 90,
      weeklyGoalsProgress: 85
    }
  },
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
  },
  "TypeScript": {
    category: "Frontend",
    description: "Strongly typed programming language that builds on JavaScript, giving you better tooling at any scale.",
    difficulty: "Medium",
    courses: [
      { name: "TypeScript Official Handbook", provider: "TypeScriptLang", link: "https://www.typescriptlang.org/docs/" },
      { name: "Execute Program: TypeScript Core", provider: "ExecuteProgram", link: "https://www.executeprogram.com/courses/typescript" }
    ],
    weeks: [
      { title: "Week 1: Types & Interfaces", topics: ["Primitive types & Type inference", "Interface vs Type aliases", "Union & Intersection types", "Function type annotations"] },
      { title: "Week 2: Advanced Typing", topics: ["Generics & Type Constraints", "Utility types (Partial, Pick, Omit, Record)", "Literal types & Type guards", "Enums vs const assertions"] },
      { title: "Week 3: React + TypeScript Integration", topics: ["Typing React props & state", "Event handlers & Form events", "Custom hooks with TypeScript generics", "Ref object typing"] }
    ]
  },
  "Redux": {
    category: "Frontend",
    description: "Predictable state container for JavaScript apps, commonly used with React for global state management.",
    difficulty: "Medium",
    courses: [
      { name: "Redux Essentials Official Tutorial", provider: "Redux.js.org", link: "https://redux.js.org/tutorials/essentials/part-1-overview-concepts" },
      { name: "FreeCodeCamp Redux Toolkit Guide", provider: "FreeCodeCamp", link: "https://www.freecodecamp.org/news/redux-and-redux-toolkit-overview/" }
    ],
    weeks: [
      { title: "Week 1: Redux Toolkit Fundamentals", topics: ["Store setup with configureStore", "Creating slices with createSlice", "Reducers & Action dispatching", "useSelector & useDispatch hooks"] },
      { title: "Week 2: Async State & RTK Query", topics: ["createAsyncThunk for API calls", "Loading, fulfilled & rejected states", "RTK Query data fetching & caching", "Normalized state structures"] }
    ]
  },
  "TailwindCSS": {
    category: "Frontend",
    description: "A utility-first CSS framework packed with classes that can be composed to build any design, directly in your markup.",
    difficulty: "Easy",
    courses: [
      { name: "Tailwind CSS Official Documentation", provider: "TailwindCSS", link: "https://tailwindcss.com/docs" },
      { name: "Tailwind CSS Full Course", provider: "Traversy Media", link: "https://www.youtube.com/watch?v=dFgzHOX84xQ" }
    ],
    weeks: [
      { title: "Week 1: Utility Fundamentals & Layout", topics: ["Flexbox & Grid utilities", "Spacing, sizing & color palette", "Typography & responsive breakpoints (sm, md, lg)", "Hover & focus state variants"] },
      { title: "Week 2: Component Design & Dark Mode", topics: ["Reusable component classes with @apply", "Dark mode configuration", "Custom colors & font configuration in tailwind.config.js", "Animations & transitions"] }
    ]
  },
  "Python": {
    category: "Backend",
    description: "High-level programming language known for clean syntax, data analytics, web services, and AI integration.",
    difficulty: "Easy",
    courses: [
      { name: "Python.org Official Tutorial", provider: "Python.org", link: "https://docs.python.org/3/tutorial/" },
      { name: "Python for Beginners", provider: "Programming with Mosh", link: "https://www.youtube.com/watch?v=_uQrJ0TkZlc" }
    ],
    weeks: [
      { title: "Week 1: Python Core Syntax", topics: ["Data types, lists, tuples & dicts", "Control flow & loops", "Functions & args/kwargs", "List comprehensions"] },
      { title: "Week 2: OOP & Modules", topics: ["Classes, objects & inheritance", "File handling & JSON parsing", "Virtual environments (venv)", "PIP package management"] }
    ]
  },
  "Docker": {
    category: "Tools",
    description: "OS-level virtualization deliver software in packages called containers for consistent deployment.",
    difficulty: "Medium",
    courses: [
      { name: "Docker for Beginners", provider: "Docker.com", link: "https://docs.docker.com/get-started/" }
    ],
    weeks: [
      { title: "Week 1: Containers & Dockerfiles", topics: ["Images vs Containers", "Writing multi-stage Dockerfiles", "Building & running images", "Environment variables"] }
    ]
  }
};


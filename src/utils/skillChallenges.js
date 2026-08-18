// agent-notes: { ctx: "Dynamic creative coding challenges, boilerplates and MCQs for Skill Verification Pipeline", deps: [], state: "active", last: "anti@2026-08-18" }

export const SKILL_CHALLENGES = {
  react: {
    title: "Build a Dynamic User Profile Card with Hooks",
    prompt: "Implement a production-ready <UserProfileCard /> component in React using useState and useEffect hooks. Your component should handle data fetching, toggleable details, and clean conditional rendering.",
    starterCode: `import React, { useState, useEffect } from 'react';

export default function UserProfileCard({ userId }) {
  // TODO: 1. Declare state for user profile and active tab
  const [profile, setProfile] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // TODO: 2. Implement effect to fetch or initialize user data
  useEffect(() => {
    // Write your data loading logic here...
  }, [userId]);

  // TODO: 3. Return responsive card UI with toggle action
  return (
    <div className="user-profile-card">
      {/* Write your React JSX implementation here */}
      
    </div>
  );
}`,
    mcqs: [
      {
        question: "Why should state updates depending on previous state use functional updates `setCount(prev => prev + 1)` in React?",
        options: [
          "To guarantee state updates use the latest state value regardless of batching or closures",
          "It forces an immediate synchronous DOM repaint",
          "Functional updates automatically save state to localStorage"
        ],
        correct: 0
      },
      {
        question: "What is the purpose of the dependency array in `useEffect`?",
        options: [
          "Controls when the effect re-runs based on changed variable references",
          "Defines the CSS styles applied to the component",
          "Imports external libraries asynchronously"
        ],
        correct: 0
      }
    ]
  },

  node: {
    title: "Build a Rate-Limited REST API Endpoint",
    prompt: "Implement an Express.js router endpoint POST /api/skills/verify that validates request headers, checks authentication token, and returns a structured JSON payload with error handling.",
    starterCode: `const express = require('express');
const router = express.Router();

// TODO: Implement route handler with authentication check and JSON output
router.post('/api/skills/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  
  // Write your Node.js / Express implementation below:

});

module.exports = router;`,
    mcqs: [
      {
        question: "How does the Node.js event loop handle asynchronous I/O operations without thread blocking?",
        options: [
          "Delegates I/O tasks to libuv worker pool while processing callbacks in event queue",
          "Creates a physical hardware CPU thread per incoming HTTP request",
          "Pauses main thread execution until disk read completes"
        ],
        correct: 0
      },
      {
        question: "Which Express middleware pattern correctly catches unhandled route errors?",
        options: [
          "Centralized middleware with 4 parameters: (err, req, res, next)",
          "Using try-catch around app.listen()",
          "Returning HTTP 200 on all server exceptions"
        ],
        correct: 0
      }
    ]
  },

  javascript: {
    title: "Implement a High-Performance Debounce Utility",
    prompt: "Write a JavaScript function createDebouncedHandler(func, delay) that delays function execution until after specified milliseconds have elapsed since the last invocation.",
    starterCode: `/**
 * Creates a debounced version of the target function.
 * @param {Function} func - Target function to execute
 * @param {number} delay - Delay in milliseconds
 */
function createDebouncedHandler(func, delay) {
  let timerId = null;

  // TODO: Return debounced closure function
  return function (...args) {
    // Write your JavaScript logic here:

  };
}`,
    mcqs: [
      {
        question: "What is the primary difference between `debounce` and `throttle` in JavaScript event optimization?",
        options: [
          "Debounce delays execution until event stops; throttle limits execution to once per time window",
          "Debounce works only on server side; throttle works in browser",
          "Debounce converts functions to async Promises"
        ],
        correct: 0
      },
      {
        question: "How does lexical scoping affect closures in JavaScript?",
        options: [
          "Inner functions retain access to outer function variables even after outer execution finishes",
          "Variables defined in closures become global window object properties",
          "Closures automatically delete out-of-scope variables"
        ],
        correct: 0
      }
    ]
  },

  python: {
    title: "Build an Automated Skill Metrics Analytics Function",
    prompt: "Write a Python function process_skill_metrics(scores_dict) that computes weighted averages, filters out scores below threshold (70.0), and returns an ordered dictionary of top skills.",
    starterCode: `def process_skill_metrics(scores_dict, threshold=70.0):
    """
    Computes weighted skill averages and returns top performing skills above threshold.
    """
    results = {}
    
    # TODO: Iterate through scores_dict, calculate metrics, and apply threshold filter:

    
    return results`,
    mcqs: [
      {
        question: "What is the time complexity advantage of using a Python dictionary / hash set over a list for membership checks `item in data`?",
        options: [
          "O(1) average time complexity vs O(n) linear search for lists",
          "Lists use less memory than byte strings",
          "Python dictionaries are automatically sorted by insertion order"
        ],
        correct: 0
      },
      {
        question: "Which Python decorator pattern is recommended for caching expensive function results?",
        options: [
          "`@functools.lru_cache`",
          "`@asyncio.coroutine`",
          "`@classmethod`"
        ],
        correct: 0
      }
    ]
  },

  sql: {
    title: "Write a Complex Analytical Query with Joins & Aggregations",
    prompt: "Write a SQL query to select candidates who have at least 3 verified skills, calculating their average placement readiness score per department.",
    starterCode: `-- TODO: Write your SQL query below:
SELECT 
    c.department,
    COUNT(c.id) AS total_candidates,
    AVG(c.placement_score) AS avg_readiness
FROM candidates c
-- TODO: Join skills table and add GROUP BY & HAVING filters:

`,
    mcqs: [
      {
        question: "What is the difference between WHERE and HAVING clauses in SQL?",
        options: [
          "`WHERE` filters rows before aggregation; `HAVING` filters aggregated groups",
          "`HAVING` works only with primary key joins",
          "`WHERE` requires subqueries for string matching"
        ],
        correct: 0
      },
      {
        question: "Which index type is best suited for exact equality lookups on high-cardinality columns?",
        options: [
          "B-Tree index",
          "Full-text search index",
          "Bitmap index"
        ],
        correct: 0
      }
    ]
  },

  mongodb: {
    title: "Design an Aggregation Pipeline Query",
    prompt: "Construct a MongoDB aggregation pipeline to match active students, group by career goal, and calculate average skill mastery percentage.",
    starterCode: `// TODO: Construct MongoDB aggregation pipeline array:
db.candidates.aggregate([
  // Stage 1: Filter active candidates
  { $match: { status: "ACTIVE" } },

  // Stage 2: Group by careerGoal & compute averages
  
]);`,
    mcqs: [
      {
        question: "In MongoDB aggregation, what is the role of the $unwind stage?",
        options: [
          "Deconstructs an array field from input documents to output a document for each element",
          "Deletes duplicate documents in a collection",
          "Encrypts sensitive collection fields"
        ],
        correct: 0
      },
      {
        question: "Why should indexes be created on fields used in $match and $sort stages?",
        options: [
          "Allows MongoDB to use index scans instead of full collection scans",
          "Prevents write locks during inserts",
          "Automatically updates schema validation"
        ],
        correct: 0
      }
    ]
  },

  docker: {
    title: "Construct a Multi-Stage Dockerfile for Production",
    prompt: "Write a multi-stage Dockerfile that builds a React application in Stage 1 using Node 18, and serves the static production build using Nginx in Stage 2.",
    starterCode: `# TODO: Stage 1 - Build Stage
FROM node:18-alpine AS build
WORKDIR /app
# Write Docker build commands here...


# TODO: Stage 2 - Production Serving Stage
FROM nginx:alpine

`,
    mcqs: [
      {
        question: "What is the main security & size benefit of multi-stage Docker builds?",
        options: [
          "Excludes build toolchains (Node/NPM source code) from final runtime image, reducing image size & attack surface",
          "Automatically signs container images with SSL certificates",
          "Enables kernel-level CPU isolation"
        ],
        correct: 0
      },
      {
        question: "What is the purpose of Docker layer caching during COPY package.json . before COPY . .?",
        options: [
          "Avoids re-running expensive npm install when application source code changes but dependencies remain unchanged",
          "Compresses node_modules directory into zip format",
          "Encrypts package dependencies"
        ],
        correct: 0
      }
    ]
  }
};

/**
 * Returns dynamic creative challenge prompt, starter code, and MCQs for any given skill.
 */
export function getChallengeForSkill(skillName = "") {
  const key = (skillName || "").toLowerCase().replace(/[^a-z]/g, '');
  
  if (key.includes('react')) return SKILL_CHALLENGES.react;
  if (key.includes('node') || key.includes('express') || key.includes('backend')) return SKILL_CHALLENGES.node;
  if (key.includes('js') || key.includes('javascript') || key.includes('ts') || key.includes('typescript')) return SKILL_CHALLENGES.javascript;
  if (key.includes('python') || key.includes('ai') || key.includes('data')) return SKILL_CHALLENGES.python;
  if (key.includes('sql') || key.includes('postgres') || key.includes('mysql')) return SKILL_CHALLENGES.sql;
  if (key.includes('mongo') || key.includes('db')) return SKILL_CHALLENGES.mongodb;
  if (key.includes('docker') || key.includes('aws') || key.includes('devops') || key.includes('cloud')) return SKILL_CHALLENGES.docker;

  // Generic creative fallback for custom skills
  const cleanName = skillName || 'Full Stack';
  return {
    title: `Implement Production ${cleanName} Logic`,
    prompt: `Create a clean, production-grade module for ${cleanName} with modular function structure, input validation, and proper response formatting.`,
    starterCode: `// ${cleanName} Skill Verification Challenge
// TODO: Write your custom ${cleanName} solution below:

function execute${cleanName.replace(/[^a-zA-Z]/g, '')}Module(inputData) {
  // TODO: Implement your logic here

}

// Export module logic
module.exports = { execute${cleanName.replace(/[^a-zA-Z]/g, '')}Module };`,
    mcqs: [
      {
        question: `What is a core best practice when architecting scalable ${cleanName} applications?`,
        options: [
          "Decoupling responsibilities into single-purpose modular functions",
          "Hardcoding configuration secrets in source files",
          "Ignoring runtime exceptions and error handling"
        ],
        correct: 0
      },
      {
        question: `How should error propagation be handled in production ${cleanName} modules?`,
        options: [
          "Catching exceptions early, logging contextually, and returning descriptive error structures",
          "Terminating process thread silently on first warning",
          "Retrying invalid inputs infinitely in endless loops"
        ],
        correct: 0
      }
    ]
  };
}

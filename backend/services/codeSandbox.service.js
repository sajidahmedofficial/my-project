// agent-notes: { ctx: "Secure Sandboxed Code Execution Service running isolated test suites with timeouts, restricted globals, and deep assertion comparisons", deps: ["vm"], state: "active", last: "anti@2026-08-20" }
import vm from 'vm';

/**
 * Standard Coding Challenges by Skill with Comprehensive Test Cases
 */
export const CODING_CHALLENGES_BANK = {
  "React.js": {
    challengeId: "react_custom_hook_counter",
    skill: "React.js",
    language: "javascript",
    difficulty: "Medium",
    question: "Implement a bounded counter logic function `calculateBoundedCount(current, delta, min, max)` that updates a counter by `delta` while strictly clamping the result within `[min, max]` boundaries.",
    starterCode: `function calculateBoundedCount(current, delta, min, max) {\n  // TODO: Return clamped value between min and max\n}`,
    expectedBehavior: "Returns current + delta clamped between min and max inclusive.",
    functionName: "calculateBoundedCount",
    testCases: [
      { id: "t1", input: [5, 3, 0, 10], expected: 8, description: "Normal increment within range" },
      { id: "t2", input: [9, 5, 0, 10], expected: 10, description: "Clamping at upper bound (max)" },
      { id: "t3", input: [2, -5, 0, 10], expected: 0, description: "Clamping at lower bound (min)" },
      { id: "t4", input: [0, 0, 0, 10], expected: 0, description: "Zero delta at lower bound" },
      { id: "t5", input: [10, 0, 0, 10], expected: 10, description: "Zero delta at upper bound" }
    ]
  },

  "Node.js": {
    challengeId: "node_header_auth_validator",
    skill: "Node.js",
    language: "javascript",
    difficulty: "Medium",
    question: "Implement an authentication header validator function `validateAuthHeader(authHeader, expectedPrefix)` that returns `true` only if `authHeader` is a valid string starting with `${expectedPrefix} ` followed by a non-empty token string.",
    starterCode: `function validateAuthHeader(authHeader, expectedPrefix) {\n  // TODO: Validate Bearer or custom token header\n}`,
    expectedBehavior: "Validates Authorization header format and token presence.",
    functionName: "validateAuthHeader",
    testCases: [
      { id: "t1", input: ["Bearer eyJhbGciOi...", "Bearer"], expected: true, description: "Valid Bearer JWT header" },
      { id: "t2", input: ["ApiKey secret_123", "ApiKey"], expected: true, description: "Valid ApiKey header" },
      { id: "t3", input: ["Bearer ", "Bearer"], expected: false, description: "Missing token value" },
      { id: "t4", input: ["Basic 12345", "Bearer"], expected: false, description: "Mismatched prefix" },
      { id: "t5", input: [null, "Bearer"], expected: false, description: "Null header input" }
    ]
  },

  "JavaScript": {
    challengeId: "js_deep_object_flatten",
    skill: "JavaScript",
    language: "javascript",
    difficulty: "Medium",
    question: "Implement a utility function `flattenObject(obj, prefix = '')` that flattens a nested JavaScript object into a single-level object with dot-delimited property keys.",
    starterCode: `function flattenObject(obj, prefix = '') {\n  // TODO: Recursively flatten object keys with dot notation\n}`,
    expectedBehavior: "Transforms { a: { b: 1 } } into { 'a.b': 1 }",
    functionName: "flattenObject",
    testCases: [
      { id: "t1", input: [{ a: { b: 1, c: 2 } }], expected: { "a.b": 1, "a.c": 2 }, description: "Nested two-level object" },
      { id: "t2", input: [{ name: "Sajid", age: 22 }], expected: { name: "Sajid", age: 22 }, description: "Flat object unchanged" },
      { id: "t3", input: [{ user: { profile: { theme: "dark" } } }], expected: { "user.profile.theme": "dark" }, description: "Three-level deep nesting" },
      { id: "t4", input: [{}], expected: {}, description: "Empty object" }
    ]
  },

  "TypeScript": {
    challengeId: "ts_safe_property_picker",
    skill: "TypeScript",
    language: "javascript",
    difficulty: "Medium",
    question: "Implement a safe property picker function `pickProperties(source, allowedKeys)` that returns a new object containing only keys that exist in `allowedKeys` and are defined in `source`.",
    starterCode: `function pickProperties(source, allowedKeys) {\n  // TODO: Pick allowed keys from source object\n}`,
    expectedBehavior: "Filters object keys according to whitelist array.",
    functionName: "pickProperties",
    testCases: [
      { id: "t1", input: [{ a: 1, b: 2, c: 3 }, ["a", "c"]], expected: { a: 1, c: 3 }, description: "Filter subset of keys" },
      { id: "t2", input: [{ name: "SkillBridge", verified: true }, ["name", "email"]], expected: { name: "SkillBridge" }, description: "Ignore missing allowed keys" },
      { id: "t3", input: [{ id: 101 }, []], expected: {}, description: "Empty keys array" },
      { id: "t4", input: [{}, ["a", "b"]], expected: {}, description: "Empty source object" }
    ]
  },

  "Next.js": {
    challengeId: "next_route_query_parser",
    skill: "Next.js",
    language: "javascript",
    difficulty: "Medium",
    question: "Implement a URL search query parser function `parseSearchParams(queryString)` that converts a query string (with or without leading '?') into a clean key-value object.",
    starterCode: `function parseSearchParams(queryString) {\n  // TODO: Parse URL search query into key-value map\n}`,
    expectedBehavior: "Converts '?role=frontend&page=2' to { role: 'frontend', page: '2' }",
    functionName: "parseSearchParams",
    testCases: [
      { id: "t1", input: ["?role=frontend&page=2"], expected: { role: "frontend", page: "2" }, description: "Standard query with leading question mark" },
      { id: "t2", input: ["skill=react"], expected: { skill: "react" }, description: "Single query without leading question mark" },
      { id: "t3", input: [""], expected: {}, description: "Empty query string" },
      { id: "t4", input: ["?filter=ai&sort=desc&limit=10"], expected: { filter: "ai", sort: "desc", limit: "10" }, description: "Multi-parameter query" }
    ]
  },

  "Docker": {
    challengeId: "docker_tag_parser",
    skill: "Docker",
    language: "javascript",
    difficulty: "Easy",
    question: "Implement a container image tag parser `parseDockerImage(imageString)` that separates an image string into `{ repository, image, tag }` with default tag 'latest'.",
    starterCode: `function parseDockerImage(imageString) {\n  // TODO: Parse image into repository, image, and tag\n}`,
    expectedBehavior: "Parses 'ghcr.io/org/app:v1.0' or 'node:20-alpine'",
    functionName: "parseDockerImage",
    testCases: [
      { id: "t1", input: ["node:20-alpine"], expected: { repository: "", image: "node", tag: "20-alpine" }, description: "Official image with tag" },
      { id: "t2", input: ["mongo"], expected: { repository: "", image: "mongo", tag: "latest" }, description: "Default latest tag" },
      { id: "t3", input: ["ghcr.io/skillbridge/api:1.2.0"], expected: { repository: "ghcr.io/skillbridge", image: "api", tag: "1.2.0" }, description: "Custom registry with tag" }
    ]
  }
};

/**
 * Deep equality helper for comparing test results
 */
function isDeepEqual(a, b) {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== typeof b) return false;

  if (typeof a === 'object') {
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    
    if (Array.isArray(a)) {
      if (a.length !== b.length) return false;
      return a.every((item, idx) => isDeepEqual(item, b[idx]));
    }

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;

    return keysA.every(k => Object.prototype.hasOwnProperty.call(b, k) && isDeepEqual(a[k], b[k]));
  }

  return false;
}

/**
 * Executes candidate code safely within an isolated VM sandbox with timeout and restricted globals
 */
export async function executeInSandbox({ userCode, functionName, testCases, timeoutMs = 2000 }) {
  if (!userCode || typeof userCode !== 'string') {
    return {
      passedTests: 0,
      totalTests: testCases?.length || 0,
      score: 0,
      status: "failed",
      error: "No code submitted for execution."
    };
  }

  // Create isolated context with strictly safe primitives - NO process, require, fs, net, or child_process!
  const sandbox = {
    console: {
      log: () => {},
      error: () => {},
      warn: () => {}
    },
    Math,
    JSON,
    Array,
    Object,
    String,
    Number,
    Boolean,
    Date,
    RegExp,
    parseInt,
    parseFloat,
    isNaN,
    isFinite
  };

  const context = vm.createContext(sandbox);

  // 1. Compile and evaluate user code in sandbox
  try {
    const script = new vm.Script(userCode);
    script.runInContext(context, { timeout: timeoutMs });
  } catch (compileErr) {
    return {
      passedTests: 0,
      totalTests: testCases?.length || 0,
      score: 0,
      status: "failed",
      error: `Syntax / Compilation Error: ${compileErr.message}`,
      testResults: (testCases || []).map(tc => ({
        id: tc.id,
        description: tc.description,
        passed: false,
        error: compileErr.message
      }))
    };
  }

  const targetFunc = context[functionName];
  if (typeof targetFunc !== 'function') {
    return {
      passedTests: 0,
      totalTests: testCases?.length || 0,
      score: 0,
      status: "failed",
      error: `Function '${functionName}' is not defined or is not exported in the global scope.`,
      testResults: (testCases || []).map(tc => ({
        id: tc.id,
        description: tc.description,
        passed: false,
        error: `Function ${functionName} missing`
      }))
    };
  }

  // 2. Execute each test case
  let passedCount = 0;
  const testResults = [];

  for (const tc of testCases) {
    const startTime = Date.now();
    try {
      // Execute function with cloned inputs in isolated VM context
      const cloneInput = JSON.parse(JSON.stringify(tc.input));
      const actualResult = targetFunc(...cloneInput);
      const executionTimeMs = Date.now() - startTime;

      const passed = isDeepEqual(actualResult, tc.expected);
      if (passed) {
        passedCount++;
      }

      testResults.push({
        id: tc.id,
        description: tc.description,
        passed,
        actual: actualResult,
        expected: tc.expected,
        executionTimeMs
      });
    } catch (execErr) {
      testResults.push({
        id: tc.id,
        description: tc.description,
        passed: false,
        error: execErr.message,
        executionTimeMs: Date.now() - startTime
      });
    }
  }

  const totalTests = testCases.length;
  const score = totalTests > 0 ? Math.round((passedCount / totalTests) * 100) : 0;
  const status = passedCount === totalTests ? "passed" : "failed";

  return {
    passedTests: passedCount,
    totalTests,
    score,
    status,
    testResults
  };
}

/**
 * Get Coding Challenge by Skill Name
 */
export function getChallengeForSkill(skillName) {
  const normKey = Object.keys(CODING_CHALLENGES_BANK).find(k => k.toLowerCase() === skillName?.toLowerCase()) || "React.js";
  return CODING_CHALLENGES_BANK[normKey] || CODING_CHALLENGES_BANK["React.js"];
}

export default {
  CODING_CHALLENGES_BANK,
  getChallengeForSkill,
  executeInSandbox
};

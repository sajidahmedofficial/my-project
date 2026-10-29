// agent-notes: { ctx: "TDD test suite for AI Chatbot general query answering, user chosen role calibration, and UI naming", deps: ["assert", "fs"], state: "active", last: "anti@2026-10-29" }
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { generateMentorResponse } from '../src/utils/aiSimulator.js';
import { generateSmartFallbackAnswer } from '../backend/routes/ai.js';

let passed = 0;
let failed = 0;

function it(desc, fn) {
  try {
    fn();
    console.log(`✅ [PASS] ${desc}`);
    passed++;
  } catch (err) {
    console.error(`❌ [FAIL] ${desc}: ${err.message}`);
    failed++;
  }
}

console.log("================================================================");
console.log("🧪 TDD: AI Chatbot Name Replacement, General Qs & Chosen Role");
console.log("================================================================\n");

// 1. UI & Navigation Naming
console.log("--- 1. Testing UI & Navigation Naming ('AI Chatbot') ---");

it("App.jsx navigation item has label 'AI Chatbot'", () => {
  const appContent = fs.readFileSync(path.resolve('./src/App.jsx'), 'utf8');
  assert.ok(
    /{\s*id:\s*['"]chat['"],\s*label:\s*['"]AI Chatbot['"]/i.test(appContent),
    "App.jsx navigation items should have label 'AI Chatbot'"
  );
});

it("CareerMentor.jsx renders 'AI Chatbot' in branding header", () => {
  const mentorContent = fs.readFileSync(path.resolve('./src/components/CareerMentor.jsx'), 'utf8');
  assert.ok(
    mentorContent.includes("AI Chatbot"),
    "CareerMentor.jsx should display 'AI Chatbot' in the header title"
  );
});

it("CareerMentor.jsx welcome message introduces as AI Chatbot", () => {
  const mentorContent = fs.readFileSync(path.resolve('./src/components/CareerMentor.jsx'), 'utf8');
  assert.ok(
    /Welcome to (?:Google Gemini )?AI Chatbot/i.test(mentorContent),
    "Welcome message should introduce as AI Chatbot"
  );
});

// 2. Answering ANY General Question
console.log("\n--- 2. Testing Chatbot Answering Any General Question ---");

it("Answers general knowledge question: Photosynthesis", () => {
  const query = "How does photosynthesis work?";
  const history = [];
  const context = { targetRole: "Full Stack AI Engineer", candidateName: "Sajid" };
  const resp = generateMentorResponse(history, query, context);
  assert.ok(resp && resp.length > 50, "Response should be substantive");
  assert.ok(
    /photosynthesis|chlorophyll|sunlight|carbon dioxide|glucose|oxygen/i.test(resp),
    "Should accurately explain photosynthesis"
  );
});

it("Answers general math calculation question: 25 * 14", () => {
  const query = "What is 25 * 14?";
  const history = [];
  const context = { targetRole: "Full Stack AI Engineer", candidateName: "Sajid" };
  const resp = generateMentorResponse(history, query, context);
  assert.ok(
    /350/.test(resp),
    "Should correctly compute 25 * 14 = 350"
  );
});

it("Answers general writing request: Sick leave email", () => {
  const query = "Write a professional email requesting sick leave for two days";
  const history = [];
  const context = { targetRole: "Full Stack AI Engineer", candidateName: "Sajid" };
  const resp = generateMentorResponse(history, query, context);
  assert.ok(
    /subject|sick leave|unwell|recovering|regards/i.test(resp),
    "Should generate a professional sick leave email draft"
  );
});

it("Answers general programming concept: Recursion", () => {
  const query = "Explain recursion with a simple example";
  const history = [];
  const context = { targetRole: "Full Stack AI Engineer", candidateName: "Sajid" };
  const resp = generateMentorResponse(history, query, context);
  assert.ok(
    /base case|call stack|calls itself/i.test(resp),
    "Should explain recursion with base case and call stack"
  );
});

// 3. Answering User Chosen Role Questions
console.log("\n--- 3. Testing Chatbot Answering User Chosen Role ---");

it("Answers question about user's chosen role: Full Stack AI Engineer", () => {
  const query = "Tell me about my chosen role and what skills I need";
  const history = [];
  const context = { 
    targetRole: "Full Stack AI Engineer", 
    candidateName: "Sajid",
    skills: ["HTML", "CSS", "JavaScript", "React", "Node.js"],
    missingSkills: ["Docker", "AWS", "PyTorch", "LLM APIs"]
  };
  const resp = generateMentorResponse(history, query, context);
  assert.ok(
    resp.includes("Full Stack AI Engineer"),
    "Response must explicitly address the user's chosen role"
  );
  assert.ok(
    /responsibilities|architecture|machine learning|llm|pipeline/i.test(resp),
    "Response must detail role responsibilities and AI engineering depth"
  );
});

it("Answers query asking 'What is my chosen role?'", () => {
  const query = "What is my chosen role and career goal?";
  const history = [];
  const context = { 
    targetRole: "Cloud DevOps Architect", 
    candidateName: "Alex" 
  };
  const resp = generateMentorResponse(history, query, context);
  assert.ok(
    resp.includes("Cloud DevOps Architect"),
    "Response must identify the specific chosen role"
  );
});

// 4. Backend Smart Fallback Answering General + Chosen Role
console.log("\n--- 4. Testing Backend Smart Fallback Generator ---");

it("Backend fallback answers general question: What is gravity?", () => {
  const query = "What is gravity and how does it work?";
  const resp = generateSmartFallbackAnswer(
    query, 
    "Sajid", 
    "Full Stack AI Engineer", 
    "React, Node.js", 
    "Docker, AWS", 
    "general"
  );
  assert.ok(
    /gravity|mass|spacetime|attraction|einstein|newton/i.test(resp),
    "Backend fallback must accurately explain gravity"
  );
});

it("Backend fallback answers user chosen role: Full Stack AI Engineer roadmap", () => {
  const query = "How do I become a Full Stack AI Engineer?";
  const resp = generateSmartFallbackAnswer(
    query, 
    "Sajid", 
    "Full Stack AI Engineer", 
    "React, Node.js", 
    "Docker, AWS", 
    "general"
  );
  assert.ok(
    resp.includes("Full Stack AI Engineer"),
    "Backend fallback must address Full Stack AI Engineer"
  );
  assert.ok(
    /roadmap|machine learning|ai|model|deployment/i.test(resp),
    "Backend fallback must provide AI engineering roadmap guidance"
  );
});

console.log("\n----------------------------------------------------------------");
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log("----------------------------------------------------------------");

if (failed > 0) {
  process.exit(1);
}

// agent-notes: { ctx: "TDD test for diverse AI responses, active Gemini model fallback, and no repetitive generic template", deps: ["assert", "../backend/services/geminiService.js", "../backend/routes/ai.js", "../src/utils/aiSimulator.js"], state: "active", last: "sato@2026-10-31" }
import assert from 'node:assert';
import { DEFAULT_MODEL_NAMES } from '../backend/services/geminiService.js';
import { generateSmartFallbackAnswer } from '../backend/routes/ai.js';
import { generateMentorResponse } from '../src/utils/aiSimulator.js';

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
console.log("🧪 TDD: AI Chatbot Active Model Chain & Rich Non-Repetitive Answers");
console.log("================================================================\n");

console.log("--- 1. Testing Default Gemini Model Chain Configuration ---");

it("DEFAULT_MODEL_NAMES contains verified active models (gemini-3.5-flash, gemini-3.6-flash, gemini-3.5-flash-lite)", () => {
  assert.ok(DEFAULT_MODEL_NAMES.includes('gemini-3.5-flash'), "Should include gemini-3.5-flash");
  assert.ok(DEFAULT_MODEL_NAMES.includes('gemini-3.6-flash'), "Should include gemini-3.6-flash");
  assert.ok(DEFAULT_MODEL_NAMES.includes('gemini-3.5-flash-lite'), "Should include gemini-3.5-flash-lite");
  assert.strictEqual(DEFAULT_MODEL_NAMES[0], 'gemini-3.5-flash', "gemini-3.5-flash should be primary model in chain");
});

console.log("\n--- 2. Testing Specific Conceptual Answers (No Generic 3-Bullet Template) ---");

it("Answers 'Explain how neural networks learn in simple terms' with real deep learning concepts", () => {
  const query = "Explain how neural networks learn in simple terms";
  const resp = generateSmartFallbackAnswer(query, "Sajid", "Frontend Developer", "React, JavaScript", "Docker, AWS", "general");
  
  assert.ok(!resp.includes("Focus on foundational principles and mechanics behind *Explain how neural networks learn in simple terms*"), 
    "Must NOT return the generic canned fallback template");
  assert.ok(/weights|biases|forward pass|loss function|backpropagation|error|adjust/i.test(resp),
    "Must explain real neural network learning mechanisms (weights, backpropagation, error correction)");
});

it("Answers frontend questions (CSS Flexbox vs Grid) with specific actionable CSS concepts", () => {
  const query = "Explain CSS Flexbox vs Grid and when to use each";
  const resp = generateSmartFallbackAnswer(query, "Sajid", "Frontend Developer", "React, JavaScript", "Docker, AWS", "general");
  
  assert.ok(!resp.includes("Focus on foundational principles and mechanics behind *Explain CSS Flexbox"),
    "Must NOT return the generic canned fallback template");
  assert.ok(/flexbox|grid|1d|2d|rows|columns|flex-direction/i.test(resp),
    "Must explain 1D vs 2D layout and core differences");
});

it("Answers API architecture (REST vs GraphQL) with specific API mechanics", () => {
  const query = "What is the difference between REST API and GraphQL?";
  const resp = generateSmartFallbackAnswer(query, "Sajid", "Frontend Developer", "React, JavaScript", "Docker, AWS", "general");
  
  assert.ok(!resp.includes("Focus on foundational principles and mechanics behind *What is the difference"),
    "Must NOT return the generic canned fallback template");
  assert.ok(/over-fetching|under-fetching|endpoints|query|mutation/i.test(resp),
    "Must explain over/under fetching, endpoints, and GraphQL query advantages");
});

console.log("\n--- 3. Testing Frontend AI Simulator Consistency ---");

it("aiSimulator generateMentorResponse also provides real neural network explanation", () => {
  const query = "Explain how neural networks learn in simple terms";
  const resp = generateMentorResponse([], query, { candidateName: "Sajid", targetRole: "Frontend Developer" });
  
  assert.ok(!resp.includes("Focus on foundational principles and mechanics behind"),
    "aiSimulator must NOT return generic canned fallback");
  assert.ok(/neural network|weights|inputs|learning|prediction|error/i.test(resp),
    "aiSimulator must provide real neural network concepts");
});

console.log("\n----------------------------------------------------------------");
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log("----------------------------------------------------------------");

if (failed > 0) {
  process.exit(1);
}

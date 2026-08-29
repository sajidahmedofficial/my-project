// agent-notes: { ctx: "TDD Unit tests verifying empty/corrupted/unparsed resume produces 0 mock data and completely blank fields", deps: ["../backend/services/resumeAnalyzer.service.js"], state: "active", last: "tara@2026-08-29" }
import assert from 'assert';
import { analyzeResume } from '../backend/services/resumeAnalyzer.service.js';

async function runTests() {
  console.log("🧪 [TDD RED-GREEN] Testing Zero Mock Fallback for Empty/Corrupted Resumes...\n");

  // Scenario 1: analyzeResume with empty string
  console.log("▶ Scenario 1: Calling analyzeResume with empty string ''");
  const res1 = await analyzeResume("", "Full Stack Developer");
  assert.strictEqual(res1.candidate.firstName, "", "First name must be empty for blank input");
  assert.strictEqual(res1.candidate.lastName, "", "Last name must be empty for blank input");
  assert.strictEqual(res1.candidate.email, "", "Email must be empty for blank input");
  assert.strictEqual(res1.candidate.phone, "", "Phone must be empty for blank input");
  assert.strictEqual(res1.candidate.summary, "", "Summary must be empty for blank input");
  assert.deepStrictEqual(res1.education, [], "Education array must be empty []");
  assert.deepStrictEqual(res1.experience, [], "Experience array must be empty []");
  assert.deepStrictEqual(res1.skills.detected, [], "Skills detected must be empty []");
  console.log("✅ Scenario 1 Passed: Empty resume produces strictly blank fields!\n");

  // Scenario 2: analyzeResume with undefined / null
  console.log("▶ Scenario 2: Calling analyzeResume with null / undefined");
  const res2 = await analyzeResume(null, "Full Stack Developer");
  assert.strictEqual(res2.candidate.firstName, "");
  assert.strictEqual(res2.candidate.lastName, "");
  assert.deepStrictEqual(res2.education, []);
  assert.deepStrictEqual(res2.experience, []);
  assert.deepStrictEqual(res2.skills.detected, []);
  console.log("✅ Scenario 2 Passed: Null input produces strictly blank fields!\n");

  // Scenario 3: analyzeResume with unparsable gibberish / corrupted content
  console.log("▶ Scenario 3: Calling analyzeResume with corrupted random bytes/gibberish");
  const corrupted = "%%%###$$$ random binary content non-words !@# 1234567890 ^&*()";
  const res3 = await analyzeResume(corrupted, "Full Stack Developer");
  assert.strictEqual(res3.candidate.firstName, "", "No hallucinated first name");
  assert.strictEqual(res3.candidate.lastName, "", "No hallucinated last name");
  assert.deepStrictEqual(res3.experience, [], "No fake work experience");
  assert.deepStrictEqual(res3.education, [], "No fake education");
  assert.deepStrictEqual(res3.skills.detected, [], "No fake skills");
  console.log("✅ Scenario 3 Passed: Corrupted input produces strictly blank fields!\n");

  // Scenario 4: Real Resume with real data
  console.log("▶ Scenario 4: Real Resume with genuine candidate info & internship");
  const realResume = `
Jane Doe
jane.doe@techcorp.io
(555) 019-2834
linkedin.com/in/janedoe

PROFESSIONAL SUMMARY
Senior Frontend Engineer with 5+ years experience building React apps.

WORK EXPERIENCE
Frontend Engineer Intern
Tech Solutions
2023 - Present
• Engineered UI components in React.

EDUCATION
Stanford University - B.S. in Computer Science (2024)

SKILLS
React, TypeScript, JavaScript, HTML, CSS, Git
  `.trim();

  const res4 = await analyzeResume(realResume, "Frontend Developer");
  assert.strictEqual(res4.candidate.firstName, "Jane");
  assert.strictEqual(res4.candidate.lastName, "Doe");
  assert.strictEqual(res4.candidate.email, "jane.doe@techcorp.io");
  assert.strictEqual(res4.experience.length, 1);
  assert.strictEqual(res4.experience[0].role, "Frontend Engineer Intern");
  assert.strictEqual(res4.education.length, 1);
  assert.strictEqual(res4.education[0].school, "Stanford University");
  assert(res4.skills.detected.includes("React"));
  console.log("✅ Scenario 4 Passed: Real resume extracts real data accurately!\n");

  console.log("🎉 ALL ZERO-MOCK TDD TESTS PASSED (4/4)!");
}

runTests().catch(err => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});

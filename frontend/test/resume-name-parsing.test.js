// agent-notes: { ctx: "Unit tests verifying candidate name & phone extraction across multiple resume layouts", deps: ["../backend/services/resumeAnalyzer.service.js"], state: "active", last: "anti@2026-08-29" }
import assert from 'assert';
import { analyzeResume } from '../backend/services/resumeAnalyzer.service.js';

async function runTests() {
  console.log("🧪 Running Resume Name & Phone Extraction Tests...\n");

  // Test Case 1: Job Title as First Line, Actual Name on Second Line
  const resume1 = `
Full Stack Web Developer
Sajid Ahmed
sajidahmedofficial110@gmail.com
+91 98765 43210
linkedin.com/in/sajidahmed

EDUCATION
Anna University - B.Tech in Computer Science (2025)

SKILLS
JavaScript, React, Node.js, HTML, CSS, SQL
  `.trim();

  const res1 = await analyzeResume(resume1, "Full Stack Developer");
  console.log("Test 1 Candidate Parsed:", res1.candidate);
  console.log("Test 1 Education Parsed:", res1.education);
  assert.strictEqual(res1.candidate.firstName, "Sajid", "First name should be Sajid, not Full");
  assert.strictEqual(res1.candidate.lastName, "Ahmed", "Last name should be Ahmed, not Stack Web Developer");
  assert.strictEqual(res1.candidate.email, "sajidahmedofficial110@gmail.com");
  assert(res1.candidate.phone.includes("98765"), "Phone number should be parsed");
  assert(Array.isArray(res1.education) && res1.education.length > 0, "Education array must not be empty");
  assert.strictEqual(res1.education[0].school, "Anna University");
  console.log("✅ Test 1 Passed: Job title ignored, personal name and clean education correctly extracted!\n");

  // Test Case 2: Resume starts with "CURRICULUM VITAE", Name below it
  const resume2 = `
CURRICULUM VITAE
Jane Doe
jdoe@example.com
(555) 019-2834
https://linkedin.com/in/janedoe

EXPERIENCE
Acme Technologies Inc.
Software Engineer
2022 - Present
Developed web components.
  `.trim();

  const res2 = await analyzeResume(resume2, "Frontend Developer");
  console.log("Test 2 Candidate Parsed:", res2.candidate);
  console.log("Test 2 Experience Parsed:", res2.experience);
  assert.strictEqual(res2.candidate.firstName, "Jane");
  assert.strictEqual(res2.candidate.lastName, "Doe");
  assert(res2.candidate.phone.includes("555"));
  assert(Array.isArray(res2.experience) && res2.experience.length > 0, "Experience array must not be empty");
  console.log("✅ Test 2 Passed: Header skipped, name and experience correctly extracted!\n");

  // Test Case 3: Candidate Name splitting and email username non-bleed test
  const resume3 = `
Sajid Ahmed
sajidahmedofficail110@gmail.com
8778513050

PROFESSIONAL SUMMARY
To secure a position as a Software Engineer in a top-tier organization where I can effectively and innovatively utilize my development skills and continuously enhance my knowledge as a fast learner. I aim to contribute to the organization's success through strong communication, effective leadership, consistency, and dedication. Educational Qualification QualificationInstitution% of MarksYear

EDUCATION
B.Tech in Computer Science
Anna University
85%
2025

SKILLS
HTML, CSS, JavaScript, React, Node.js, SQL
  `.trim();

  const res3 = await analyzeResume(resume3, "Full Stack Developer");
  console.log("Test 3 Candidate Parsed:", res3.candidate);
  console.log("Test 3 Summary Parsed:", res3.summary);
  console.log("Test 3 Education Parsed:", res3.education);

  assert.strictEqual(res3.candidate.firstName, "Sajid", "First name should be Sajid");
  assert.strictEqual(res3.candidate.lastName, "Ahmed", "Last name should be Ahmed (not Ahmedofficail)");
  assert.strictEqual(res3.candidate.email, "sajidahmedofficail110@gmail.com");
  assert(!res3.summary.includes("Educational Qualification"), "Summary must NOT include Educational Qualification header");
  assert(!res3.summary.includes("Institution% of MarksYear"), "Summary must NOT include table headers");
  assert(res3.summary.includes("dedication."), "Summary narrative should be intact");
  console.log("✅ Test 3 Passed: Header name cleanly split, email username did not bleed in, and summary table fragments cleanly stripped!\n");

  // Test Case 4: Fresher / 0 Experience Resume
  const resume4 = `
John Smith
john@college.edu
EDUCATION
IIT Madras - B.Tech (2026)
SKILLS
Python, C++, Data Structures
  `.trim();

  const res4 = await analyzeResume(resume4, "Backend Engineer");
  assert.strictEqual(res4.hasExperience, false);
  assert.strictEqual(res4.experience.length, 0);
  console.log("✅ Test 4 Passed: Fresher candidate has 0 experience and no fake companies!\n");

  console.log("🎉 ALL RESUME PARSER UNIT TESTS PASSED (4/4)!");
}

runTests().catch(err => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});

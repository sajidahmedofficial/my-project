// agent-notes: { ctx: "Unit tests for full structured resume parsing, strict education vs experience separation, and Action + Metric + Impact cleaning", deps: ["../lib/parseResume.js"], state: "active", last: "anti@2026-10-01" }
import assert from "assert";
import { parseResume, cleanExperience, EDU_WORDS, DATE_ONLY, TEMPLATE_TEXT } from "../lib/parseResume.js";

async function runTests() {
  console.log("🧪 Testing Full Resume Parser, Education vs Experience Separation, and Placeholder Cleaning...\n");

  // TEST 1: cleanExperience filters out education in titles, date-only companies, and placeholder bullets
  console.log("▶ Test 1: cleanExperience sanity checks");
  const dirtyExperience = [
    {
      title: "B.E. Computer Science and Engineering",
      company: "Expected 2027",
      startDate: "2023",
      endDate: "2027",
      bullets: ["Action + Metric + Impact: Higher Secondary Education"]
    },
    {
      title: "Full Stack Development Intern",
      company: "Software Solutions Company",
      startDate: "Jan 2023",
      endDate: "Present",
      bullets: [
        "Action + Metric + Impact: Built core features reducing latency by 30%",
        "Action + Metric + Impact",
        "Engineered REST APIs with JWT authentication"
      ]
    },
    {
      title: "Higher Secondary",
      company: "ABC Matriculation School",
      startDate: "2021",
      endDate: "2023",
      bullets: ["Passed with 95% marks"]
    },
    {
      title: "Software Engineer",
      company: "2022 - 2024",
      startDate: "2022",
      endDate: "2024",
      bullets: ["Developed backend microservices"]
    }
  ];

  const cleaned = cleanExperience(dirtyExperience);
  assert.strictEqual(cleaned.length, 1, "Only the real software internship should survive cleanExperience");
  assert.strictEqual(cleaned[0].title, "Full Stack Development Intern");
  assert.strictEqual(cleaned[0].company, "Software Solutions Company");
  assert.strictEqual(cleaned[0].bullets.length, 2, "Template-only bullet must be removed");
  assert(!cleaned[0].bullets.some(b => TEMPLATE_TEXT.test(b)), "Bullets must not contain Action + Metric + Impact");
  console.log("✅ Test 1 Passed: cleanExperience strictly eliminated education data, date-only companies, and template text!\n");

  // TEST 2: Fresher resume with Education only (the exact bug from user's screenshot)
  console.log("▶ Test 2: Fresher student resume (Education only, zero experience)");
  const studentResume = `
John Doe
johndoe@email.com
+1 555-019-2834

EDUCATION
B.E. Computer Science and Engineering
ABC Institute of Technology
Expected 2027
2023 - 2027
• Higher Secondary Education: 95% in Board Exams

SKILLS
Python, JavaScript, React, Node.js, SQL

PROJECTS
Task Manager App
A task tracking tool built with React and Node.js
Technologies: React, Node.js, Express, MongoDB
  `.trim();

  const parsedStudent = await parseResume(studentResume);
  console.log("Parsed Student Experience Count:", parsedStudent.experience.length);
  console.log("Parsed Student Education:", parsedStudent.education);

  assert.strictEqual(parsedStudent.experience.length, 0, "Fresher resume must have exactly 0 experience entries");
  assert(parsedStudent.education.length > 0, "Education must be extracted into education array");
  assert(parsedStudent.education.some(e => /computer\s+science/i.test(e.degree || "")), "Degree should be in education");
  assert.strictEqual(parsedStudent.firstName, "John");
  assert.strictEqual(parsedStudent.lastName, "Doe");
  console.log("✅ Test 2 Passed: Student resume parsed with 0 experience and proper education extraction!\n");

  // TEST 3: Resume with both Work Experience and Education
  console.log("▶ Test 3: Resume with distinct Work Experience and Education");
  const proResume = `
Sarah Connor
sarah@cyberdyne.io
(555) 987-6543

EDUCATION
B.Tech in Information Technology
Tech State University | 2018 - 2022

EXPERIENCE
Frontend Software Engineer
Cyberdyne Systems
Jun 2022 - Present
• Built responsive dashboard using React and TypeScript.
• Optimized bundle size by 35% using code splitting.

SKILLS
React, TypeScript, CSS, Git
  `.trim();

  const parsedPro = await parseResume(proResume);
  assert.strictEqual(parsedPro.experience.length, 1, "Must extract exactly 1 work experience");
  assert.strictEqual(parsedPro.experience[0].title, "Frontend Software Engineer");
  assert.strictEqual(parsedPro.experience[0].company, "Cyberdyne Systems");
  assert.strictEqual(parsedPro.education.length, 1, "Must extract 1 education entry");
  assert.strictEqual(parsedPro.education[0].institution, "Tech State University");
  assert(!parsedPro.experience[0].bullets.some(b => TEMPLATE_TEXT.test(b)), "Must not have Action + Metric + Impact in bullets");
  console.log("✅ Test 3 Passed: Combined resume separates education and experience properly!\n");

  console.log("🎉 ALL PARSE RESUME UNIT TESTS PASSED!");
}

runTests().catch(err => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});

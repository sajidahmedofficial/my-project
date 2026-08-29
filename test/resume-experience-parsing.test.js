// agent-notes: { ctx: "Unit tests verifying multi-role work experience, start/end dates, bullets, and summary extraction from real resumes", deps: ["../backend/services/resumeAnalyzer.service.js"], state: "active", last: "anti@2026-08-29" }
import assert from 'assert';
import { analyzeResume } from '../backend/services/resumeAnalyzer.service.js';

async function runTests() {
  console.log("🧪 Testing Real Multi-Role Work Experience, Start/End Dates & Summary Parser...\n");

  // TEST 1: Resume with 1 Job (Matching user's exact screenshot content)
  const resume1 = `
Sajid Ahmed
sajidahmedofficial110@gmail.com
+91 98765 43210
https://linkedin.com/in/sajidahmed

PROFESSIONAL SUMMARY
Computer Science Engineering student and aspiring Full Stack Developer with hands-on experience building responsive web applications and AI-powered solutions. Skilled in HTML, CSS, JavaScript, React.js, Node.js, Express.js, Python, SQL, REST APIs, WordPress, and AI API integration.

SKILLS
JavaScript, Python, C, C++, Microsoft SQL Server, HTML, CSS, React, Web design, Node.js, RESTful API, Git, GitHub, WordPress

WORK EXPERIENCE
Full Stack Development Intern
Software Solutions Company
Jan 2023 - Present
• Built and integrated frontend and backend components for web applications using JavaScript and modern web technologies.
• Worked with APIs, databases, responsive interfaces, debugging, and application integration.

EDUCATION
Anna University
Bachelor of Technology (B.Tech) in Computer Science
2021 - 2025
  `.trim();

  const res1 = await analyzeResume(resume1, "Full Stack Developer");

  console.log("▶ Test 1 Result:");
  console.log("Summary:", res1.candidate.summary);
  console.log("Experience Count:", res1.experience.length);
  console.log("Experience [0]:", res1.experience[0]);

  assert(res1.candidate.summary.includes("Computer Science Engineering student"), "Summary must be extracted");
  assert.strictEqual(res1.experience.length, 1, "Must find exactly 1 role");
  assert.strictEqual(res1.experience[0].role, "Full Stack Development Intern");
  assert.strictEqual(res1.experience[0].company, "Software Solutions Company");
  assert.strictEqual(res1.experience[0].startDate, "Jan 2023");
  assert.strictEqual(res1.experience[0].endDate, "", "End date must be blank when 'Present'");
  assert(res1.experience[0].description.includes("Built and integrated frontend and backend components"), "Must retain bullet 1");
  assert(res1.experience[0].description.includes("Worked with APIs, databases"), "Must retain bullet 2");
  console.log("✅ Test 1 Passed: 1-Job Resume parsed with summary and clean dates!\n");

  // TEST 2: Resume with 3 Distinct Roles
  const resume2 = `
Jane Doe
jane.doe@techcareer.io
(555) 019-2834

PROFESSIONAL SUMMARY
Lead Software Architect with 8+ years building distributed cloud platforms.

WORK EXPERIENCE
Senior Full Stack Engineer
Google Inc.
Mar 2021 - Present
• Architected microservices serving 10M+ daily active users.
• Reduced API response latency by 45% using Redis caching.

Software Engineer II
Stripe Payments
2018 - 2021
• Developed automated payment dispute resolution pipeline in Node.js.
• Maintained 99.99% uptime SLA across critical payment endpoints.

Frontend Developer Intern
Acme Startup Labs
Jan 2017 - Aug 2017
• Built interactive dashboard components in React and Tailwind CSS.

EDUCATION
Stanford University - B.S. in Computer Science (2018)
  `.trim();

  const res2 = await analyzeResume(resume2, "Full Stack Developer");

  console.log("▶ Test 2 Result (3 Roles):");
  res2.experience.forEach((e, i) => {
    console.log(` Role #${i + 1}: ${e.role} at ${e.company} (${e.startDate} - ${e.endDate || 'Present'})`);
  });

  assert.strictEqual(res2.experience.length, 3, "Must find all 3 distinct roles");
  assert.strictEqual(res2.experience[0].role, "Senior Full Stack Engineer");
  assert.strictEqual(res2.experience[0].company, "Google Inc.");
  assert.strictEqual(res2.experience[0].startDate, "Mar 2021");
  assert.strictEqual(res2.experience[0].endDate, "");

  assert.strictEqual(res2.experience[1].role, "Software Engineer II");
  assert.strictEqual(res2.experience[1].company, "Stripe Payments");
  assert.strictEqual(res2.experience[1].startDate, "2018");
  assert.strictEqual(res2.experience[1].endDate, "2021");

  assert.strictEqual(res2.experience[2].role, "Frontend Developer Intern");
  assert.strictEqual(res2.experience[2].company, "Acme Startup Labs");
  assert.strictEqual(res2.experience[2].startDate, "Jan 2017");
  assert.strictEqual(res2.experience[2].endDate, "Aug 2017");
  console.log("✅ Test 2 Passed: Multi-role (3 jobs) parsed correctly without losing any roles!\n");

  // TEST 3: Fresher Resume with 0 Work Experience
  const resume3 = `
Alex Rivera
alex@university.edu
+1 555-123-4567

EDUCATION
MIT - B.S. in Computer Science (2026)

PROJECTS
• AI Code Reviewer: Built full-stack code linter using AST parser.

SKILLS
Python, JavaScript, React, PostgreSQL
  `.trim();

  const res3 = await analyzeResume(resume3, "Software Engineer");
  console.log("▶ Test 3 Result (Fresher):", res3.experience);
  assert.strictEqual(res3.experience.length, 0, "Fresher must have 0 experience items");
  assert.strictEqual(res3.hasExperience, false, "hasExperience must be false");
  console.log("✅ Test 3 Passed: Fresher candidate has strictly 0 experience with no mock data!\n");

  console.log("🎉 ALL REAL WORK EXPERIENCE PARSER TESTS PASSED (3/3)!");
}

runTests().catch(err => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});

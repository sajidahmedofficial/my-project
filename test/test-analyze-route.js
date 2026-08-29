// agent-notes: { ctx: "Integration test verifying POST /api/resume/analyze route directly with native fetch and FormData", deps: [], state: "active", last: "anti@2026-08-29" }
import assert from 'assert';

async function runRouteTest() {
  console.log("🧪 Testing POST /api/resume/analyze route directly via fetch...");

  const resumeText = `
Sajid Ahmed
sajidahmedofficial110@gmail.com
+91 98765 43210
linkedin.com/in/sajidahmed

PROFESSIONAL SUMMARY
Full stack developer with extensive experience in React, Node.js, and AI API integrations.

WORK EXPERIENCE
Full Stack Development Intern
Software Solutions Company
Jan 2023 - Present
• Engineered full stack components in React and Node.js.

EDUCATION
Anna University
B.Tech in Information Technology
2025

SKILLS
JavaScript, React, Node.js, Python, SQL, Git
  `.trim();

  const formData = new FormData();
  const blob = new Blob([resumeText], { type: 'text/plain' });
  formData.append('resume', blob, 'Sajid_Ahmed_Resume.pdf');
  formData.append('targetRole', 'Full Stack Developer');

  const res = await fetch('http://localhost:5000/api/resume/analyze', {
    method: 'POST',
    body: formData
  });

  console.log("Response Status:", res.status);
  const data = await res.json();
  console.log("Response Body:", JSON.stringify(data, null, 2));

  assert.strictEqual(res.status, 200, "Route must return 200 OK");
  assert.strictEqual(data.success, true);
  assert(data.analysis, "Analysis object must exist");
  assert.strictEqual(data.analysis.candidate.firstName, "Sajid");
  assert.strictEqual(data.analysis.candidate.lastName, "Ahmed");
  assert.strictEqual(data.analysis.experience.length, 1);
  assert.strictEqual(data.analysis.education.length, 1);

  console.log("✅ Route /api/resume/analyze test PASSED!");
  process.exit(0);
}

runRouteTest().catch(err => {
  console.error("❌ Route test failed:", err);
  process.exit(1);
});

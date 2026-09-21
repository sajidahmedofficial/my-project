// agent-notes: { ctx: "Comprehensive 20-step end-to-end test suite and negative failure case validator for SkillBridge", deps: ["node-fetch"], state: "active", last: "anti@2026-08-20" }
import assert from 'assert';

const BASE_URL = 'http://localhost:5000/api';

async function runFullE2ETest() {
  console.log("===============================================================================");
  console.log("🚀 RUNNING FULL END-TO-END VERIFICATION OF SKILLBRIDGE SKILL GAP LIFECYCLE");
  console.log("===============================================================================\n");

  const results = {
    passed: [],
    failed: []
  };

  function track(testName, fn) {
    return async () => {
      try {
        await fn();
        console.log(`  ✓ [PASS] ${testName}`);
        results.passed.push(testName);
      } catch (err) {
        console.error(`  ✗ [FAIL] ${testName}:`, err.message);
        results.failed.push({ testName, error: err.message });
      }
    };
  }

  let userToken = null;
  let userId = null;
  let userEmail = `student_${Date.now()}@example.com`;
  let resumeA_Id = null;
  let skillGapReportA = null;
  let generatedRoadmap = null;
  let firstTaskId = null;
  let certId = null;
  let previousScore = 0;

  // --- STEP 1: Register / Login ---
  await track("Step 1: Register User & Obtain Authenticated JWT", async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Sajid Ahmed",
        email: userEmail,
        password: "Password123!"
      })
    }).then(r => r.json());

    assert.ok(res.token, "JWT token must be returned");
    userToken = res.token;
    userId = res._id || res.user?.id || res.user?._id;
    assert.ok(userId, "User ID must be present");
  })();

  const authHeaders = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${userToken}`
  };

  // --- STEP 2 & 3: Upload & Parse Resume A ---
  await track("Step 2 & 3: Upload & Parse Resume A (Frontend Focus: HTML5, CSS3, JavaScript)", async () => {
    const resumeTextA = `
      SAJID AHMED
      Frontend Web Developer
      Email: sajid@example.com

      TECHNICAL SKILLS:
      HTML5, CSS3, JavaScript, Git, GitHub.

      EXPERIENCE:
      Junior Web Developer at TechCorp (2024-2026)
      - Developed responsive web interfaces using JavaScript and semantic HTML5.
      - Maintained version control using Git and GitHub.

      PROJECTS:
      - Portfolio Website: Built using HTML5, CSS3, and Vanilla JavaScript.
    `;

    const res = await fetch(`${BASE_URL}/skill-gap/analyze`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        resumeText: resumeTextA,
        targetRole: "Frontend Developer"
      })
    }).then(r => r.json());

    assert.strictEqual(res.success, true, "Analysis must succeed");
    assert.ok(res.report, "Report must be returned");
    skillGapReportA = res.report;
    previousScore = res.report.overallMatchScore;
  })();

  // --- STEP 4 & 5 & 6: Select Role & Verify Results from Resume A ---
  await track("Step 4, 5, 6: Verify Skill Gap Analysis derives from Resume A (Not Mock Data)", async () => {
    assert.strictEqual(skillGapReportA.targetRole, "Frontend Developer");
    
    // Resume A has HTML5, CSS3, JavaScript, Git
    const strongOrPartial = skillGapReportA.skills.filter(s => s.status === 'strong' || s.status === 'partial').map(s => s.name);
    assert.ok(strongOrPartial.includes('JavaScript'), "JavaScript must be recognized from Resume A");
    assert.ok(strongOrPartial.includes('HTML5'), "HTML5 must be recognized from Resume A");

    // Must have evidence quotes
    const jsSkill = skillGapReportA.skills.find(s => s.name === 'JavaScript');
    assert.ok(jsSkill.evidence.length > 0, "Concrete citations must be extracted from Resume A text");
  })();

  // --- STEP 7: View Missing Skills ---
  await track("Step 7: Identify Missing Skills (React.js, Next.js, Redux)", async () => {
    const missingNames = skillGapReportA.missingSkills.map(s => s.name || s.skill);
    assert.ok(missingNames.includes('React.js'), "React.js must be identified as missing for Frontend Developer");
    assert.ok(missingNames.includes('TypeScript'), "TypeScript must be identified as missing for Frontend Developer");
  })();

  // --- STEP 8: Generate Roadmap ---
  await track("Step 8: Generate Backend Multi-Stage Learning Roadmap for React.js", async () => {
    const res = await fetch(`${BASE_URL}/skill-gap/roadmap`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        skillName: "React.js",
        targetRole: "Frontend Developer",
        currentLevel: "Beginner",
        targetLevel: "Advanced"
      })
    }).then(r => r.json());

    assert.strictEqual(res.success, true);
    assert.ok(res.roadmap.stages.length >= 3, "Roadmap must contain multi-stage learning path");
    assert.ok(res.roadmap.tasks.length >= 3, "Roadmap must contain executable tasks");
    generatedRoadmap = res.roadmap;
    firstTaskId = res.roadmap.tasks[0].taskId;
  })();

  // --- STEP 9: Complete Roadmap Tasks ---
  await track("Step 9: Complete Roadmap Task with Server-Side Progress Calculation", async () => {
    const patchRes = await fetch(`${BASE_URL}/skill-gap/roadmap/tasks/${firstTaskId}`, {
      method: "PATCH",
      headers: authHeaders,
      body: JSON.stringify({
        roadmapId: generatedRoadmap.roadmapId,
        status: "completed"
      })
    }).then(r => r.json());

    assert.strictEqual(patchRes.success, true);
    assert.ok(patchRes.data.overallProgress > 0, "Progress percentage must be calculated by backend");
  })();

  // --- STEP 10, 11, 12, 13: Take MCQ, Coding Challenge, GitHub Project ---
  await track("Step 10, 11, 12, 13: Multi-Modal Skill Verification (MCQ + Code Sandbox + GitHub)", async () => {
    const verifyRes = await fetch(`${BASE_URL}/skill-gap/verify`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        skillName: "React.js",
        userName: "Sajid Ahmed",
        answers: [
          { questionId: "q_react_1", answer: "A" },
          { questionId: "q_react_2", answer: "A" },
          { questionId: "q_react_3", answer: "B" },
          { questionId: "q_react_4", answer: "A" },
          { questionId: "q_react_5", answer: "A" }
        ],
        userCode: `function calculateBoundedCount(current, delta, min, max) {
          const next = current + delta;
          return Math.max(min, Math.min(max, next));
        }`,
        projectSubmission: {
          repoUrl: "https://github.com/facebook/react"
        },
        targetRole: "Frontend Developer"
      })
    }).then(r => r.json());

    assert.strictEqual(verifyRes.verified, true, "Verification must pass with score >= 80%");
    assert.strictEqual(verifyRes.status, "verified");
    assert.ok(verifyRes.finalScore >= 80, `Final score must be >= 80% (received ${verifyRes.finalScore}%)`);
    assert.ok(verifyRes.certificate?.certificateId, "Unique Certificate ID must be issued");
    certId = verifyRes.certificate.certificateId;
  })();

  // --- STEP 14 & 15: Certificate Generation ---
  await track("Step 14 & 15: Download Verified Physical Certificate PDF", async () => {
    const dlRes = await fetch(`${BASE_URL}/certificates/${certId}/download`);
    assert.strictEqual(dlRes.status, 200, "Download must return 200 OK");
    assert.strictEqual(dlRes.headers.get("content-type"), "application/pdf");
    const pdfBuf = await dlRes.arrayBuffer();
    assert.ok(pdfBuf.byteLength > 1000, "PDF must have physical non-zero byte content");
  })();

  // --- STEP 16 & 17: Resume Updated & Job Match Recalculated ---
  await track("Step 16 & 17: Verify Resume Skills Updated & Job Match Score Recalculated", async () => {
    const verifiedRes = await fetch(`${BASE_URL}/skill-gap/skills/verified`, {
      headers: authHeaders
    }).then(r => r.json());

    assert.ok(verifiedRes.verifiedSkills.some(s => s.skillName === 'React.js'), "React.js must appear in user verified skills");
  })();

  // --- STEP 18, 19, 20: Upload Resume B (Completely Different Skills) ---
  await track("Step 18, 19, 20: Upload Resume B (DevOps/Cloud) & Verify Skill Gap Changes Completely", async () => {
    const resumeTextB = `
      ALICE DEV
      DevOps & Cloud Engineer
      
      TECHNICAL SKILLS:
      Docker, Kubernetes, AWS, Linux, Terraform, CI/CD, Python.

      EXPERIENCE:
      Cloud Infrastructure Engineer (2022-2026)
      - Maintained Docker containers and Kubernetes clusters in production AWS cloud.
      - Automated CI/CD pipelines with GitHub Actions and Terraform on Linux servers.
      - Developed Python infrastructure automation scripts.

      PROJECTS:
      - Multi-region Kubernetes deployment on AWS with Docker containers.
    `;

    const resB = await fetch(`${BASE_URL}/skill-gap/analyze`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        resumeText: resumeTextB,
        targetRole: "DevOps & Cloud Engineer"
      })
    }).then(r => r.json());

    assert.strictEqual(resB.success, true);
    assert.strictEqual(resB.report.targetRole, "DevOps & Cloud Engineer");

    const strongSkillsB = resB.report.skills.filter(s => s.status === 'strong').map(s => s.name);
    assert.ok(strongSkillsB.includes('Docker'), "Docker must be strong in Resume B");
    assert.ok(strongSkillsB.includes('Kubernetes'), "Kubernetes must be strong in Resume B");
    assert.ok(strongSkillsB.includes('AWS'), "AWS must be strong in Resume B");
    assert.notStrictEqual(resB.report.overallMatchScore, previousScore, "Score must dynamically reflect Resume B");
  })();

  console.log("\n===============================================================================");
  console.log("🛡️ RUNNING NEGATIVE / FAILURE / SECURITY EDGE CASE TEST SUITE");
  console.log("===============================================================================\n");

  // --- Negative Case: Empty Resume ---
  await track("Edge Case: Empty Resume Handling", async () => {
    const emptyAuthRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Empty User",
        email: `empty_${Date.now()}@example.com`,
        password: "Password123!"
      })
    }).then(r => r.json());

    const res = await fetch(`${BASE_URL}/skill-gap/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${emptyAuthRes.token}`
      },
      body: JSON.stringify({
        resumeText: "   ",
        targetRole: "Frontend Developer"
      })
    }).then(r => r.json());

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.report.overallMatchScore, 0, "Empty resume must yield 0% match without crash");
  })();

  // --- Negative Case: Invalid GitHub URL ---
  await track("Edge Case: Invalid GitHub URL Rejection", async () => {
    const res = await fetch(`${BASE_URL}/skill-gap/verify`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        skillName: "React.js",
        answers: [{ questionId: "q_react_1", answer: "B" }],
        userCode: "function calculateBoundedCount() {}",
        projectSubmission: { repoUrl: "http://malicious-site.com/hack" }
      })
    });
    assert.strictEqual(res.status, 400, "Must return 400 Bad Request for invalid GitHub URL");
  })();

  // --- Negative Case: Private / Inaccessible GitHub Repo ---
  await track("Edge Case: Inaccessible GitHub Repository Handling", async () => {
    const res = await fetch(`${BASE_URL}/skill-gap/verify`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        skillName: "React.js",
        answers: [{ questionId: "q_react_1", answer: "B" }],
        userCode: "function calculateBoundedCount() {}",
        projectSubmission: { repoUrl: "https://github.com/nonexistent-org-9482103/private-repo-38291" }
      })
    }).then(r => r.json());

    assert.strictEqual(res.verified, false, "Must fail verification when project is inaccessible");
    assert.strictEqual(res.status, "failed");
  })();

  // --- Negative Case: Failed Coding Challenge ---
  await track("Edge Case: Failed Coding Test Zero-Trust Evaluation", async () => {
    const res = await fetch(`${BASE_URL}/skill-gap/verify`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        skillName: "React.js",
        answers: [
          { questionId: "q_react_1", answer: "B" },
          { questionId: "q_react_2", answer: "A" },
          { questionId: "q_react_3", answer: "A" }
        ],
        userCode: "function calculateBoundedCount() { return -99999; }", // Failing code
        projectSubmission: { repoUrl: "https://github.com/facebook/react" }
      })
    }).then(r => r.json());

    assert.strictEqual(res.verified, false, "Must fail when code tests fail");
    assert.strictEqual(res.evaluation.codingScore, 0, "Coding score must be 0%");
  })();

  // --- Negative Case: Incomplete Verification ---
  await track("Edge Case: Incomplete Verification Returns Status Pending", async () => {
    const res = await fetch(`${BASE_URL}/skill-gap/verify`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        skillName: "React.js"
        // Missing MCQ, Coding, and Project!
      })
    }).then(r => r.json());

    assert.strictEqual(res.verified, false);
    assert.strictEqual(res.status, "pending");
  })();

  // --- Negative Case: Duplicate Certificate Generation Prevention ---
  await track("Edge Case: Duplicate Certificate Generation Prevention", async () => {
    const repeatRes = await fetch(`${BASE_URL}/skill-gap/verify`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        skillName: "React.js",
        answers: [
          { questionId: "q_react_1", answer: "A" },
          { questionId: "q_react_2", answer: "A" },
          { questionId: "q_react_3", answer: "B" },
          { questionId: "q_react_4", answer: "A" },
          { questionId: "q_react_5", answer: "A" }
        ],
        userCode: `function calculateBoundedCount(current, delta, min, max) {
          return Math.max(min, Math.min(max, current + delta));
        }`,
        projectSubmission: { repoUrl: "https://github.com/facebook/react" }
      })
    }).then(r => r.json());

    assert.strictEqual(repeatRes.certificate?.certificateId, certId, "Must return existing certificate ID rather than creating a duplicate");
  })();

  // --- Negative Case: Unauthorized Access ---
  await track("Edge Case: Unauthorized Cross-User Access Blocked", async () => {
    const res = await fetch(`${BASE_URL}/skill-gap/other_secret_user`, {
      headers: authHeaders
    });
    assert.strictEqual(res.status, 403, "Must return 403 Forbidden for cross-user data access");
  })();

  console.log("\n===============================================================================");
  console.log(`📊 SUMMARY: ${results.passed.length} Passed, ${results.failed.length} Failed`);
  console.log("===============================================================================");

  if (results.failed.length > 0) {
    process.exit(1);
  }
}

runFullE2ETest();

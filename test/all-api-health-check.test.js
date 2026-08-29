// agent-notes: { ctx: "Comprehensive live API test suite verifying all SkillBridge backend endpoints and Resume Analyzer pipeline", deps: [], state: "active", last: "anti@2026-08-29" }

async function runAllApiTests() {
  console.log("🚀 Starting Comprehensive SkillBridge API & Resume Analyzer Test Suite...\n");
  const BASE_URL = "http://localhost:5000/api";
  let passed = 0;
  let total = 0;

  async function testEndpoint(name, fn) {
    total++;
    process.stdout.write(`Testing [${name}]... `);
    try {
      await fn();
      console.log("✅ PASSED");
      passed++;
    } catch (err) {
      console.log(`❌ FAILED: ${err.message}`);
    }
  }

  // 1. Health Check
  await testEndpoint("GET /api/health", async () => {
    const res = await fetch(`${BASE_URL}/health`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (data.status !== "OK") throw new Error("Health status is not OK");
  });

  // 2. Resume Analyze (Text payload)
  await testEndpoint("POST /api/resume/analyze (Resume Parsing & Score)", async () => {
    const sampleResume = "John Doe\njohn@example.com\n\nExperience:\n- Built React and Node.js web applications.\n- Optimized MongoDB database queries.";
    const formData = new FormData();
    const blob = new Blob([sampleResume], { type: "text/plain" });
    formData.append("resume", blob, "Resume.txt");
    formData.append("targetRole", "Full Stack Developer");

    const res = await fetch(`${BASE_URL}/resume/analyze`, {
      method: "POST",
      body: formData
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Status ${res.status}: ${err}`);
    }
    const data = await res.json();
    if (!data.success) throw new Error("success flag is false");
    if (!data.analysis || typeof data.analysis.scores?.overall !== "number") {
      throw new Error("Missing or invalid analysis score in payload");
    }
  });

  // 3. Resume Upload (Compatibility Alias)
  await testEndpoint("POST /api/resume/upload (Upload Fallback)", async () => {
    const formData = new FormData();
    const blob = new Blob(["Sample candidate text with HTML, CSS, JavaScript, React"], { type: "text/plain" });
    formData.append("resume", blob, "Sample_Resume.txt");

    const res = await fetch(`${BASE_URL}/resume/upload`, {
      method: "POST",
      body: formData
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error("Upload response success is false");
  });

  // 4. Resume Apply Fix
  await testEndpoint("POST /api/resume/apply-fix", async () => {
    const res = await fetch(`${BASE_URL}/resume/apply-fix`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ problemId: "grammar-fix-1" })
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error("Fix applied success is false");
  });

  // 5. Resume Update From Skills
  await testEndpoint("POST /api/resume/update-from-skills", async () => {
    const res = await fetch(`${BASE_URL}/resume/update-from-skills`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resumeData: { skills: ["HTML", "CSS"], experienceBullets: [] },
        verifiedSkills: ["React", "TypeScript"]
      })
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.updatedResume?.skills?.includes("React")) {
      throw new Error("Resume skills not properly updated");
    }
  });

  // 6. Skill Gap API
  await testEndpoint("POST /api/skills/gap", async () => {
    const res = await fetch(`${BASE_URL}/skills/gap`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userSkills: ["React", "JavaScript"],
        roleRequirements: ["React", "Node.js", "Docker"]
      })
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.success && !Array.isArray(data.missingSkills)) {
      throw new Error("Invalid skill gap payload");
    }
  });

  // 7. Aptitude Engine
  await testEndpoint("GET /api/aptitude/topics", async () => {
    const res = await fetch(`${BASE_URL}/aptitude/topics`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) {
      throw new Error("Topics must be an array");
    }
  });

  // 8. Learning Roadmap Generator
  await testEndpoint("POST /api/roadmap/generate", async () => {
    const res = await fetch(`${BASE_URL}/roadmap/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetRole: "Frontend Developer",
        currentSkills: ["HTML", "CSS"],
        weeklyCommitmentHours: 10
      })
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.success && !data.phases) {
      throw new Error("Roadmap generation failed");
    }
  });

  // 9. AI Job Description Analyzer
  await testEndpoint("POST /api/ai/analyze-jd", async () => {
    const res = await fetch(`${BASE_URL}/ai/analyze-jd`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jdText: "Looking for Senior React Developer with TypeScript, Next.js, and REST APIs.",
        studentSkills: ["React", "JavaScript"]
      })
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.jobProfile && !data.gapReport) {
      throw new Error("Job Description analysis was empty");
    }
  });

  // 10. AI Chat / Career Mentor
  await testEndpoint("POST /api/ai/chat", async () => {
    const res = await fetch(`${BASE_URL}/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "How can I improve my frontend resume score?"
      })
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.reply && !data.response && !data.message) {
      throw new Error("AI Chat reply was empty");
    }
  });

  console.log(`\n=========================================`);
  console.log(`🏁 ALL API TEST RESULTS: ${passed}/${total} endpoints operational (${Math.round((passed / total) * 100)}%)`);
  console.log(`=========================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runAllApiTests().catch(err => {
  console.error("Test runner encountered critical error:", err);
  process.exit(1);
});

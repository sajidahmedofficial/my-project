// agent-notes: { ctx: "TDD Unit test ensuring single separate roles without combined slashes or ampersands in skill gap and job analyzer", deps: ["../backend/services/skillGap.service.js"], state: "active", last: "anti@2026-09-23" }
import assert from 'assert';
import { ROLE_TAXONOMY, performSkillGapAnalysis } from '../backend/services/skillGap.service.js';

async function runTests() {
  console.log("🧪 Running Separate Single Roles Test Suite...\n");

  const singleRoles = [
    "Full Stack AI Engineer",
    "Frontend Developer",
    "Backend Engineer",
    "Full Stack Developer",
    "Data Scientist",
    "AI Engineer",
    "DevOps Engineer",
    "Cloud Engineer"
  ];

  // Test 1: Ensure each single role has a defined entry in ROLE_TAXONOMY
  console.log("Test 1: Checking all separate roles exist in ROLE_TAXONOMY...");
  for (const role of singleRoles) {
    const entry = ROLE_TAXONOMY[role];
    assert(entry, `ROLE_TAXONOMY must have an entry for separate role: "${role}"`);
    assert(entry.category, `Role "${role}" must have a category`);
    assert(entry.coreSkills, `Role "${role}" must have coreSkills`);
    assert(Object.keys(entry.coreSkills).length >= 4, `Role "${role}" must have at least 4 skill categories`);
    assert(entry.priorities, `Role "${role}" must have priorities`);
  }
  console.log("✅ Test 1 Passed: All 8 separate roles are defined in ROLE_TAXONOMY.\n");

  // Test 2: Ensure Data Scientist and AI Engineer are distinct and specialized
  console.log("Test 2: Verifying Data Scientist and AI Engineer have distinct skill profiles...");
  const dsSkills = Object.values(ROLE_TAXONOMY["Data Scientist"].coreSkills).flat();
  const aiSkills = Object.values(ROLE_TAXONOMY["AI Engineer"].coreSkills).flat();

  assert(dsSkills.some(s => s === "Pandas" || s === "Matplotlib" || s === "Tableau"), "Data Scientist should include data analytics/visualization skills");
  assert(aiSkills.some(s => s === "PyTorch" || s === "Hugging Face" || s === "LangChain"), "AI Engineer should include LLM/deep learning skills");
  console.log("✅ Test 2 Passed: Data Scientist and AI Engineer have specialized skill sets.\n");

  // Test 3: Ensure DevOps Engineer and Cloud Engineer are distinct and specialized
  console.log("Test 3: Verifying DevOps Engineer and Cloud Engineer have distinct skill profiles...");
  const devopsSkills = Object.values(ROLE_TAXONOMY["DevOps Engineer"].coreSkills).flat();
  const cloudSkills = Object.values(ROLE_TAXONOMY["Cloud Engineer"].coreSkills).flat();

  assert(devopsSkills.some(s => s === "Kubernetes" || s === "CI/CD" || s === "GitHub Actions"), "DevOps should include CI/CD and orchestration");
  assert(cloudSkills.some(s => s === "AWS" || s === "Networking / VPC" || s === "IAM"), "Cloud Engineer should include cloud architecture/networking/IAM");
  console.log("✅ Test 3 Passed: DevOps Engineer and Cloud Engineer have specialized skill sets.\n");

  // Test 4: Running performSkillGapAnalysis with single role "Data Scientist"
  console.log("Test 4: Running performSkillGapAnalysis with targetRole='Data Scientist'...");
  const mockResume = "Experienced in Python, SQL, Pandas, NumPy, Scikit-Learn, data visualization with Tableau.";
  const resDS = await performSkillGapAnalysis({ resumeText: mockResume, targetRole: "Data Scientist" });
  assert.strictEqual(resDS.targetRole, "Data Scientist");
  assert(resDS.overallMatchScore > 0, "Match score should be calculated for Data Scientist");
  console.log(`✅ Test 4 Passed: Data Scientist gap analysis executed successfully (match: ${resDS.overallMatchScore}%).\n`);

  // Test 5: Running performSkillGapAnalysis with single role "Cloud Engineer"
  console.log("Test 5: Running performSkillGapAnalysis with targetRole='Cloud Engineer'...");
  const mockResumeCloud = "Proficient in AWS, Docker, Terraform, Linux systems, networking and IAM security.";
  const resCloud = await performSkillGapAnalysis({ resumeText: mockResumeCloud, targetRole: "Cloud Engineer" });
  assert.strictEqual(resCloud.targetRole, "Cloud Engineer");
  assert(resCloud.overallMatchScore > 0, "Match score should be calculated for Cloud Engineer");
  console.log(`✅ Test 5 Passed: Cloud Engineer gap analysis executed successfully (match: ${resCloud.overallMatchScore}%).\n`);

  // Test 6: Legacy combined roles still work as fallbacks
  console.log("Test 6: Ensuring legacy combined role aliases are preserved for backward compatibility...");
  assert(ROLE_TAXONOMY["Data Scientist / AI Engineer"], "Legacy 'Data Scientist / AI Engineer' alias must exist");
  assert(ROLE_TAXONOMY["DevOps & Cloud Engineer"], "Legacy 'DevOps & Cloud Engineer' alias must exist");
  console.log("✅ Test 6 Passed: Backward compatibility preserved.\n");

  console.log("🎉 ALL SEPARATE SINGLE ROLES TESTS PASSED (6/6)!");
}

runTests().catch(err => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});

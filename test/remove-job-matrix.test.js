// agent-notes: { ctx: "TDD test verifying complete removal of Job Matrix page and redirection of related actions to Skill Gap", deps: [], state: "active", last: "sato@2026-09-25" }
import assert from 'assert';
import fs from 'fs';
import path from 'path';

async function runTests() {
  console.log("🧪 Running Job Matrix Page Removal Verification Tests...\n");

  const appFrontendPath = path.resolve('frontend/src/App.jsx');
  const appSrcPath = path.resolve('src/App.jsx');
  const dashboardFrontendPath = path.resolve('frontend/src/components/Dashboard.jsx');
  const dashboardSrcPath = path.resolve('src/components/Dashboard.jsx');
  const resumeFrontendPath = path.resolve('frontend/src/pages/ResumeAnalyzer.jsx');
  const resumeSrcPath = path.resolve('src/pages/ResumeAnalyzer.jsx');

  // TEST 1: App.jsx navigation items must NOT contain 'job' or 'Job Matrix'
  console.log("Test 1: Checking navigationItems in App.jsx...");
  const appFrontendContent = fs.readFileSync(appFrontendPath, 'utf8');
  const appSrcContent = fs.readFileSync(appSrcPath, 'utf8');

  assert(!appFrontendContent.includes("{ id: 'job', label: 'Job Matrix'"), "frontend/src/App.jsx must not have 'Job Matrix' in navigationItems");
  assert(!appSrcContent.includes("{ id: 'job', label: 'Job Matrix'"), "src/App.jsx must not have 'Job Matrix' in navigationItems");
  console.log("✅ Test 1 Passed: 'Job Matrix' removed from navigation items in both App.jsx files.\n");

  // TEST 2: App.jsx lazy imports & views must not render JobAnalyzer
  console.log("Test 2: Checking JobAnalyzer component mounting in App.jsx...");
  assert(!appFrontendContent.includes("<JobAnalyzer"), "frontend/src/App.jsx must not render <JobAnalyzer");
  assert(!appSrcContent.includes("<JobAnalyzer"), "src/App.jsx must not render <JobAnalyzer");
  assert(!appFrontendContent.includes("activeTab === 'job'"), "frontend/src/App.jsx must not have activeTab === 'job'");
  assert(!appSrcContent.includes("activeTab === 'job'"), "src/App.jsx must not have activeTab === 'job'");
  console.log("✅ Test 2 Passed: JobAnalyzer view removed from main layout in both App.jsx files.\n");

  // TEST 3: Dashboard.jsx Explore action routes to 'skillgap'
  console.log("Test 3: Checking Dashboard explore button action...");
  const dashFrontendContent = fs.readFileSync(dashboardFrontendPath, 'utf8');
  const dashSrcContent = fs.readFileSync(dashboardSrcPath, 'utf8');

  assert(!dashFrontendContent.includes("onNavigate('job')"), "frontend Dashboard must not navigate to 'job'");
  assert(!dashSrcContent.includes("onNavigate('job')"), "src Dashboard must not navigate to 'job'");
  assert(dashFrontendContent.includes("onNavigate('skillgap')"), "frontend Dashboard explore button must navigate to 'skillgap'");
  assert(dashSrcContent.includes("onNavigate('skillgap')"), "src Dashboard explore button must navigate to 'skillgap'");
  console.log("✅ Test 3 Passed: Dashboard explore action now routes to 'skillgap'.\n");

  // TEST 4: ResumeAnalyzer.jsx onOpenSkillBridge routes to 'skillgap'
  console.log("Test 4: Checking ResumeAnalyzer SkillBridge action button...");
  const resumeFrontendContent = fs.readFileSync(resumeFrontendPath, 'utf8');
  const resumeSrcContent = fs.readFileSync(resumeSrcPath, 'utf8');

  assert(!resumeFrontendContent.includes("onNavigate('job')"), "frontend ResumeAnalyzer must not navigate to 'job'");
  assert(!resumeSrcContent.includes("onNavigate('job')"), "src ResumeAnalyzer must not navigate to 'job'");
  console.log("✅ Test 4 Passed: ResumeAnalyzer now redirects to 'skillgap' instead of 'job'.\n");

  console.log("🎉 ALL JOB MATRIX REMOVAL TESTS PASSED (4/4)!");
}

runTests().catch(err => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});

// agent-notes: { ctx: "TDD test verifying application design alignment, cohesive color palette, layout grid consistency, and content preservation", deps: ["assert", "fs", "path"], state: "active", last: "tara@2026-10-31" }
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('================================================================');
console.log('🧪 TDD TEST: Application Design Alignment, Colors & Preservation');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`❌ [FAIL] ${name}`);
    console.error(`   Error: ${err.message}`);
  }
}

// -----------------------------------------------------------------------------
// 1. Design System & Color Tokens (index.css)
// -----------------------------------------------------------------------------
const rootCssPath = path.join(rootDir, 'src', 'index.css');
const frontendCssPath = path.join(rootDir, 'frontend', 'src', 'index.css');

assert(fs.existsSync(rootCssPath), 'src/index.css must exist');
assert(fs.existsSync(frontendCssPath), 'frontend/src/index.css must exist');

const rootCss = fs.readFileSync(rootCssPath, 'utf8');
const frontendCss = fs.readFileSync(frontendCssPath, 'utf8');

runTest('1. Design system has cohesive color palette tokens in root and frontend', () => {
  // Check page background is sleek modern SaaS slate/neutral
  assert(rootCss.includes('--bg-page: #f8fafc;'), 'rootCss must define --bg-page as #f8fafc');
  assert(rootCss.includes('--bg-surface: #ffffff;'), 'rootCss must define --bg-surface as #ffffff');
  assert(rootCss.includes('--border-subtle: #e2e8f0;'), 'rootCss must define --border-subtle as #e2e8f0');
  assert(rootCss.includes('--text-main: #0f172a;'), 'rootCss must define --text-main as #0f172a');
  assert(rootCss.includes('--text-muted: #64748b;'), 'rootCss must define --text-muted as #64748b');

  // Both root and frontend css should have consistent token definitions
  assert(frontendCss.includes('--bg-page: #f8fafc;'), 'frontendCss must define --bg-page as #f8fafc');
  assert(frontendCss.includes('--bg-surface: #ffffff;'), 'frontendCss must define --bg-surface as #ffffff');
  assert(frontendCss.includes('--text-main: #0f172a;'), 'frontendCss must define --text-main as #0f172a');
});

runTest('2. Design system contains professional SaaS utility classes and smooth elevation', () => {
  assert(rootCss.includes('.saas-card'), 'src/index.css must define .saas-card');
  assert(rootCss.includes('.saas-btn-primary'), 'src/index.css must define .saas-btn-primary');
  assert(rootCss.includes('.saas-btn-secondary'), 'src/index.css must define .saas-btn-secondary');
  assert(rootCss.includes('.saas-badge'), 'src/index.css must define .saas-badge');
  assert(rootCss.includes('-webkit-font-smoothing: antialiased;'), 'src/index.css must enable crisp font smoothing');
});

// -----------------------------------------------------------------------------
// 2. Layout Grid & Alignment Consistency (App.jsx)
// -----------------------------------------------------------------------------
const rootAppPath = path.join(rootDir, 'src', 'App.jsx');
const frontendAppPath = path.join(rootDir, 'frontend', 'src', 'App.jsx');

const rootApp = fs.readFileSync(rootAppPath, 'utf8');
const frontendApp = fs.readFileSync(frontendAppPath, 'utf8');

runTest('3. App.jsx top navigation header has uniform height and flex alignment', () => {
  // Header should be sticky top-0 z-30 with h-16 and items-center
  assert(rootApp.includes('sticky top-0 z-30'), 'App.jsx header must be sticky top-0 z-30');
  assert(rootApp.includes('items-center justify-between'), 'App.jsx header must have items-center justify-between');
  assert(rootApp.includes('h-16'), 'App.jsx header must have standardized h-16 height');
  assert(frontendApp.includes('h-16'), 'frontend/src/App.jsx header must have standardized h-16 height');
});

runTest('4. App.jsx main layout container has standardized max-w-7xl alignment', () => {
  assert(rootApp.includes('max-w-7xl'), 'App.jsx must use max-w-7xl container');
  assert(rootApp.includes('w-full mx-auto'), 'App.jsx must center content with w-full mx-auto');
  assert(frontendApp.includes('max-w-7xl'), 'frontend/src/App.jsx must use max-w-7xl container');
});

// -----------------------------------------------------------------------------
// 3. Page Container Grid Alignment (SkillGapDashboard.jsx & Dashboard.jsx)
// -----------------------------------------------------------------------------
const skillGapPath = path.join(rootDir, 'src', 'components', 'SkillGapDashboard.jsx');
const skillGapContent = fs.readFileSync(skillGapPath, 'utf8');

runTest('5. SkillGapDashboard aligns with standard max-w-7xl grid width instead of narrowing', () => {
  // The main container should be max-w-7xl or w-full to match Dashboard.jsx
  assert(skillGapContent.includes('max-w-7xl mx-auto'), 'SkillGapDashboard should use max-w-7xl mx-auto to perfectly align with other tabs');
});

// -----------------------------------------------------------------------------
// 4. Zero Content & Feature Changes (Preservation Check)
// -----------------------------------------------------------------------------
runTest('6. All navigation tabs and feature IDs are strictly preserved in App.jsx', () => {
  const requiredTabs = ['dashboard', 'wizard', 'skillgap', 'resume', 'roadmap', 'chat'];
  requiredTabs.forEach(tab => {
    assert(rootApp.includes(`'${tab}'`) || rootApp.includes(`"${tab}"`), `Tab '${tab}' must be preserved`);
    assert(frontendApp.includes(`'${tab}'`) || frontendApp.includes(`"${tab}"`), `Tab '${tab}' must be preserved in frontend`);
  });

  // Verify core navigation labels
  const requiredLabels = [
    'Dashboard',
    'Resume Analyzer',
    'Skill Gap Analysis',
    'Learning Roadmap',
    'AI Chatbot',
    'Profile Setup'
  ];
  requiredLabels.forEach(label => {
    assert(rootApp.includes(label), `Nav label '${label}' must be preserved`);
  });
});

runTest('7. Essential action buttons and feature handlers are preserved', () => {
  // Dashboard
  const dashboardPath = path.join(rootDir, 'src', 'components', 'Dashboard.jsx');
  const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
  assert(dashboardContent.includes('Start Your Analysis'), 'Hero CTA "Start Your Analysis" must be preserved');
  assert(dashboardContent.includes('Live Skill Benchmark'), '"Live Skill Benchmark" section must be preserved');
  assert(dashboardContent.includes('Your Career Progress'), '"Your Career Progress" section must be preserved');

  // Learning Roadmap
  const roadmapPath = path.join(rootDir, 'src', 'components', 'LearningRoadmap.jsx');
  const roadmapContent = fs.readFileSync(roadmapPath, 'utf8');
  assert(roadmapContent.includes('Refresh Roadmap'), 'Roadmap action "Refresh Roadmap" must be preserved');

  // Resume Analyzer
  const resumePath = path.join(rootDir, 'src', 'pages', 'ResumeAnalyzer.jsx');
  const resumeContent = fs.readFileSync(resumePath, 'utf8');
  assert(resumeContent.includes('AI Resume Analyzer'), 'Title "AI Resume Analyzer" must be preserved');
  assert(resumeContent.includes('Candidate Name:'), 'Candidate Name input must be preserved');
});

console.log('\n================================================================');
console.log(`Results: ${passedTests}/${totalTests} tests passed`);
console.log('================================================================\n');

if (passedTests < totalTests) {
  process.exit(1);
} else {
  process.exit(0);
}

// agent-notes: { ctx: "TDD test verifying removal of standalone Skill Gap Analysis page while preserving it in Profile Setup step 5", deps: ["assert", "fs", "path"], state: "active", last: "tara@2026-10-31" }
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('================================================================');
console.log('🧪 TDD TEST: Remove Standalone Skill Gap Analysis Page');
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

const rootAppPath = path.join(rootDir, 'src', 'App.jsx');
const frontendAppPath = path.join(rootDir, 'frontend', 'src', 'App.jsx');
const rootWizardPath = path.join(rootDir, 'src', 'components', 'OnboardingWizard.jsx');
const frontendWizardPath = path.join(rootDir, 'frontend', 'src', 'components', 'OnboardingWizard.jsx');

const rootApp = fs.readFileSync(rootAppPath, 'utf8');
const frontendApp = fs.readFileSync(frontendAppPath, 'utf8');
const rootWizard = fs.readFileSync(rootWizardPath, 'utf8');
const frontendWizard = fs.readFileSync(frontendWizardPath, 'utf8');

runTest('1. Standalone "Skill Gap Analysis" navigation tab is removed from App.jsx navigationItems', () => {
  const hasSkillGapTabRoot = rootApp.includes("id: 'skillgap'") || rootApp.includes('id: "skillgap"');
  assert(!hasSkillGapTabRoot, 'root App.jsx must not have skillgap in navigationItems');

  const hasSkillGapTabFrontend = frontendApp.includes("id: 'skillgap'") || frontendApp.includes('id: "skillgap"');
  assert(!hasSkillGapTabFrontend, 'frontend App.jsx must not have skillgap in navigationItems');
});

runTest('2. Standalone skillgap view is removed from renderActiveView in App.jsx', () => {
  const hasSkillGapViewRoot = rootApp.includes("activeTab === 'skillgap'") || rootApp.includes('activeTab === "skillgap"');
  assert(!hasSkillGapViewRoot, 'root App.jsx must not render standalone activeTab === skillgap view');

  const hasSkillGapViewFrontend = frontendApp.includes("activeTab === 'skillgap'") || frontendApp.includes('activeTab === "skillgap"');
  assert(!hasSkillGapViewFrontend, 'frontend App.jsx must not render standalone activeTab === skillgap view');
});

runTest('3. Profile Setup (OnboardingWizard) still contains Skill Gap Analysis on Step 5', () => {
  assert(rootWizard.includes('<SkillGapDashboard'), 'root OnboardingWizard must still contain SkillGapDashboard');
  assert(frontendWizard.includes('<SkillGapDashboard'), 'frontend OnboardingWizard must still contain SkillGapDashboard');
  assert(rootWizard.includes('currentStep === 5'), 'root OnboardingWizard must still render Skill Gap Analysis on Step 5');
  assert(frontendWizard.includes('currentStep === 5'), 'frontend OnboardingWizard must still render Skill Gap Analysis on Step 5');
});

runTest('4. All remaining tabs (Dashboard, Profile Setup, Resume Analyzer, Roadmap, Chatbot) are preserved', () => {
  const remainingTabs = ['dashboard', 'wizard', 'resume', 'roadmap', 'chat'];
  remainingTabs.forEach(tab => {
    assert(rootApp.includes(`id: '${tab}'`) || rootApp.includes(`id: "${tab}"`), `Tab '${tab}' must be in root App.jsx navigationItems`);
    assert(frontendApp.includes(`id: '${tab}'`) || frontendApp.includes(`id: "${tab}"`), `Tab '${tab}' must be in frontend App.jsx navigationItems`);
  });
});

console.log('\n================================================================');
console.log(`Results: ${passedTests}/${totalTests} tests passed`);
console.log('================================================================\n');

if (passedTests < totalTests) {
  process.exit(1);
} else {
  process.exit(0);
}

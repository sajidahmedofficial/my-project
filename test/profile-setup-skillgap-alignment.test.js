// agent-notes: { ctx: "TDD test verifying Profile Setup step 5 Skill Gap Analysis visual layout matches the standalone Skill Gap Analysis page", deps: ["assert", "fs", "path"], state: "active", last: "tara@2026-10-31" }
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('================================================================');
console.log('🧪 TDD TEST: Profile Setup Step 5 Skill Gap Analysis Alignment');
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

const rootWizardPath = path.join(rootDir, 'src', 'components', 'OnboardingWizard.jsx');
const frontendWizardPath = path.join(rootDir, 'frontend', 'src', 'components', 'OnboardingWizard.jsx');

assert(fs.existsSync(rootWizardPath), 'src/components/OnboardingWizard.jsx must exist');
assert(fs.existsSync(frontendWizardPath), 'frontend/src/components/OnboardingWizard.jsx must exist');

const rootWizard = fs.readFileSync(rootWizardPath, 'utf8');
const frontendWizard = fs.readFileSync(frontendWizardPath, 'utf8');

runTest('1. OnboardingWizard outer container expands to max-w-7xl when on step 5', () => {
  assert(
    rootWizard.includes("currentStep === 5 ? 'max-w-7xl' : 'max-w-4xl'") ||
    rootWizard.includes('currentStep === 5 ? "max-w-7xl" : "max-w-4xl"') ||
    rootWizard.includes('max-w-7xl'),
    'OnboardingWizard container must allow max-w-7xl width for step 5'
  );
  assert(
    frontendWizard.includes("currentStep === 5 ? 'max-w-7xl' : 'max-w-4xl'") ||
    frontendWizard.includes('currentStep === 5 ? "max-w-7xl" : "max-w-4xl"') ||
    frontendWizard.includes('max-w-7xl'),
    'frontend/src OnboardingWizard container must allow max-w-7xl width for step 5'
  );
});

runTest('2. Step 5 does not wrap SkillGapDashboard in redundant nested card with duplicate header', () => {
  // Previously step 5 had a duplicate header "Skill Gap Analysis for {targetRole}" right above SkillGapDashboard
  // which created an awkward double-header inside a nested white card
  const hasDuplicateHeader = rootWizard.includes('Skill Gap Analysis for {targetRole}') &&
                             rootWizard.includes('AI Skill Gap Evaluation');
  assert(!hasDuplicateHeader, 'Step 5 must not have a redundant duplicate header before SkillGapDashboard');
});

runTest('3. Step 5 passes setProfile to SkillGapDashboard for synchronization', () => {
  assert(
    rootWizard.includes('<SkillGapDashboard') && rootWizard.includes('setProfile='),
    'Step 5 SkillGapDashboard must receive setProfile prop'
  );
  assert(
    frontendWizard.includes('<SkillGapDashboard') && frontendWizard.includes('setProfile='),
    'frontend/src Step 5 SkillGapDashboard must receive setProfile prop'
  );
});

runTest('4. Finish and back navigation buttons remain fully preserved in Step 5', () => {
  assert(rootWizard.includes('Back to Career Path'), 'Back to Career Path button must be preserved');
  assert(rootWizard.includes('Finish Profile Setup & Launch'), 'Finish Profile Setup button must be preserved');
  assert(frontendWizard.includes('Back to Career Path'), 'Back to Career Path button must be preserved in frontend');
  assert(frontendWizard.includes('Finish Profile Setup & Launch'), 'Finish Profile Setup button must be preserved in frontend');
});

console.log('\n================================================================');
console.log(`Results: ${passedTests}/${totalTests} tests passed`);
console.log('================================================================\n');

if (passedTests < totalTests) {
  process.exit(1);
} else {
  process.exit(0);
}

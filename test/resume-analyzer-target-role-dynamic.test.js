// agent-notes: { ctx: "TDD test verifying dynamic target role in ResumeAnalyzer badge and child components instead of hardcoded Full Stack Target", deps: ["assert", "fs", "path"], state: "active", last: "tara@2026-10-31" }
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('================================================================');
console.log('🧪 TDD TEST: Resume Analyzer Dynamic Target Role Badge');
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

const rootResumePath = path.join(rootDir, 'src', 'pages', 'ResumeAnalyzer.jsx');
const frontendResumePath = path.join(rootDir, 'frontend', 'src', 'pages', 'ResumeAnalyzer.jsx');

const rootResume = fs.readFileSync(rootResumePath, 'utf8');
const frontendResume = fs.readFileSync(frontendResumePath, 'utf8');

runTest('1. src/pages/ResumeAnalyzer.jsx does NOT contain hardcoded "Full Stack Target"', () => {
  assert(!rootResume.includes('Full Stack Target'), 'root ResumeAnalyzer.jsx must not contain hardcoded "Full Stack Target"');
});

runTest('2. frontend/src/pages/ResumeAnalyzer.jsx does NOT contain hardcoded "Full Stack Target"', () => {
  assert(!frontendResume.includes('Full Stack Target'), 'frontend ResumeAnalyzer.jsx must not contain hardcoded "Full Stack Target"');
});

runTest('3. Both files export resolveTargetRole and formatTargetRoleBadge', () => {
  assert(rootResume.includes('export const resolveTargetRole'), 'root must export resolveTargetRole');
  assert(rootResume.includes('export const formatTargetRoleBadge'), 'root must export formatTargetRoleBadge');
  assert(frontendResume.includes('export const resolveTargetRole'), 'frontend must export resolveTargetRole');
  assert(frontendResume.includes('export const formatTargetRoleBadge'), 'frontend must export formatTargetRoleBadge');
});

runTest('4. Both files wire up dynamic target role state and storage sync', () => {
  assert(rootResume.includes('resolveTargetRole(profile)'), 'root must resolve target role from profile');
  assert(frontendResume.includes('resolveTargetRole(profile)'), 'frontend must resolve target role from profile');
  assert(rootResume.includes('formatTargetRoleBadge('), 'root must format the target role badge dynamically');
  assert(frontendResume.includes('formatTargetRoleBadge('), 'frontend must format the target role badge dynamically');
});

runTest('5. FinalMasteryDashboard receives dynamic targetRole instead of hardcoded "Full Stack Developer"', () => {
  assert(!rootResume.includes('targetRole="Full Stack Developer"'), 'root ResumeAnalyzer must not hardcode targetRole="Full Stack Developer" in FinalMasteryDashboard');
  assert(!frontendResume.includes('targetRole="Full Stack Developer"'), 'frontend ResumeAnalyzer must not hardcode targetRole="Full Stack Developer" in FinalMasteryDashboard');
});

runTest('6. CurrentResumeCard in both trees receives dynamic targetRole and profile', () => {
  const rootCard = fs.readFileSync(path.join(rootDir, 'src', 'components', 'resume', 'CurrentResumeCard.jsx'), 'utf8');
  const frontendCard = fs.readFileSync(path.join(rootDir, 'frontend', 'src', 'components', 'resume', 'CurrentResumeCard.jsx'), 'utf8');
  assert(!rootCard.includes("{profile?.careerGoal || 'Full Stack Developer'}"), 'root CurrentResumeCard must not have static Full Stack Developer fallback');
  assert(!frontendCard.includes("{profile?.careerGoal || 'Full Stack Developer'}"), 'frontend CurrentResumeCard must not have static Full Stack Developer fallback');
});

runTest('7. UploadResume in both trees supports dynamic targetRole', () => {
  const rootUpload = fs.readFileSync(path.join(rootDir, 'src', 'components', 'resume', 'UploadResume.jsx'), 'utf8');
  const frontendUpload = fs.readFileSync(path.join(rootDir, 'frontend', 'src', 'components', 'resume', 'UploadResume.jsx'), 'utf8');
  assert(!rootUpload.includes("profile?.careerGoal || 'Full Stack Developer'"), 'root UploadResume must not have static Full Stack Developer fallback');
  assert(!frontendUpload.includes("profile?.careerGoal || 'Full Stack Developer'"), 'frontend UploadResume must not have static Full Stack Developer fallback');
});

console.log(`\nResults: ${passedTests}/${totalTests} tests passed.`);
if (passedTests !== totalTests) {
  process.exit(1);
}

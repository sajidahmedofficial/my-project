// agent-notes: { ctx: "TDD test verifying complete removal of Job Matrix from Dashboard page in both root and frontend trees", deps: ["assert", "fs", "path"], state: "active", last: "tara@2026-10-31" }
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('================================================================');
console.log('🧪 TDD TEST: Remove Job Matrix from Dashboard Page');
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

const rootDashPath = path.join(rootDir, 'src', 'components', 'Dashboard.jsx');
const frontendDashPath = path.join(rootDir, 'frontend', 'src', 'components', 'Dashboard.jsx');

const rootDash = fs.readFileSync(rootDashPath, 'utf8');
const frontendDash = fs.readFileSync(frontendDashPath, 'utf8');

runTest('1. src/components/Dashboard.jsx does NOT contain "Job Matrix"', () => {
  assert(!rootDash.includes('Job Matrix'), 'root Dashboard.jsx must not contain "Job Matrix"');
});

runTest('2. frontend/src/components/Dashboard.jsx does NOT contain "Job Matrix"', () => {
  assert(!frontendDash.includes('Job Matrix'), 'frontend Dashboard.jsx must not contain "Job Matrix"');
});

runTest('3. src/components/Dashboard.jsx does NOT declare jobMatrixDone', () => {
  assert(!rootDash.includes('jobMatrixDone'), 'root Dashboard.jsx must not declare or use jobMatrixDone');
});

runTest('4. frontend/src/components/Dashboard.jsx does NOT declare jobMatrixDone', () => {
  assert(!frontendDash.includes('jobMatrixDone'), 'frontend Dashboard.jsx must not declare or use jobMatrixDone');
});

runTest('5. Career Progress section retains all other progress items', () => {
  const expectedItems = [
    'Resume Analysis',
    'Skill Gap Analysis',
    'Career Guidance',
    'AI Mentor'
  ];
  for (const item of expectedItems) {
    assert(rootDash.includes(item), `root Dashboard.jsx must retain "${item}"`);
    assert(frontendDash.includes(item), `frontend Dashboard.jsx must retain "${item}"`);
  }
});

console.log(`\nResults: ${passedTests}/${totalTests} tests passed.`);
if (passedTests !== totalTests) {
  process.exit(1);
}

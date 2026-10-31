// agent-notes: { ctx: "TDD test verifying removal of Key Topics & Architecture Breakdown section from StudyMaterials", deps: ["fs", "path", "assert"], state: "active", last: "tara@2026-10-31" }
import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('================================================================');
console.log('🧪 TDD TEST: Removal of Key Topics & Architecture Breakdown');
console.log('================================================================\n');

const filesToCheck = [
  path.resolve(process.cwd(), 'src/components/roadmap/StudyMaterials.jsx'),
  path.resolve(process.cwd(), 'frontend/src/components/roadmap/StudyMaterials.jsx')
];

let totalTests = 0;
let passedTests = 0;

function checkFile(filePath) {
  const relPath = path.relative(process.cwd(), filePath);
  console.log(`Checking ${relPath}...`);
  assert(fs.existsSync(filePath), `File does not exist: ${relPath}`);

  const content = fs.readFileSync(filePath, 'utf8');

  // 1. Should NOT contain "Key Topics & Architecture Breakdown"
  totalTests++;
  const hasHeading = content.includes('Key Topics & Architecture Breakdown');
  assert(!hasHeading, `Expected ${relPath} to NOT contain "Key Topics & Architecture Breakdown"`);
  console.log(`✅ [PASS] ${relPath} does not contain "Key Topics & Architecture Breakdown"`);
  passedTests++;

  // 2. Should NOT iterate over notes.keyTopics
  totalTests++;
  const hasKeyTopicsLoop = content.includes('notes.keyTopics');
  assert(!hasKeyTopicsLoop, `Expected ${relPath} to NOT iterate over notes.keyTopics`);
  console.log(`✅ [PASS] ${relPath} does not render keyTopics`);
  passedTests++;

  // 3. Should preserve other essential study materials sections
  totalTests++;
  assert(content.includes('Concept Overview'), `${relPath} should preserve Concept Overview`);
  assert(content.includes('Common Pitfalls & How to Avoid Them'), `${relPath} should preserve Common Pitfalls`);
  assert(content.includes('Practice Exercises & Revision Tasks'), `${relPath} should preserve Practice Exercises`);
  assert(content.includes('Interview Questions & Revision'), `${relPath} should preserve Interview Questions`);
  assert(content.includes('My Personal Stage Notes'), `${relPath} should preserve Personal Notes`);
  console.log(`✅ [PASS] ${relPath} preserves Concept Overview, Pitfalls, Exercises, Interview Q&A, and Personal Notes`);
  passedTests++;
}

try {
  filesToCheck.forEach(checkFile);
  console.log('\n----------------------------------------------------------------');
  console.log(`Results: ${passedTests}/${totalTests} passed, 0 failed`);
  console.log('----------------------------------------------------------------\n');
} catch (err) {
  console.error('\n❌ TEST FAILED:', err.message);
  process.exit(1);
}

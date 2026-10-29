// agent-notes: { ctx: "TDD test ensuring curated curriculum blueprints exist for all user skills in both backend and frontend services", deps: ["../backend/services/roadmapGenerator.service.js", "../src/services/skillGapApi.js"], state: "active", last: "anti@2026-10-29" }
import assert from 'assert';
import fs from 'fs';
import path from 'path';

const REQUIRED_CURRICULUM_SKILLS = [
  'PostgreSQL',
  'Tailwind CSS',
  'TypeScript',
  'HTML5',
  'CSS3',
  'FastAPI',
  'MongoDB',
  'REST API',
  'Git',
  'Docker',
  'React.js',
  'Next.js'
];

async function runBlueprintTests() {
  console.log('================================================================');
  console.log('🧪 TDD TEST: Curated Curriculum Blueprints for All Target Skills');
  console.log('================================================================\n');

  let failed = 0;
  let passed = 0;

  const backendServiceFile = fs.readFileSync(path.resolve('backend/services/roadmapGenerator.service.js'), 'utf-8');
  const frontendApiFile = fs.readFileSync(path.resolve('src/services/skillGapApi.js'), 'utf-8');

  console.log('--- Checking Backend SKILL_CURRICULUM_BLUEPRINTS ---');
  for (const skill of REQUIRED_CURRICULUM_SKILLS) {
    const regex = new RegExp(`["']${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']\\s*:`, 'i');
    if (regex.test(backendServiceFile)) {
      console.log(`✅ [PASS] Backend has curated blueprint for: ${skill}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] Backend MISSING curated blueprint for: ${skill}`);
      failed++;
    }
  }

  console.log('\n--- Checking Frontend Client Blueprints in skillGapApi.js ---');
  for (const skill of REQUIRED_CURRICULUM_SKILLS) {
    const regex = new RegExp(`["']${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']\\s*:`, 'i');
    if (regex.test(frontendApiFile)) {
      console.log(`✅ [PASS] Frontend has client blueprint for: ${skill}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] Frontend MISSING client blueprint for: ${skill}`);
      failed++;
    }
  }

  console.log('\n----------------------------------------------------------------');
  console.log(`Curriculum Blueprint Results: ${passed} passed, ${failed} failed`);
  console.log('----------------------------------------------------------------');

  if (failed > 0) {
    process.exit(1);
  }
}

runBlueprintTests().catch(e => {
  console.error(e);
  process.exit(1);
});

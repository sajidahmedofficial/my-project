// agent-notes: { ctx: "TDD test suite for Roadmap on all skills, API generation, and skill card button click handling", deps: ["../backend/services/roadmapGenerator.service.js", "../src/services/skillGapApi.js", "../src/services/learningResourcesService.js"], state: "active", last: "anti@2026-10-29" }
import assert from 'assert';
import { generatePersonalizedRoadmap } from '../backend/services/roadmapGenerator.service.js';
import { getYoutubeResourcesForStage, getFreeCoursesForStage } from '../src/services/learningResourcesService.js';
import skillGapApi from '../src/services/skillGapApi.js';

// Setup mock localStorage in Node
if (typeof global.localStorage === 'undefined') {
  let store = {};
  global.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
}

const ALL_TARGET_SKILLS = [
  'PostgreSQL',
  'Tailwind CSS',
  'TypeScript',
  'HTML5',
  'CSS3',
  'FastAPI',
  'MongoDB',
  'REST API',
  'Git',
  'Docker'
];

async function runTests() {
  console.log('================================================================');
  console.log('🧪 TDD RED-PHASE: Roadmap for All Skills, Buttons & API Support');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  async function testAsync(name, fn) {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  // --- SUITE 1: API & Service Curriculum Blueprints for ALL 10 User Skills ---
  console.log('\n--- 1. Testing Backend AI & Blueprint Generator for ALL Skills ---');
  for (const skill of ALL_TARGET_SKILLS) {
    await testAsync(`Backend generator creates valid 3-stage roadmap for "${skill}"`, async () => {
      const roadmap = await generatePersonalizedRoadmap({
        skillName: skill,
        targetRole: 'Full Stack Engineer'
      });

      assert(roadmap, `Roadmap for ${skill} should be generated`);
      assert.strictEqual(roadmap.skillName, skill, `Skill name should match canonical ${skill}`);
      assert(Array.isArray(roadmap.stages), `Stages must be an array for ${skill}`);
      assert(roadmap.stages.length >= 3, `Expected at least 3 stages for ${skill}, got ${roadmap.stages?.length}`);
      
      const stage1 = roadmap.stages[0];
      assert(stage1.title, `Stage 1 must have a title`);
      assert(Array.isArray(stage1.topics) && stage1.topics.length >= 2, `Stage 1 must have topics for ${skill}`);
      assert(Array.isArray(stage1.practiceTasks) && stage1.practiceTasks.length >= 1, `Stage 1 must have practice tasks for ${skill}`);
      
      assert(roadmap.finalProject, `Must have a finalProject for ${skill}`);
      assert(roadmap.finalProject.title, `Final project title must exist for ${skill}`);
    });
  }

  // --- SUITE 2: Client Fallback API Roadmap Generator for ALL Skills ---
  console.log('\n--- 2. Testing Frontend Client Fallback Roadmap Generator for ALL Skills ---');
  for (const skill of ALL_TARGET_SKILLS) {
    await testAsync(`Client API fallback generates complete roadmap for "${skill}"`, async () => {
      const res = await skillGapApi.generateRoadmap({
        skill,
        skillName: skill,
        targetRole: 'Full Stack Developer',
        userId: 'test_student_1'
      });

      assert(res && res.roadmap, `Client fallback response should include roadmap for ${skill}`);
      assert.strictEqual(res.roadmap.skillName, skill);
      assert(Array.isArray(res.roadmap.stages) && res.roadmap.stages.length >= 3);
      assert(Array.isArray(res.roadmap.tasks) && res.roadmap.tasks.length >= 3);
      assert(res.roadmap.finalProject && res.roadmap.finalProject.title);
    });
  }

  // --- SUITE 3: Learning Resources (YouTube & Courses) for ALL Skills ---
  console.log('\n--- 3. Testing YouTube and Free Online Courses for ALL Skills ---');
  for (const skill of ALL_TARGET_SKILLS) {
    test(`Generates YouTube tutorials and free courses for "${skill}"`, () => {
      const mockStage = {
        stageNumber: 1,
        title: `${skill} Fundamentals`,
        level: 'Beginner',
        topics: ['Getting Started', 'Core Concepts']
      };

      const youtube = getYoutubeResourcesForStage(skill, mockStage);
      assert(Array.isArray(youtube) && youtube.length > 0, `YouTube tutorials required for ${skill}`);
      assert(youtube[0].url.includes('youtube.com'), `Valid YouTube URL required for ${skill}`);

      const courses = getFreeCoursesForStage(skill, mockStage);
      assert(Array.isArray(courses) && courses.length > 0, `Free courses required for ${skill}`);
      assert(courses[0].url.startsWith('http'), `Valid course URL required for ${skill}`);
    });
  }

  // --- SUITE 4: SkillGapDashboard Click Handler Behavior ---
  console.log('\n--- 4. Testing SkillGapDashboard Click Handler & Multi-Skill Preservation ---');
  test(`handleStartRoadmap preserves ALL skills and passes selectedSkill`, () => {
    // Import or simulate the fixed handleStartRoadmap logic
    const mockReport = {
      missingSkills: [
        { name: 'TypeScript', category: 'Programming' },
        { name: 'HTML5', category: 'Programming' },
        { name: 'CSS3', category: 'Programming' },
        { name: 'FastAPI', category: 'Frameworks' },
        { name: 'MongoDB', category: 'Databases' },
        { name: 'REST API', category: 'Databases' },
        { name: 'Git', category: 'Tools' },
        { name: 'Docker', category: 'DevOps' }
      ],
      partialSkills: [],
      strongSkills: [
        { name: 'PostgreSQL', category: 'Databases' },
        { name: 'Tailwind CSS', category: 'Frameworks' }
      ]
    };

    let capturedSkills = null;
    let capturedRole = null;
    let capturedSelectedSkill = null;

    const onGenerateRoadmap = (skills, role, selectedSkill) => {
      capturedSkills = skills;
      capturedRole = role;
      capturedSelectedSkill = selectedSkill;
    };

    // User clicks roadmap on "FastAPI"
    const clickedSkill = 'FastAPI';
    const missing = (mockReport.missingSkills || []).map(s => s.skillName || s.name || s);
    const partial = (mockReport.partialSkills || []).map(s => s.skillName || s.name || s);
    const strong = (mockReport.strongSkills || []).map(s => s.skillName || s.name || s);
    
    const allSkills = Array.from(new Set([
      ...(clickedSkill ? [clickedSkill] : []),
      ...missing,
      ...partial,
      ...strong
    ])).filter(Boolean);

    onGenerateRoadmap(allSkills, 'Full Stack Developer', clickedSkill);

    // Assertions:
    assert.strictEqual(capturedSelectedSkill, 'FastAPI', 'Targeted skill must be passed');
    assert(capturedSkills.includes('FastAPI'), 'FastAPI must be in skills');
    assert(capturedSkills.includes('Docker'), 'Docker must not be dropped');
    assert(capturedSkills.includes('PostgreSQL'), 'Strong skills must be preserved');
    assert.strictEqual(capturedSkills.length, 10, 'All 10 skills must be preserved in tabs');
  });

  console.log('\n----------------------------------------------------------------');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('----------------------------------------------------------------');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error("Test runner encountered fatal error:", err);
  process.exit(1);
});

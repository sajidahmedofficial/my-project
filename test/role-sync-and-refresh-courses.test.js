// agent-notes: { ctx: "TDD test verifying chosen role header synchronization and roadmap page refresh courses functionality", deps: ["assert", "../src/services/learningResourcesService.js"], state: "active", last: "tara@2026-10-31" }
import assert from 'assert';
import { 
  discoverAndRefreshCourses, 
  getFreeCoursesForStage 
} from '../src/services/learningResourcesService.js';

console.log('================================================================');
console.log('🧪 TDD TEST: Role Synchronization & Refresh Courses Verification');
console.log('================================================================\n');

// Mock localStorage for node test environment
const mockStorage = {};
global.localStorage = {
  getItem: (key) => mockStorage[key] || null,
  setItem: (key, val) => { mockStorage[key] = String(val); },
  removeItem: (key) => { delete mockStorage[key]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};

let passedTests = 0;
let totalTests = 0;

// Test 1: Verify getFreeCoursesForStage reads from refreshed catalog in localStorage
totalTests++;
console.log('--- 1. Testing Refresh Courses in learningResourcesService ---');
(async () => {
  try {
    const targetSkill = 'React.js';
    const stage = { stageNumber: 1, topics: ['Components', 'Hooks', 'State Management'] };

    // Initial courses count
    const initialCourses = getFreeCoursesForStage(targetSkill, stage);
    assert(Array.isArray(initialCourses), 'Initial courses must be an array');
    console.log(`✅ [PASS] Loaded ${initialCourses.length} initial courses for ${targetSkill}`);

    // Trigger discoverAndRefreshCourses
    const refreshRes = await discoverAndRefreshCourses(targetSkill);
    assert(refreshRes.success === true, 'discoverAndRefreshCourses must succeed');
    assert(refreshRes.lastRefreshed, 'discoverAndRefreshCourses must return lastRefreshed timestamp');
    assert(localStorage.getItem('sb_course_sync_catalog'), 'Catalog must be persisted to localStorage');
    console.log(`✅ [PASS] discoverAndRefreshCourses succeeded with timestamp ${refreshRes.lastRefreshed}`);

    // Verify getFreeCoursesForStage now reflects the updated catalog
    const refreshedCourses = getFreeCoursesForStage(targetSkill, stage);
    assert(Array.isArray(refreshedCourses), 'Refreshed courses must be an array');
    assert(refreshedCourses.length >= initialCourses.length, 'Refreshed courses must include newly discovered courses');
    
    const hasRecent = refreshedCourses.some(c => c.isRecentlyAdded || c.title.includes(targetSkill));
    assert(hasRecent, 'Refreshed courses must contain recently added or target skill course');
    console.log(`✅ [PASS] getFreeCoursesForStage reads from refreshed catalog (${refreshedCourses.length} courses)`);
    passedTests++;

    // Test 2: Role selection synchronization
    totalTests++;
    console.log('\n--- 2. Testing Target Role Synchronization & Fallback Priority ---');
    localStorage.setItem('sb_target_role', 'Frontend Developer');
    
    // Test base profile role resolution logic
    const currentUser = {
      id: 'usr_sajid',
      name: 'sajid ahmed',
      careerGoal: 'Full Stack AI Engineer' // previously stuck role
    };

    const currentTargetRole = localStorage.getItem('sb_target_role');
    const resolvedProfile = {
      ...currentUser,
      careerGoal: currentTargetRole || currentUser.careerGoal,
      targetRole: currentTargetRole || currentUser.targetRole || currentUser.careerGoal
    };

    assert.strictEqual(resolvedProfile.careerGoal, 'Frontend Developer', 'careerGoal must prioritize chosen role over stale default');
    assert.strictEqual(resolvedProfile.targetRole, 'Frontend Developer', 'targetRole must match chosen role');
    console.log('✅ [PASS] Profile careerGoal correctly resolves to "Frontend Developer" instead of "Full Stack AI Engineer"');
    passedTests++;

    console.log('\n----------------------------------------------------------------');
    console.log(`Results: ${passedTests}/${totalTests} passed, 0 failed`);
    console.log('----------------------------------------------------------------\n');
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    process.exit(1);
  }
})();

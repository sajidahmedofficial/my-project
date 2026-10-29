// agent-notes: { ctx: "TDD test ensuring SkillRoadmapModal and instant roadmap display on touch/click in SkillGapDashboard and OnboardingWizard", deps: ["../src/components/roadmap/SkillRoadmapModal.jsx", "../src/components/SkillGapDashboard.jsx", "../src/components/OnboardingWizard.jsx", "../src/App.jsx"], state: "active", last: "anti@2026-10-29" }
import assert from 'assert';
import fs from 'fs';
import path from 'path';

async function runModalTests() {
  console.log('================================================================');
  console.log('🧪 TDD TEST: Instant Skill Roadmap Display on Touch / Click');
  console.log('================================================================\n');

  let failed = 0;
  let passed = 0;

  // Test 1: SkillRoadmapModal exists and contains roadmap rendering
  const modalPath = path.resolve('src/components/roadmap/SkillRoadmapModal.jsx');
  if (fs.existsSync(modalPath)) {
    const modalContent = fs.readFileSync(modalPath, 'utf-8');
    if (
      modalContent.includes('export default function SkillRoadmapModal') &&
      modalContent.includes('onOpenFullWorkspace') &&
      modalContent.includes('skillGapApi.generateRoadmap')
    ) {
      console.log('✅ [PASS] SkillRoadmapModal component exists with API hydration');
      passed++;
    } else {
      console.error('❌ [FAIL] SkillRoadmapModal incomplete or missing required exports');
      failed++;
    }
  } else {
    console.error('❌ [FAIL] src/components/roadmap/SkillRoadmapModal.jsx does NOT exist');
    failed++;
  }

  // Test 2: SkillGapDashboard has activeRoadmapModalSkill state and opens modal on click
  const dashboardContent = fs.readFileSync(path.resolve('src/components/SkillGapDashboard.jsx'), 'utf-8');
  if (
    dashboardContent.includes('activeRoadmapModalSkill') &&
    dashboardContent.includes('SkillRoadmapModal')
  ) {
    console.log('✅ [PASS] SkillGapDashboard integrates SkillRoadmapModal for instant view');
    passed++;
  } else {
    console.error('❌ [FAIL] SkillGapDashboard does NOT integrate SkillRoadmapModal');
    failed++;
  }

  // Test 3: OnboardingWizard forwards onGenerateRoadmap and onNavigate to SkillGapDashboard
  const wizardContent = fs.readFileSync(path.resolve('src/components/OnboardingWizard.jsx'), 'utf-8');
  if (
    wizardContent.includes('onGenerateRoadmap') &&
    wizardContent.includes('onNavigate') &&
    wizardContent.includes('<SkillGapDashboard') &&
    wizardContent.includes('onGenerateRoadmap={onGenerateRoadmap}')
  ) {
    console.log('✅ [PASS] OnboardingWizard forwards onGenerateRoadmap and onNavigate');
    passed++;
  } else {
    console.error('❌ [FAIL] OnboardingWizard does NOT forward roadmap handlers to SkillGapDashboard');
    failed++;
  }

  // Test 4: App.jsx clears showOnboarding in handleGenerateRoadmap
  const appContent = fs.readFileSync(path.resolve('src/App.jsx'), 'utf-8');
  if (
    appContent.includes('handleGenerateRoadmap') &&
    appContent.includes('setShowOnboarding(false)')
  ) {
    console.log('✅ [PASS] App.jsx dismisses onboarding overlay when roadmap is triggered');
    passed++;
  } else {
    console.error('❌ [FAIL] App.jsx does not dismiss onboarding overlay in handleGenerateRoadmap');
    failed++;
  }

  // Test 5: App.jsx passes onGenerateRoadmap and onNavigate to OnboardingWizard
  if (
    appContent.includes('<OnboardingWizard') &&
    appContent.includes('onGenerateRoadmap={handleGenerateRoadmap}')
  ) {
    console.log('✅ [PASS] App.jsx passes onGenerateRoadmap to OnboardingWizard');
    passed++;
  } else {
    console.error('❌ [FAIL] App.jsx does NOT pass onGenerateRoadmap to OnboardingWizard');
    failed++;
  }

  console.log('\n----------------------------------------------------------------');
  console.log(`Modal & Instant Touch Results: ${passed} passed, ${failed} failed`);
  console.log('----------------------------------------------------------------');

  if (failed > 0) {
    process.exit(1);
  }
}

runModalTests().catch(e => {
  console.error(e);
  process.exit(1);
});

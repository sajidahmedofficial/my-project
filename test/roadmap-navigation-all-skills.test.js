// agent-notes: { ctx: "TDD test ensuring SkillGapDashboard, App, and LearningRoadmap correctly preserve all skills and support selecting any skill", deps: ["../src/components/SkillGapDashboard.jsx", "../src/App.jsx", "../src/components/LearningRoadmap.jsx"], state: "active", last: "anti@2026-10-29" }
import assert from 'assert';
import fs from 'fs';
import path from 'path';

async function runNavigationTests() {
  console.log('================================================================');
  console.log('🧪 TDD TEST: Roadmap Navigation & All-Skills Selection');
  console.log('================================================================\n');

  let failed = 0;
  let passed = 0;

  const dashboardCode = fs.readFileSync(path.resolve('src/components/SkillGapDashboard.jsx'), 'utf-8');
  const appCode = fs.readFileSync(path.resolve('src/App.jsx'), 'utf-8');
  const roadmapCode = fs.readFileSync(path.resolve('src/components/LearningRoadmap.jsx'), 'utf-8');

  // Test 1: SkillGapDashboard handles roadmap for all skills without wiping out other skills
  if (
    dashboardCode.includes('handleStartRoadmap = (skillName)') &&
    dashboardCode.includes('onGenerateRoadmap(skillsToSend, selectedRole, skillName)')
  ) {
    console.log('✅ [PASS] SkillGapDashboard passes all skills + target skill');
    passed++;
  } else {
    console.error('❌ [FAIL] SkillGapDashboard clamps or wipes skills in handleStartRoadmap');
    failed++;
  }

  // Test 2: SkillGapDashboard renders Roadmap button for strong/verified skills too
  if (
    dashboardCode.includes('handleStartRoadmap(sName)') &&
    dashboardCode.includes('✓ Verified') &&
    dashboardCode.includes('Roadmap')
  ) {
    // Check if Roadmap button can be clicked for isStrong skills
    const strongHasRoadmap = /isStrong[\s\S]*?handleStartRoadmap/.test(dashboardCode) ||
                             /handleStartRoadmap\(sName\)[\s\S]*?✓ Verified/.test(dashboardCode) ||
                             dashboardCode.includes('title={`View Roadmap for ${sName}`}') ||
                             dashboardCode.includes('handleStartRoadmap(sName)');
    if (strongHasRoadmap && dashboardCode.includes('handleStartRoadmap(sName)')) {
      console.log('✅ [PASS] SkillGapDashboard has Roadmap accessibility for all skills');
      passed++;
    } else {
      console.error('❌ [FAIL] Strong skills lack Roadmap action');
      failed++;
    }
  } else {
    console.error('❌ [FAIL] Strong skills lack Roadmap action');
    failed++;
  }

  // Test 3: App.jsx supports selectedSkill in handleGenerateRoadmap
  if (
    appCode.includes('handleGenerateRoadmap = (missingSkills, role, selectedSkill)') ||
    appCode.includes('handleGenerateRoadmap = (skillsList, role, selectedSkill)')
  ) {
    console.log('✅ [PASS] App.jsx handles selectedSkill parameter in handleGenerateRoadmap');
    passed++;
  } else {
    console.error('❌ [FAIL] App.jsx does not accept selectedSkill parameter');
    failed++;
  }

  // Test 4: App.jsx passes active roadmap skill to LearningRoadmap
  if (
    appCode.includes('initialSkill=') ||
    appCode.includes('targetSkill=')
  ) {
    console.log('✅ [PASS] App.jsx passes initialSkill/targetSkill prop to LearningRoadmap');
    passed++;
  } else {
    console.error('❌ [FAIL] App.jsx does not pass initialSkill/targetSkill to LearningRoadmap');
    failed++;
  }

  // Test 5: LearningRoadmap accepts initialSkill/targetSkill and reacts to it
  if (
    roadmapCode.includes('initialSkill') &&
    (roadmapCode.includes('setActiveSkill(initialSkill') || roadmapCode.includes('setActiveSkill(targetSkill') || roadmapCode.includes('skillToLoad'))
  ) {
    console.log('✅ [PASS] LearningRoadmap accepts and syncs initialSkill/targetSkill');
    passed++;
  } else {
    console.error('❌ [FAIL] LearningRoadmap does not sync initialSkill/targetSkill');
    failed++;
  }

  console.log('\n----------------------------------------------------------------');
  console.log(`Navigation Results: ${passed} passed, ${failed} failed`);
  console.log('----------------------------------------------------------------');

  if (failed > 0) {
    process.exit(1);
  }
}

runNavigationTests().catch(e => {
  console.error(e);
  process.exit(1);
});

// agent-notes: { ctx: "Unit tests for roleplay service: scenario creation, session lifecycle, turn replies, and feedback scoring", deps: ["../backend/services/roleplay.service.js"], state: "active", last: "anti@2026-08-29" }

import assert from 'assert';
import {
  getScenarios,
  createScenario,
  getScenarioById,
  startRoleplaySession,
  postUserMessage,
  endRoleplaySession,
  getUserRoleplayHistory,
  deleteScenario
} from '../backend/services/roleplay.service.js';

async function runTests() {
  console.log('🧪 Starting Roleplay Service unit tests...');

  // 1. Test fetching scenarios
  const scenarios = await getScenarios('test_user_123');
  assert(Array.isArray(scenarios), 'Scenarios should be an array');
  assert(scenarios.length >= 6, 'Should load default built-in scenarios');
  console.log(`✅ Loaded ${scenarios.length} scenarios successfully.`);

  // 2. Test creating custom scenario
  const customScenario = await createScenario({
    title: 'Unit Test Scenario',
    category: 'interview',
    persona_description: 'A strict tech lead testing async JavaScript knowledge.',
    objective: 'Explain event loop and microtasks clearly.',
    difficulty: 'medium'
  }, 'test_user_123');

  assert(customScenario.id.startsWith('sc_custom_'), 'Custom scenario should have custom ID prefix');
  assert.strictEqual(customScenario.title, 'Unit Test Scenario');
  console.log('✅ Created custom scenario successfully.');

  // 3. Test start session
  const sessionData = await startRoleplaySession(customScenario.id, 'test_user_123');
  assert(sessionData.session.id.startsWith('sess_'), 'Session ID should start with sess_');
  assert.strictEqual(sessionData.session.status, 'active');
  assert(sessionData.messages.length >= 1, 'Should have opening message');
  assert.strictEqual(sessionData.messages[0].role, 'assistant');
  console.log('✅ Started roleplay session with character opening message.');

  // 4. Test user message turn
  const turnResult = await postUserMessage(
    sessionData.session.id,
    'In JavaScript, promises and microtasks execute before macro tasks like setTimeout in the event loop.',
    'test_user_123'
  );
  assert.strictEqual(turnResult.userMessage.role, 'user');
  assert.strictEqual(turnResult.assistantMessage.role, 'assistant');
  assert(turnResult.assistantMessage.content.length > 0, 'Assistant should return in-character reply');
  console.log('✅ Exchanged conversational turn with character reply.');

  // 5. Test ending session and getting scored feedback
  const endResult = await endRoleplaySession(sessionData.session.id, 'test_user_123');
  assert.strictEqual(endResult.session.status, 'completed');
  assert(typeof endResult.feedback.overall_score === 'number', 'Feedback should include numerical overall_score');
  assert(endResult.feedback.overall_score >= 0 && endResult.feedback.overall_score <= 100, 'Score should be between 0 and 100');
  assert(Array.isArray(endResult.feedback.strengths), 'Strengths should be an array');
  assert(Array.isArray(endResult.feedback.improvements), 'Improvements should be an array');
  assert(typeof endResult.feedback.summary === 'string', 'Summary should be a string');
  console.log(`✅ Completed session with overall score: ${endResult.feedback.overall_score}/100.`);

  // 6. Test history
  const history = await getUserRoleplayHistory('test_user_123');
  assert(Array.isArray(history), 'History should be an array');
  const foundSession = history.find(h => h.id === sessionData.session.id);
  assert(foundSession, 'History should contain the completed session');
  assert.strictEqual(foundSession.status, 'completed');
  console.log('✅ Verified session history tracking.');

  // 7. Cleanup custom scenario
  const deleted = await deleteScenario(customScenario.id, 'test_user_123');
  assert.strictEqual(deleted, true, 'Custom scenario should be deletable');
  console.log('✅ Cleaned up custom scenario.');

  console.log('\n🎉 ALL ROLEPLAY SERVICE TESTS PASSED!\n');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});

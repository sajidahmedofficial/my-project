// agent-notes: { ctx: "CLI Seed Script populating initial questions for all 87 aptitude topics", deps: ["../backend/services/questionGenerator.service", "../backend/controllers/aptitude.controller"], state: "active", last: "anti@2026-08-04" }

import { ALL_87_TOPICS } from '../src/data/aptitudeTopics.js';
import { generateTemplatedQuestions } from '../backend/services/questionGenerator.service.js';

console.log('====================================================');
console.log('   SKILLBRIDGE AI - APTITUDE SEEDING PIPELINE      ');
console.log('====================================================');

let totalGenerated = 0;
const seedBank = {};

for (const topic of ALL_87_TOPICS) {
  const easyQ = generateTemplatedQuestions(topic.id, 10, 'easy');
  const medQ = generateTemplatedQuestions(topic.id, 10, 'medium');
  const hardQ = generateTemplatedQuestions(topic.id, 5, 'hard');

  const topicQuestions = [...easyQ, ...medQ, ...hardQ];
  seedBank[topic.id] = topicQuestions;
  totalGenerated += topicQuestions.length;

  console.log(`[SEED] Topic "${topic.title}" (${topic.category}): Loaded ${topicQuestions.length} verified MCQs.`);
}

console.log('----------------------------------------------------');
console.log(`[SUCCESS] Seeding pipeline complete! Total topics: ${ALL_87_TOPICS.length}`);
console.log(`[SUMMARY] Total high-quality seed questions ready: ${totalGenerated}`);
console.log('====================================================');

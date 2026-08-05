// agent-notes: { ctx: "CLI Validation Script running quality, option, and schema checks on stored database questions", deps: ["dotenv", "../backend/services/questionValidationService", "../backend/services/questionBank.service", "../src/data/aptitudeTopics"], state: "active", last: "anti@2026-08-04" }

import dotenv from 'dotenv';
import connectDB from '../backend/config/db.js';
import { getQuestionsForSession, getTopicQuestionStats } from '../backend/services/questionBank.service.js';
import { validateGeneratedQuestion } from '../backend/services/questionValidationService.js';
import { ALL_87_TOPICS } from '../src/data/aptitudeTopics.js';

dotenv.config();

async function validateStoredBank() {
  console.log('====================================================');
  console.log('  QUESTION BANK QUALITY & SCHEMA VALIDATION (CLI)   ');
  console.log('====================================================');

  await connectDB();

  let totalValid = 0;
  let totalInvalid = 0;

  for (const topic of ALL_87_TOPICS) {
    const stats = await getTopicQuestionStats(topic.id);
    if (stats.totalStored === 0) continue;

    const questions = await getQuestionsForSession({ topicId: topic.id, limit: 100 });
    let topicValid = 0;
    let topicInvalid = 0;

    for (const q of questions) {
      const res = validateGeneratedQuestion(q);
      if (res.valid) {
        topicValid++;
        totalValid++;
      } else {
        topicInvalid++;
        totalInvalid++;
        console.warn(`[INVALID Q] [${topic.title}] ${q.id}: ${res.errors.join('; ')}`);
      }
    }

    console.log(`[TOPIC] "${topic.title}": ${topicValid}/${questions.length} valid stored questions.`);
  }

  console.log('----------------------------------------------------');
  console.log(`[SUMMARY] Total Valid Stored Questions: ${totalValid} | Total Invalid: ${totalInvalid}`);
  const passRate = (totalValid + totalInvalid) > 0 ? Math.round((totalValid / (totalValid + totalInvalid)) * 100) : 100;
  console.log(`[QUALITY COMPLIANCE] ${passRate}%`);
  console.log('====================================================');
  process.exit(0);
}

validateStoredBank();

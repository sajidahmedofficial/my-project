// agent-notes: { ctx: "CLI Gemini Question Generator script supporting topic specific or all topic batch generation", deps: ["dotenv", "../backend/services/batchGenerator.service", "../backend/services/questionBank.service", "../src/data/aptitudeTopics"], state: "active", last: "anti@2026-08-04" }

import dotenv from 'dotenv';
import connectDB from '../backend/config/db.js';
import { executeSingleBatch, getTopicBatchTracker } from '../backend/services/batchGenerator.service.js';
import { getTopicQuestionStats } from '../backend/services/questionBank.service.js';
import { ALL_87_TOPICS } from '../src/data/aptitudeTopics.js';

dotenv.config();

const rawArg = process.argv[2];
const targetTopicId = rawArg ? rawArg.replace(/^--/, '').toLowerCase() : 'all';

async function runCLI() {
  console.log('====================================================');
  console.log('  GEMINI API APTITUDE QUESTION GENERATOR (CLI)      ');
  console.log('====================================================');

  await connectDB();

  const topicsToProcess = targetTopicId === 'all'
    ? ALL_87_TOPICS
    : ALL_87_TOPICS.filter(t => t.id === targetTopicId || t.slug === targetTopicId);

  if (topicsToProcess.length === 0) {
    console.error(`[ERROR] Topic "${targetTopicId}" not found in 87 topics catalog.`);
    process.exit(1);
  }

  for (const topic of topicsToProcess) {
    console.log(`\n----------------------------------------------------`);
    console.log(`[GENERATING TOPIC] "${topic.title}" (${topic.category})`);
    console.log(`----------------------------------------------------`);

    let tracker = getTopicBatchTracker(topic.id);
    console.log(`[STATUS] Initial stored batch count: ${tracker.batchNumber}/50 Batches (${tracker.generatedCount} Qs)`);

    while (tracker.batchNumber < 50 && tracker.batchNumber < tracker.totalBatches) {
      try {
        tracker = await executeSingleBatch(topic.id);
        const stats = await getTopicQuestionStats(topic.id);
        console.log(`[BATCH ${tracker.batchNumber}/50 COMPLETE] Topic: ${topic.title} | Stored DB Qs: ${stats.totalStored}/1000 | Easy: ${stats.easyStored}, Med: ${stats.mediumStored}, Hard: ${stats.hardStored}`);
        
        // Brief pause to respect API rate limits
        await new Promise(res => setTimeout(res, 1200));
      } catch (err) {
        console.error(`[BATCH ERROR] Topic "${topic.id}" batch execution failed:`, err.message);
        break;
      }
    }

    const finalStats = await getTopicQuestionStats(topic.id);
    console.log(`\n[TOPIC COMPLETE] "${topic.title}": Total ${finalStats.totalStored}/1000 questions ready in database.`);
  }

  console.log('\n====================================================');
  console.log('   GENERATION PIPELINE EXECUTION FINISHED           ');
  console.log('====================================================');
  process.exit(0);
}

runCLI();

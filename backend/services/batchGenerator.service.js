// agent-notes: { ctx: "Batch Question Generation Manager tracking 50 batches @ 20 Qs/request per topic with persistent tracker store", deps: ["fs", "path", "./geminiService", "./questionGenerator.service", "./questionBank.service", "../data/aptitudeTopics"], state: "active", last: "anti@2026-08-04" }

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateGeminiQuestions } from './geminiService.js';
import { generateTemplatedQuestions } from './questionGenerator.service.js';
import { saveQuestionsToBank } from './questionBank.service.js';
import { ALL_87_TOPICS } from '../../src/data/aptitudeTopics.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TRACKER_STORE_PATH = path.join(__dirname, '../data/batchTrackerStore.json');

// In-memory active batch execution flags to allow pausing
const activeRunningTasks = new Map();

function ensureTrackerExists() {
  const dir = path.dirname(TRACKER_STORE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(TRACKER_STORE_PATH)) {
    fs.writeFileSync(TRACKER_STORE_PATH, JSON.stringify({ topics: {} }, null, 2), 'utf-8');
  }
}

function loadTrackerStore() {
  ensureTrackerExists();
  try {
    const raw = fs.readFileSync(TRACKER_STORE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return parsed.topics || {};
  } catch (err) {
    console.error('[BATCH GENERATOR] Error reading batchTrackerStore.json:', err.message);
    return {};
  }
}

function saveTrackerStore(data) {
  ensureTrackerExists();
  try {
    fs.writeFileSync(TRACKER_STORE_PATH, JSON.stringify({ topics: data }, null, 2), 'utf-8');
  } catch (err) {
    console.error('[BATCH GENERATOR] Error saving batchTrackerStore.json:', err.message);
  }
}

/**
 * Returns current batch tracking record for a given topicId.
 */
export function getTopicBatchTracker(topicId = 'percentage') {
  const store = loadTrackerStore();
  const foundTopic = ALL_87_TOPICS.find(t => t.id === topicId) || { title: topicId, category: 'General Placement Aptitude' };

  if (!store[topicId]) {
    store[topicId] = {
      topicId,
      topic: foundTopic.title,
      category: foundTopic.category,
      batchNumber: 0,
      totalBatches: 50,
      questionsPerBatch: 20,
      targetQuestions: 1000,
      generatedCount: 0,
      failedCount: 0,
      status: 'idle',
      history: []
    };
    saveTrackerStore(store);
  }

  return store[topicId];
}

/**
 * Returns tracking records for all 87 topics.
 */
export function getAllTopicsBatchTrackers() {
  const store = loadTrackerStore();
  return ALL_87_TOPICS.map(topic => getTopicBatchTracker(topic.id));
}

/**
 * Pauses active batch generation for a given topicId.
 */
export function pauseTopicBatchGeneration(topicId) {
  activeRunningTasks.set(topicId, false);
  const store = loadTrackerStore();
  if (store[topicId]) {
    store[topicId].status = 'paused';
    saveTrackerStore(store);
  }
  return getTopicBatchTracker(topicId);
}

/**
 * Executes a single batch of 20 questions for a given topicId.
 * Automatically determines difficulty based on batch number:
 * - Batches 1..20: Easy (400 Qs)
 * - Batches 21..40: Medium (400 Qs)
 * - Batches 41..50: Hard (200 Qs)
 */
export async function executeSingleBatch(topicId = 'percentage') {
  const tracker = getTopicBatchTracker(topicId);

  if (tracker.batchNumber >= tracker.totalBatches) {
    tracker.status = 'completed';
    const store = loadTrackerStore();
    store[topicId] = tracker;
    saveTrackerStore(store);
    return tracker;
  }

  const nextBatchNumber = tracker.batchNumber + 1;
  
  // Determine difficulty allocation:
  // Batches 1..20 -> easy (400 Qs)
  // Batches 21..40 -> medium (400 Qs)
  // Batches 41..50 -> hard (200 Qs)
  let difficulty = 'easy';
  if (nextBatchNumber > 20 && nextBatchNumber <= 40) difficulty = 'medium';
  if (nextBatchNumber > 40) difficulty = 'hard';

  console.log(`[BATCH ENGINE] Executing Batch ${nextBatchNumber}/${tracker.totalBatches} for topic "${tracker.topic}" (Difficulty: ${difficulty}, Target: 20 Qs)...`);

  let generated = [];
  let source = 'Gemini API Generator';
  let batchStatus = 'success';

  try {
    generated = await generateGeminiQuestions({
      topicId,
      topic: tracker.topic,
      category: tracker.category,
      difficulty,
      count: tracker.questionsPerBatch
    });
  } catch (geminiErr) {
    console.warn(`[BATCH ENGINE] Gemini API failed for batch ${nextBatchNumber}:`, geminiErr.message);
    try {
      generated = generateTemplatedQuestions(topicId, tracker.questionsPerBatch, difficulty);
      source = 'Templated Math Generator (Fallback)';
    } catch (fallbackErr) {
      batchStatus = 'failed';
    }
  }

  const savedCount = await saveQuestionsToBank(generated);
  const failedCountInBatch = tracker.questionsPerBatch - savedCount;

  // Update Tracker Metrics
  tracker.batchNumber = nextBatchNumber;
  tracker.generatedCount += savedCount;
  tracker.failedCount += failedCountInBatch;
  tracker.status = nextBatchNumber >= tracker.totalBatches ? 'completed' : 'in_progress';

  tracker.history.push({
    batchNumber: nextBatchNumber,
    questionsRequested: tracker.questionsPerBatch,
    generatedCount: savedCount,
    failedCount: failedCountInBatch,
    difficulty,
    source,
    status: batchStatus,
    timestamp: new Date().toISOString()
  });

  const store = loadTrackerStore();
  store[topicId] = tracker;
  saveTrackerStore(store);

  return tracker;
}

/**
 * Starts continuous batch generation for a given topicId up to maxBatches.
 * Runs in background asynchronously.
 */
export async function startTopicBatchGeneration({ topicId = 'percentage', maxBatches = 50, batchDelayMs = 1500 } = {}) {
  activeRunningTasks.set(topicId, true);
  const store = loadTrackerStore();
  
  let tracker = getTopicBatchTracker(topicId);
  tracker.status = 'in_progress';
  store[topicId] = tracker;
  saveTrackerStore(store);

  // Background loop execution
  (async () => {
    while (activeRunningTasks.get(topicId) && tracker.batchNumber < maxBatches && tracker.batchNumber < tracker.totalBatches) {
      try {
        tracker = await executeSingleBatch(topicId);
        if (tracker.status === 'completed') break;
        // Pause between batches to respect rate limits
        await new Promise(resolve => setTimeout(resolve, batchDelayMs));
      } catch (loopErr) {
        console.error(`[BATCH ENGINE] Error during batch loop for ${topicId}:`, loopErr.message);
        tracker.status = 'failed';
        const s = loadTrackerStore();
        s[topicId] = tracker;
        saveTrackerStore(s);
        break;
      }
    }

    if (activeRunningTasks.get(topicId) && tracker.batchNumber >= tracker.totalBatches) {
      tracker.status = 'completed';
      const s = loadTrackerStore();
      s[topicId] = tracker;
      saveTrackerStore(s);
    }
    activeRunningTasks.delete(topicId);
  })();

  return getTopicBatchTracker(topicId);
}

// agent-notes: { ctx: "Background job system for batch question generation with pause/resume support", deps: ["../services/batchGenerator.service", "../services/geminiService", "../services/questionBank.service", "../../src/data/aptitudeTopics"], state: "active", last: "anti@2026-08-04" }

import { 
  getTopicBatchTracker, 
  startTopicBatchGeneration, 
  pauseTopicBatchGeneration, 
  executeSingleBatch,
  getAllTopicsBatchTrackers 
} from '../services/batchGenerator.service.js';
import { generateGeminiQuestions } from '../services/geminiService.js';
import { saveQuestionsToBank, getTopicQuestionStats } from '../services/questionBank.service.js';
import { ALL_87_TOPICS } from '../../src/data/aptitudeTopics.js';

// In-memory Job Queue Map
const activeJobs = new Map();

/**
 * Starts continuous batch generation for a single topic up to 1,000 questions (50 batches @ 20 Qs).
 * Resumable: continues from current batch count.
 */
export async function generateTopicQuestions(topicId = 'percentage') {
  const tracker = getTopicBatchTracker(topicId);
  if (tracker.batchNumber >= tracker.totalBatches) {
    return { status: 'already_completed', tracker };
  }

  const jobId = `job_${topicId}_${Date.now()}`;
  activeJobs.set(jobId, { jobId, topicId, status: 'in_progress', startedAt: new Date() });

  // Launch non-blocking background task
  startTopicBatchGeneration({ topicId, maxBatches: 50, batchDelayMs: 1200 })
    .then(updatedTracker => {
      activeJobs.set(jobId, { jobId, topicId, status: updatedTracker.status, completedAt: new Date() });
    })
    .catch(err => {
      console.error(`[JOB SYSTEM] Job ${jobId} failed:`, err.message);
      activeJobs.set(jobId, { jobId, topicId, status: 'failed', error: err.message });
    });

  return {
    jobId,
    topicId,
    status: 'queued',
    tracker
  };
}

/**
 * Starts generation across all 87 aptitude topics sequentially.
 */
export async function generateAllQuestions() {
  const jobId = `job_all_${Date.now()}`;
  activeJobs.set(jobId, { jobId, topicId: 'all', status: 'in_progress', startedAt: new Date() });

  (async () => {
    for (const topic of ALL_87_TOPICS) {
      try {
        console.log(`[JOB ALL] Starting generation loop for topic "${topic.title}" (${topic.id})...`);
        await startTopicBatchGeneration({ topicId: topic.id, maxBatches: 50, batchDelayMs: 1500 });
      } catch (err) {
        console.error(`[JOB ALL] Error generating topic "${topic.id}":`, err.message);
      }
    }
    activeJobs.set(jobId, { jobId, topicId: 'all', status: 'completed', completedAt: new Date() });
  })();

  return {
    jobId,
    status: 'queued',
    totalTopics: ALL_87_TOPICS.length
  };
}

/**
 * Generates a single targeted question batch for a specific difficulty level.
 */
export async function generateQuestionBatch(topicId = 'percentage', difficulty = 'medium', batchSize = 20) {
  const foundTopic = ALL_87_TOPICS.find(t => t.id === topicId) || { title: topicId, category: 'General Placement Aptitude' };
  
  const generated = await generateGeminiQuestions({
    topicId,
    topic: foundTopic.title,
    category: foundTopic.category,
    difficulty,
    count: batchSize
  });

  const added = await saveQuestionsToBank(generated);
  const stats = await getTopicQuestionStats(topicId);

  return {
    topicId,
    difficulty,
    requested: batchSize,
    generated: generated.length,
    addedToDB: added,
    stats
  };
}

/**
 * Resumes generation for any topic that paused or failed before reaching 1,000 questions.
 */
export async function resumeFailedGeneration(topicId) {
  if (topicId) {
    return generateTopicQuestions(topicId);
  }

  // Resume all incomplete topics
  const allTrackers = getAllTopicsBatchTrackers();
  const incomplete = allTrackers.filter(t => t.batchNumber < t.totalBatches);

  for (const item of incomplete) {
    await generateTopicQuestions(item.topicId);
  }

  return { resumedCount: incomplete.length };
}

/**
 * Regenerates invalid questions for a topic.
 */
export async function regenerateInvalidQuestions(topicId = 'percentage') {
  const stats = await getTopicQuestionStats(topicId);
  const remaining = Math.max(0, 1000 - stats.totalStored);
  
  if (remaining > 0) {
    return generateQuestionBatch(topicId, 'medium', Math.min(20, remaining));
  }
  return { message: 'Topic bank is full (1,000 Qs stored).' };
}

export function getJobStatus(jobId) {
  return activeJobs.get(jobId) || { status: 'not_found' };
}

// agent-notes: { ctx: "Question Bank & Database Storage Manager supporting MongoDB and local JSON persistent fallback", deps: ["fs", "path", "../models/Question", "../utils/questionHash", "./questionGenerator.service"], state: "active", last: "anti@2026-08-04" }

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Question from '../models/Question.js';
import { generateQuestionHash } from '../utils/questionHash.js';
import { generateTemplatedQuestions } from './questionGenerator.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORE_PATH = path.join(__dirname, '../data/questionStore.json');

// Memory cache for superfast lookup when local store is active
let memoryQuestionStore = null;

function ensureStoreExists() {
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(STORE_PATH)) {
    fs.writeFileSync(STORE_PATH, JSON.stringify({ questions: [] }, null, 2), 'utf-8');
  }
}

function loadLocalStore() {
  if (memoryQuestionStore) return memoryQuestionStore;
  ensureStoreExists();
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    memoryQuestionStore = parsed.questions || [];
  } catch (err) {
    console.error('[QUESTION BANK] Error loading questionStore.json:', err.message);
    memoryQuestionStore = [];
  }
  return memoryQuestionStore;
}

function saveLocalStore(questions) {
  ensureStoreExists();
  memoryQuestionStore = questions;
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify({ questions }, null, 2), 'utf-8');
  } catch (err) {
    console.error('[QUESTION BANK] Error writing to questionStore.json:', err.message);
  }
}

/**
 * Saves an array of new question objects into Database & Local Persistent Store with deduplication.
 */
export async function saveQuestionsToBank(questionsArray = []) {
  if (!Array.isArray(questionsArray) || questionsArray.length === 0) return 0;

  let addedCount = 0;

  // 1. Save to Local Persistent Store
  const localStore = loadLocalStore();
  const existingHashes = new Set(localStore.map(q => q.questionHash));

  const newQuestionsToAppend = [];
  for (const q of questionsArray) {
    const hash = q.questionHash || generateQuestionHash(q.question, q.topic || q.topicId);
    if (!existingHashes.has(hash)) {
      existingHashes.add(hash);
      const normalized = {
        ...q,
        questionHash: hash,
        id: q.id || `q_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
      };
      localStore.push(normalized);
      newQuestionsToAppend.push(normalized);
      addedCount++;
    }
  }

  if (newQuestionsToAppend.length > 0) {
    saveLocalStore(localStore);
  }

  // 2. Save to MongoDB if connected
  try {
    if (Question && Question.db && Question.db.readyState === 1) {
      for (const q of newQuestionsToAppend) {
        try {
          const optionDocs = Array.isArray(q.options) 
            ? q.options.map((opt, i) => ({ id: `opt_${i}`, text: typeof opt === 'string' ? opt : opt.text, isCorrect: String(i) === String(q.correctAnswer) }))
            : [];

          await Question.updateOne(
            { questionHash: q.questionHash },
            {
              $setOnInsert: {
                id: q.id,
                category: q.category,
                topic: q.topic,
                topicId: q.topicId,
                question: q.question,
                options: optionDocs,
                correctAnswer: String(q.correctAnswer),
                explanation: q.explanation,
                difficulty: q.difficulty,
                tags: q.tags || [],
                source: q.source || 'SkillBridge Placement Question Bank',
                questionHash: q.questionHash
              }
            },
            { upsert: true }
          );
        } catch (dbErr) {
          // Ignore duplicate key race conditions in DB
        }
      }
    }
  } catch (err) {
    // DB not available or offline; local persistent store handled it
  }

  return addedCount;
}

/**
 * Retrieves questions directly from stored database/bank matching topicId and difficulty.
 * If bank has insufficient questions, generates & seeds the required amount into the database first.
 */
export async function getQuestionsForSession({
  topicId = 'percentage',
  difficulty = 'medium',
  limit = 10,
  category = 'Quantitative Aptitude',
  topicName = 'Percentage'
}) {
  const count = parseInt(limit, 10) || 10;
  let matches = [];

  // 1. Try fetching from MongoDB
  try {
    if (Question && Question.db && Question.db.readyState === 1) {
      const dbDocs = await Question.find({ topicId, difficulty }).limit(count).lean();
      if (dbDocs && dbDocs.length > 0) {
        matches = dbDocs.map(doc => ({
          id: doc.id,
          topicId: doc.topicId,
          topic: doc.topic,
          category: doc.category,
          difficulty: doc.difficulty,
          question: doc.question,
          options: (doc.options || []).map(o => o.text),
          correctAnswer: parseInt(doc.correctAnswer, 10) || 0,
          explanation: doc.explanation,
          solution: doc.explanation,
          tags: doc.tags || [],
          questionHash: doc.questionHash
        }));
      }
    }
  } catch (err) {
    // DB error fallback to local store
  }

  // 2. If MongoDB returned fewer questions than required, check Local Persistent Store
  if (matches.length < count) {
    const localStore = loadLocalStore();
    const localMatches = localStore.filter(q => q.topicId === topicId && q.difficulty === difficulty);
    
    // Combine unique by questionHash
    const existingHashes = new Set(matches.map(m => m.questionHash));
    for (const lq of localMatches) {
      if (!existingHashes.has(lq.questionHash)) {
        matches.push(lq);
        existingHashes.add(lq.questionHash);
      }
    }
  }

  // 3. If total stored questions are still less than requested limit, seed templated questions into DB/store
  if (matches.length < count) {
    const needed = count - matches.length;
    console.log(`[QUESTION BANK] Auto-seeding ${needed} ${difficulty} Qs for topic "${topicId}" into Database/Store...`);
    const generated = generateTemplatedQuestions(topicId, needed, difficulty);
    
    // Set proper category and topic titles
    const formatted = generated.map(g => ({
      ...g,
      topicId: topicId,
      category: category,
      topic: topicName
    }));

    await saveQuestionsToBank(formatted);

    // Append formatted directly to matches to avoid any recursive loops
    const existingHashes = new Set(matches.map(m => m.questionHash));
    for (const fg of formatted) {
      if (!existingHashes.has(fg.questionHash)) {
        matches.push(fg);
        existingHashes.add(fg.questionHash);
      }
    }
  }

  // Shuffle and slice to limit
  const shuffled = [...matches].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Returns stats for a given topic: total questions stored, breakdown by difficulty (Easy, Medium, Hard).
 */
export async function getTopicQuestionStats(topicId) {
  const localStore = loadLocalStore();
  const topicQuestions = localStore.filter(q => q.topicId === topicId);

  const easy = topicQuestions.filter(q => q.difficulty === 'easy').length;
  const medium = topicQuestions.filter(q => q.difficulty === 'medium').length;
  const hard = topicQuestions.filter(q => q.difficulty === 'hard').length;
  const total = topicQuestions.length;

  return {
    totalStored: total,
    easyStored: easy,
    mediumStored: medium,
    hardStored: hard,
    target: 1000,
    targetBreakdown: { easy: 400, medium: 400, hard: 200 }
  };
}

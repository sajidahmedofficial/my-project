// agent-notes: { ctx: "Aptitude Router mapping /api endpoints for topics, questions, quiz sessions, bookmarks & generation jobs", deps: ["express", "../controllers/aptitude.controller"], state: "active", last: "anti@2026-08-04" }

import express from 'express';
import {
  getCategories,
  getTopics,
  getTopicById,
  getTopicQuestionCount,
  getQuestions,
  getRandomQuestion,
  getQuestionById,
  startQuizSession,
  createQuizSession,
  submitQuizAnswer,
  submitQuizSession,
  getUserBookmarks,
  toggleBookmark,
  getUserProgress,
  adminCreateQuestion,
  adminBulkImport,
  adminGenerateAI,
  adminStartJob,
  adminGetJobStatus,
  adminGetBatchStatus,
  adminStartBatchGeneration,
  adminPauseBatchGeneration,
  adminExecuteSingleBatch
} from '../controllers/aptitude.controller.js';

const router = express.Router();

// Categories & Topics
router.get('/categories', getCategories);
router.get('/topics', getTopics);
router.get('/topics/:topicId', getTopicById);
router.get('/topics/:topicId/questions/count', getTopicQuestionCount);
router.get('/topics/:topicId/questions/random', getRandomQuestion);
router.get('/topics/:topicId/questions', getQuestions);

// Questions Engine
router.get('/questions', getQuestions);
router.get('/questions/:questionId', getQuestionById);
router.post('/questions/:questionId/submit', submitQuizAnswer);
router.post('/questions/:questionId/bookmark', toggleBookmark);
router.delete('/questions/:questionId/bookmark', toggleBookmark);

// Quiz Sessions Engine
router.get('/quiz/:topicId/start', startQuizSession);
router.post('/quiz/:sessionId/answer', submitQuizAnswer);
router.post('/quiz/:sessionId/finish', submitQuizSession);
router.post('/sessions', createQuizSession);
router.post('/sessions/:sessionId/answers', submitQuizAnswer);
router.post('/sessions/:sessionId/submit', submitQuizSession);

// Bookmarks & Progress
router.get('/bookmarks', getUserBookmarks);
router.get('/progress', getUserProgress);

// Admin Management & Job System
router.post('/admin/questions', adminCreateQuestion);
router.post('/admin/import', adminBulkImport);
router.post('/admin/generate-ai', adminGenerateAI);
router.post('/admin/generation/start', adminStartJob);
router.get('/admin/generation/:jobId', adminGetJobStatus);

// Batch Generation Pipeline (50 Batches @ 20 Qs/Request)
router.get('/admin/batch-status', adminGetBatchStatus);
router.post('/admin/batch-start', adminStartBatchGeneration);
router.post('/admin/batch-pause', adminPauseBatchGeneration);
router.post('/admin/batch-single', adminExecuteSingleBatch);

export default router;

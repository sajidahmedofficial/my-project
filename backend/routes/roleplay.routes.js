// agent-notes: { ctx: "Express router exposing AI roleplay scenario management, live turn exchanges, and coaching feedback endpoints", deps: ["express", "../services/roleplay.service"], state: "active", last: "anti@2026-08-29" }

import { Router } from 'express';
import {
  getScenarios,
  getScenarioById,
  createScenario,
  deleteScenario,
  startRoleplaySession,
  postUserMessage,
  getSessionDetails,
  endRoleplaySession,
  getUserRoleplayHistory
} from '../services/roleplay.service.js';

export const roleplayRouter = Router();

// Helper to extract user ID from req (supports auth middleware, session header, or fallback)
function getUserId(req) {
  return req.user?.id || req.headers['x-user-id'] || 'default_user';
}

// 1. List all scenarios (system + custom)
roleplayRouter.get('/scenarios', async (req, res) => {
  try {
    const userId = getUserId(req);
    const scenarios = await getScenarios(userId);
    res.json({ success: true, scenarios });
  } catch (err) {
    console.error('[Roleplay Router] Error loading scenarios:', err);
    res.status(500).json({ success: false, error: 'Failed to load scenarios.' });
  }
});

// 2. Get single scenario
roleplayRouter.get('/scenarios/:id', async (req, res) => {
  try {
    const userId = getUserId(req);
    const scenario = await getScenarioById(req.params.id, userId);
    if (!scenario) {
      return res.status(404).json({ success: false, error: 'Scenario not found.' });
    }
    res.json({ success: true, scenario });
  } catch (err) {
    console.error('[Roleplay Router] Error loading scenario:', err);
    res.status(500).json({ success: false, error: 'Failed to load scenario.' });
  }
});

// 3. Create custom scenario
roleplayRouter.post('/scenarios', async (req, res) => {
  try {
    const { title, category, persona_description, objective, difficulty } = req.body || {};
    if (!title || !category || !persona_description || !objective) {
      return res.status(400).json({
        success: false,
        error: 'title, category, persona_description, and objective are required.'
      });
    }

    const userId = getUserId(req);
    const scenario = await createScenario(
      { title, category, persona_description, objective, difficulty },
      userId
    );

    res.status(201).json({ success: true, scenario });
  } catch (err) {
    console.error('[Roleplay Router] Error creating scenario:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to create scenario.' });
  }
});

// 4. Delete custom scenario
roleplayRouter.delete('/scenarios/:id', async (req, res) => {
  try {
    const userId = getUserId(req);
    const deleted = await deleteScenario(req.params.id, userId);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Scenario not found or cannot be deleted.' });
    }
    res.json({ success: true, message: 'Scenario deleted successfully.' });
  } catch (err) {
    console.error('[Roleplay Router] Error deleting scenario:', err);
    res.status(500).json({ success: false, error: 'Failed to delete scenario.' });
  }
});

// 5. Start a new roleplay session
roleplayRouter.post('/sessions', async (req, res) => {
  try {
    const { scenario_id } = req.body || {};
    if (!scenario_id) {
      return res.status(400).json({ success: false, error: 'scenario_id is required.' });
    }

    const userId = getUserId(req);
    const result = await startRoleplaySession(scenario_id, userId);
    res.status(201).json({
      success: true,
      session: result.session,
      scenario: result.scenario,
      messages: result.messages
    });
  } catch (err) {
    console.error('[Roleplay Router] Error starting session:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to start session.' });
  }
});

// 6. Get session details & messages
roleplayRouter.get('/sessions/:id', async (req, res) => {
  try {
    const userId = getUserId(req);
    const data = await getSessionDetails(req.params.id, userId);
    if (!data) {
      return res.status(404).json({ success: false, error: 'Session not found.' });
    }
    res.json({ success: true, ...data });
  } catch (err) {
    console.error('[Roleplay Router] Error loading session:', err);
    res.status(500).json({ success: false, error: 'Failed to load session details.' });
  }
});

// 7. Send user message and get AI reply
roleplayRouter.post('/sessions/:id/messages', async (req, res) => {
  try {
    const { content } = req.body || {};
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: 'Message content is required.' });
    }

    const userId = getUserId(req);
    const result = await postUserMessage(req.params.id, content, userId);
    res.status(201).json({
      success: true,
      userMessage: result.userMessage,
      assistantMessage: result.assistantMessage
    });
  } catch (err) {
    console.error('[Roleplay Router] Error sending message:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to send message.' });
  }
});

// 8. End session and generate scored feedback report
roleplayRouter.post('/sessions/:id/end', async (req, res) => {
  try {
    const userId = getUserId(req);
    const result = await endRoleplaySession(req.params.id, userId);
    res.json({
      success: true,
      session: result.session,
      scenario: result.scenario,
      feedback: result.feedback
    });
  } catch (err) {
    console.error('[Roleplay Router] Error ending session:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to end session.' });
  }
});

// 9. Get user roleplay history
roleplayRouter.get('/history', async (req, res) => {
  try {
    const userId = getUserId(req);
    const history = await getUserRoleplayHistory(userId);
    res.json({ success: true, history });
  } catch (err) {
    console.error('[Roleplay Router] Error loading history:', err);
    res.status(500).json({ success: false, error: 'Failed to load session history.' });
  }
});

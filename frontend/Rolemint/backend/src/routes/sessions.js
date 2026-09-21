import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { getRoleplayOpeningLine, getRoleplayReply, getFeedback } from '../services/aiService.js';

export const sessionsRouter = Router();

sessionsRouter.use(requireAuth);

async function loadOwnedSession(sessionId, userId) {
  const result = await pool.query(
    'SELECT * FROM sessions WHERE id = $1 AND user_id = $2',
    [sessionId, userId]
  );
  return result.rows[0] || null;
}

async function loadScenario(scenarioId) {
  const result = await pool.query('SELECT * FROM scenarios WHERE id = $1', [scenarioId]);
  return result.rows[0] || null;
}

// List this user's sessions with scenario title + score (if completed)
sessionsRouter.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.id, s.status, s.started_at, s.ended_at,
              sc.title AS scenario_title, sc.category AS scenario_category,
              f.overall_score
       FROM sessions s
       JOIN scenarios sc ON sc.id = s.scenario_id
       LEFT JOIN feedback f ON f.session_id = s.id
       WHERE s.user_id = $1
       ORDER BY s.started_at DESC`,
      [req.user.id]
    );
    res.json({ sessions: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load sessions.' });
  }
});

// Start a new roleplay session for a scenario
sessionsRouter.post('/', async (req, res) => {
  const { scenario_id } = req.body || {};
  if (!scenario_id) {
    return res.status(400).json({ error: 'scenario_id is required.' });
  }

  try {
    const scenario = await loadScenario(scenario_id);
    if (!scenario || (!scenario.is_system && scenario.user_id !== req.user.id)) {
      return res.status(404).json({ error: 'Scenario not found.' });
    }

    const sessionResult = await pool.query(
      `INSERT INTO sessions (user_id, scenario_id) VALUES ($1, $2) RETURNING *`,
      [req.user.id, scenario_id]
    );
    const session = sessionResult.rows[0];

    const opening = await getRoleplayOpeningLine(scenario);

    const msgResult = await pool.query(
      `INSERT INTO messages (session_id, role, content) VALUES ($1, 'assistant', $2) RETURNING *`,
      [session.id, opening]
    );

    res.status(201).json({ session, scenario, messages: msgResult.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Could not start session.' });
  }
});

// Get a session with its scenario and full message history
sessionsRouter.get('/:id', async (req, res) => {
  try {
    const session = await loadOwnedSession(req.params.id, req.user.id);
    if (!session) return res.status(404).json({ error: 'Session not found.' });

    const scenario = await loadScenario(session.scenario_id);
    const messages = await pool.query(
      'SELECT * FROM messages WHERE session_id = $1 ORDER BY created_at ASC',
      [session.id]
    );
    const feedbackResult = await pool.query('SELECT * FROM feedback WHERE session_id = $1', [session.id]);

    res.json({
      session,
      scenario,
      messages: messages.rows,
      feedback: feedbackResult.rows[0] || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load session.' });
  }
});

// Send a trainee message, get the AI character's reply
sessionsRouter.post('/:id/messages', async (req, res) => {
  const { content } = req.body || {};
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'content is required.' });
  }

  try {
    const session = await loadOwnedSession(req.params.id, req.user.id);
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    if (session.status !== 'active') {
      return res.status(400).json({ error: 'This session has already ended.' });
    }

    const scenario = await loadScenario(session.scenario_id);

    const userMsgResult = await pool.query(
      `INSERT INTO messages (session_id, role, content) VALUES ($1, 'user', $2) RETURNING *`,
      [session.id, content.trim()]
    );

    const historyResult = await pool.query(
      'SELECT role, content FROM messages WHERE session_id = $1 ORDER BY created_at ASC',
      [session.id]
    );

    const reply = await getRoleplayReply(scenario, historyResult.rows);

    const assistantMsgResult = await pool.query(
      `INSERT INTO messages (session_id, role, content) VALUES ($1, 'assistant', $2) RETURNING *`,
      [session.id, reply]
    );

    res.status(201).json({
      userMessage: userMsgResult.rows[0],
      assistantMessage: assistantMsgResult.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Could not send message.' });
  }
});

// End the session and generate AI feedback
sessionsRouter.post('/:id/end', async (req, res) => {
  try {
    const session = await loadOwnedSession(req.params.id, req.user.id);
    if (!session) return res.status(404).json({ error: 'Session not found.' });

    const scenario = await loadScenario(session.scenario_id);
    const historyResult = await pool.query(
      'SELECT role, content FROM messages WHERE session_id = $1 ORDER BY created_at ASC',
      [session.id]
    );

    const hasTraineeLines = historyResult.rows.some((m) => m.role === 'user');
    let feedback = null;

    if (hasTraineeLines) {
      const generated = await getFeedback(scenario, historyResult.rows);
      const feedbackResult = await pool.query(
        `INSERT INTO feedback (session_id, overall_score, strengths, improvements, summary)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (session_id) DO UPDATE SET
           overall_score = EXCLUDED.overall_score,
           strengths = EXCLUDED.strengths,
           improvements = EXCLUDED.improvements,
           summary = EXCLUDED.summary
         RETURNING *`,
        [session.id, generated.overall_score, generated.strengths, generated.improvements, generated.summary]
      );
      feedback = feedbackResult.rows[0];
    }

    const updated = await pool.query(
      `UPDATE sessions SET status = 'completed', ended_at = now() WHERE id = $1 RETURNING *`,
      [session.id]
    );

    res.json({ session: updated.rows[0], feedback });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Could not end session.' });
  }
});

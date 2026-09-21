import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

export const scenariosRouter = Router();

scenariosRouter.use(requireAuth);

// List built-in scenarios plus this user's own custom scenarios
scenariosRouter.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM scenarios WHERE is_system = true OR user_id = $1
       ORDER BY is_system DESC, created_at DESC`,
      [req.user.id]
    );
    res.json({ scenarios: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load scenarios.' });
  }
});

scenariosRouter.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM scenarios WHERE id = $1 AND (is_system = true OR user_id = $2)`,
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Scenario not found.' });
    }
    res.json({ scenario: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load scenario.' });
  }
});

scenariosRouter.post('/', async (req, res) => {
  const { title, category, persona_description, objective, difficulty } = req.body || {};
  if (!title || !category || !persona_description || !objective) {
    return res.status(400).json({
      error: 'title, category, persona_description and objective are required.',
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO scenarios (user_id, title, category, persona_description, objective, difficulty)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.id, title, category, persona_description, objective, difficulty || 'medium']
    );
    res.status(201).json({ scenario: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create scenario.' });
  }
});

scenariosRouter.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM scenarios WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Scenario not found or not deletable.' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not delete scenario.' });
  }
});

// agent-notes: { ctx: "Rolemint Rehearsal Room dashboard listing available scenes, filters, start action, and scored past sessions", deps: ["react", "react-router-dom", "../services/roleplayApi", "../components/ScenarioCard"], state: "active", last: "anti@2026-08-29" }

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/roleplayApi.js';
import ScenarioCard from '../components/ScenarioCard.jsx';

function scoreClass(score) {
  if (score >= 75) return 'score-good';
  if (score >= 45) return 'score-mid';
  return 'score-low';
}

export default function Dashboard() {
  const [scenarios, setScenarios] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startingId, setStartingId] = useState(null);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [sRes, sessRes] = await Promise.all([
        api.listScenarios(),
        api.listSessions()
      ]);
      setScenarios(sRes.scenarios || []);
      setSessions(sessRes.sessions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleStart(scenarioId) {
    setStartingId(scenarioId);
    try {
      const res = await api.startSession(scenarioId);
      if (res?.session?.id) {
        navigate(`/sessions/${res.session.id}`);
      }
    } catch (err) {
      setError(err.message || 'Could not start session.');
      setStartingId(null);
    }
  }

  async function handleDeleteScenario(id) {
    if (!confirm('Are you sure you want to delete this custom scene?')) return;
    try {
      await api.deleteScenario(id);
      setScenarios(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      setError(err.message || 'Could not delete scenario.');
    }
  }

  const filteredScenarios = scenarios.filter(s => {
    if (filter === 'all') return true;
    return s.category?.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Your rehearsal room</h1>
          <p>Pick a scene to run, or write your own custom persona.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link className="btn btn-ghost" to="/scenarios/new">+ New scene</Link>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {loading && <p className="loading-line">Setting up the stage…</p>}

      {!loading && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {['all', 'interview', 'career', 'workplace', 'leadership', 'sales'].map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  textTransform: 'uppercase',
                  border: filter === cat ? '1px solid var(--spotlight)' : '1px solid var(--line)',
                  background: filter === cat ? 'rgba(242, 183, 5, 0.12)' : 'var(--stage-2)',
                  color: filter === cat ? 'var(--spotlight)' : 'var(--muted)',
                  cursor: 'pointer'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid">
            {filteredScenarios.map((s) => (
              <ScenarioCard
                key={s.id}
                scenario={s}
                onStart={handleStart}
                onDelete={handleDeleteScenario}
                starting={startingId === s.id}
              />
            ))}
          </div>

          <div className="section-label">Past rehearsal takes</div>
          {sessions.length === 0 && (
            <div className="empty-state">No sessions yet — run your first scene above.</div>
          )}
          {sessions.map((s) => (
            <div
              key={s.id}
              className="session-row"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(s.status === 'completed' ? `/sessions/${s.id}/feedback` : `/sessions/${s.id}`)}
            >
              <div>
                <div style={{ fontWeight: 600, color: 'var(--paper)' }}>{s.scenario_title}</div>
                <div className="meta">
                  {s.started_at ? new Date(s.started_at).toLocaleString() : 'Recent'} · <span style={{ textTransform: 'capitalize' }}>{s.status}</span>
                </div>
              </div>
              {s.overall_score != null ? (
                <span className={`score-pill ${scoreClass(s.overall_score)}`}>{s.overall_score} / 100</span>
              ) : (
                <span className="meta">{s.status === 'active' ? 'Take In Progress' : 'No score'}</span>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

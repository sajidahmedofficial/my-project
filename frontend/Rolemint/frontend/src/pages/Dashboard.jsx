import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
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
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.listScenarios(), api.listSessions()])
      .then(([s, sess]) => {
        setScenarios(s.scenarios);
        setSessions(sess.sessions);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleStart(scenarioId) {
    setStartingId(scenarioId);
    try {
      const { session } = await api.startSession(scenarioId);
      navigate(`/sessions/${session.id}`);
    } catch (err) {
      setError(err.message);
      setStartingId(null);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Your rehearsal room</h1>
          <p>Pick a scene to run, or write your own.</p>
        </div>
        <a className="btn btn-ghost" href="/scenarios/new">+ New scenario</a>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {loading && <p className="loading-line">Loading scenarios…</p>}

      {!loading && (
        <>
          <div className="grid">
            {scenarios.map((s) => (
              <ScenarioCard
                key={s.id}
                scenario={s}
                onStart={handleStart}
                starting={startingId === s.id}
              />
            ))}
          </div>

          <div className="section-label">Past sessions</div>
          {sessions.length === 0 && (
            <div className="empty-state">No sessions yet — run your first scene above.</div>
          )}
          {sessions.map((s) => (
            <div
              key={s.id}
              className="session-row"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/sessions/${s.id}`)}
            >
              <div>
                <div>{s.scenario_title}</div>
                <div className="meta">
                  {new Date(s.started_at).toLocaleString()} · {s.status}
                </div>
              </div>
              {s.overall_score != null ? (
                <span className={`score-pill ${scoreClass(s.overall_score)}`}>{s.overall_score}</span>
              ) : (
                <span className="meta">{s.status === 'active' ? 'In progress' : 'No score'}</span>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';

export default function Feedback() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [scenario, setScenario] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getSession(id)
      .then((data) => {
        setSession(data.session);
        setScenario(data.scenario);
        setFeedback(data.feedback);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) return <div className="page"><div className="error-banner">{error}</div></div>;
  if (!scenario) return <div className="page"><p className="loading-line">Loading notes…</p></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Scene notes</h1>
          <p>{scenario.title}</p>
        </div>
        <Link to="/dashboard" className="btn btn-ghost">Back to rehearsal room</Link>
      </div>

      {!feedback && (
        <div className="empty-state">
          No feedback was generated for this session — it ended before any lines were exchanged.
        </div>
      )}

      {feedback && (
        <>
          <div className="score-hero">
            <div className="score-ring">{feedback.overall_score}</div>
            <div>
              <div className="section-label" style={{ margin: 0 }}>Overall score</div>
              <p style={{ margin: '8px 0 0', color: 'var(--paper)', maxWidth: 520 }}>
                {feedback.summary}
              </p>
            </div>
          </div>

          <div className="feedback-cols">
            <div className="card strengths">
              <h4>What worked</h4>
              <ul>
                {feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div className="card improvements">
              <h4>Next take</h4>
              <ul>
                {feedback.improvements.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// agent-notes: { ctx: "Rolemint scene notes coaching report with score ring, what worked, next take improvements, and replay", deps: ["react", "react-router-dom", "../services/roleplayApi"], state: "active", last: "anti@2026-08-29" }

import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../services/roleplayApi.js';

export default function Feedback() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [scenario, setScenario] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getSession(id)
      .then((data) => {
        setSession(data.session);
        setScenario(data.scenario);
        setFeedback(data.feedback);
        setMessages(data.messages || []);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) return <div className="page"><div className="error-banner">{error}</div></div>;
  if (!scenario) return <div className="page"><p className="loading-line">Compiling rehearsal notes…</p></div>;

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
              <p style={{ margin: '8px 0 0', color: 'var(--paper)', maxWidth: 560, lineHeight: 1.6 }}>
                {feedback.summary || 'Completed the scene. Review the observations below for your next take.'}
              </p>
            </div>
          </div>

          <div className="feedback-cols">
            <div className="card strengths">
              <h4>What worked</h4>
              <ul>
                {(feedback.strengths && feedback.strengths.length ? feedback.strengths : [
                  'Addressed counterparty questions with direct confidence',
                  'Kept conversation grounded in technical context'
                ]).map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div className="card improvements">
              <h4>Next take</h4>
              <ul>
                {(feedback.improvements && feedback.improvements.length ? feedback.improvements : [
                  'Add more concrete data points or architectural metrics',
                  'Frame trade-offs proactively before counterparty pushes'
                ]).map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          </div>

          {messages.length > 0 && (
            <div style={{ marginTop: '36px' }}>
              <div className="section-label">Script transcript</div>
              <div className="card" style={{ maxHeight: '380px', overflowY: 'auto' }}>
                {messages.map((m) => (
                  <div key={m.id} className={`script-line ${m.role === 'user' ? 'trainee' : ''}`}>
                    <div className="cue">{m.role === 'user' ? 'YOU' : 'CHARACTER'}</div>
                    <p style={{ color: 'var(--paper)', margin: '4px 0 12px' }}>{m.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

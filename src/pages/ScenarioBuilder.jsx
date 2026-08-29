// agent-notes: { ctx: "Rolemint Scenario Builder page to write new AI personas and simulation objectives", deps: ["react", "react-router-dom", "../services/roleplayApi"], state: "active", last: "anti@2026-08-29" }

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/roleplayApi.js';

export default function ScenarioBuilder() {
  const [form, setForm] = useState({
    title: '',
    category: 'interview',
    persona_description: '',
    objective: '',
    difficulty: 'medium',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.createScenario(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Could not create scenario.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Write a new scene</h1>
          <p>Describe who the AI plays and what you're trying to accomplish.</p>
        </div>
        <Link to="/dashboard" className="btn btn-ghost">Cancel</Link>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <form className="card scenario-form" onSubmit={handleSubmit} style={{ maxWidth: 680 }}>
        <div className="field">
          <label htmlFor="title">Scene title</label>
          <input
            id="title"
            placeholder="e.g. Tough Salary Negotiation with Series-B Recruiter"
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="field">
            <label htmlFor="category">Category</label>
            <select id="category" value={form.category} onChange={(e) => update('category', e.target.value)}>
              <option value="interview">Interview</option>
              <option value="career">Career & Negotiation</option>
              <option value="workplace">Workplace & Stakeholder</option>
              <option value="leadership">Leadership & Crisis</option>
              <option value="sales">Sales & Consulting</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="difficulty">Difficulty</label>
            <select id="difficulty" value={form.difficulty} onChange={(e) => update('difficulty', e.target.value)}>
              <option value="easy">Easy (Receptive)</option>
              <option value="medium">Medium (Probing)</option>
              <option value="hard">Hard (Skeptical / Challenging)</option>
            </select>
          </div>
        </div>

        <div className="field">
          <label htmlFor="persona">Who does the AI play, and how do they behave?</label>
          <textarea
            id="persona"
            placeholder="e.g. You play Alex, a Principal Architect who challenges buzzwords and demands concrete distributed system design trade-offs."
            value={form.persona_description}
            onChange={(e) => update('persona_description', e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="objective">What is the trainee trying to achieve?</label>
          <textarea
            id="objective"
            placeholder="e.g. Defend the latency and failover strategy of a Kafka notification pipeline without getting flustered."
            value={form.objective}
            onChange={(e) => update('objective', e.target.value)}
            required
          />
        </div>

        <button className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving scene…' : 'Save scene'}
        </button>
      </form>
    </div>
  );
}

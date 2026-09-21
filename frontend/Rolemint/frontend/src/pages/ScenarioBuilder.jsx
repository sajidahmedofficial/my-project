import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';

export default function ScenarioBuilder() {
  const [form, setForm] = useState({
    title: '',
    category: 'custom',
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
      setError(err.message);
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
      </div>

      {error && <div className="error-banner">{error}</div>}

      <form className="card scenario-form" onSubmit={handleSubmit} style={{ maxWidth: 640 }}>
        <div className="field">
          <label htmlFor="title">Scene title</label>
          <input id="title" value={form.title} onChange={(e) => update('title', e.target.value)} required />
        </div>

        <div className="field">
          <label htmlFor="category">Category</label>
          <select id="category" value={form.category} onChange={(e) => update('category', e.target.value)}>
            <option value="sales">Sales</option>
            <option value="interview">Interview</option>
            <option value="support">Customer support</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="difficulty">Difficulty</label>
          <select id="difficulty" value={form.difficulty} onChange={(e) => update('difficulty', e.target.value)}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="persona">Who does the AI play, and how do they behave?</label>
          <textarea
            id="persona"
            placeholder="e.g. You play a landlord who is reluctant to fix a broken heater. You make excuses and only agree to a timeline if the tenant cites the lease clearly and stays calm."
            value={form.persona_description}
            onChange={(e) => update('persona_description', e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="objective">What is the trainee trying to achieve?</label>
          <textarea
            id="objective"
            placeholder="e.g. Get a firm repair date in writing without escalating the conflict."
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

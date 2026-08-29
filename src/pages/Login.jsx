// agent-notes: { ctx: "Rolemint login page with email and password auth", deps: ["react", "react-router-dom", "../services/roleplayApi"], state: "active", last: "anti@2026-08-29" }

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, setToken, setStoredUser } from '../services/roleplayApi.js';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
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
      const res = await api.login(form);
      if (res?.token) setToken(res.token);
      if (res?.user) setStoredUser(res.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h2>Welcome back</h2>
        <p className="hint">Log in to pick up where you left off.</p>
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="sajid@skillbridge.ai"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>
        <div className="switch-line">
          New here? <Link to="/signup">Create an account</Link>
        </div>
      </div>
    </div>
  );
}

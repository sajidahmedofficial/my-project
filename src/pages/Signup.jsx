// agent-notes: { ctx: "Rolemint signup page with name, email, and password registration", deps: ["react", "react-router-dom", "../services/roleplayApi"], state: "active", last: "anti@2026-08-29" }

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, setToken, setStoredUser } from '../services/roleplayApi.js';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
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
      const res = await api.signup(form);
      if (res?.token) setToken(res.token);
      if (res?.user) setStoredUser(res.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h2>Create your account</h2>
        <p className="hint">Free to start. No card required.</p>
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Sajid Ahmed"
              required
            />
          </div>
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
              minLength={6}
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <div className="switch-line">
          Already rehearsing with us? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}

// agent-notes: { ctx: "Live screenplay roleplay conversation room with character cues, typing indicators, and end take feedback", deps: ["react", "react-router-dom", "../services/roleplayApi"], state: "active", last: "anti@2026-08-29" }

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../services/roleplayApi.js';

export default function Roleplay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [scenario, setScenario] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    loadSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  async function loadSession() {
    try {
      const data = await api.getSession(id);
      if (data?.session) {
        setSession(data.session);
        setScenario(data.scenario);
        setMessages(data.messages || []);
        if (data.session.status === 'completed') {
          navigate(`/sessions/${id}/feedback`, { replace: true });
        }
      }
    } catch (err) {
      setError(err.message || 'Could not load session.');
    }
  }

  async function handleSend(e) {
    e?.preventDefault();
    if (!draft.trim() || sending) return;
    const content = draft.trim();
    setDraft('');
    setSending(true);
    setError('');

    const tempId = `temp-${Date.now()}`;
    setMessages((m) => [...m, { id: tempId, role: 'user', content }]);

    try {
      const res = await api.sendMessage(id, content);
      if (res?.userMessage && res?.assistantMessage) {
        setMessages((m) => [
          ...m.filter((msg) => msg.id !== tempId),
          res.userMessage,
          res.assistantMessage,
        ]);
      }
    } catch (err) {
      setError(err.message || 'Could not deliver line.');
    } finally {
      setSending(false);
    }
  }

  async function handleEnd() {
    setEnding(true);
    try {
      await api.endSession(id);
      navigate(`/sessions/${id}/feedback`);
    } catch (err) {
      setError(err.message || 'Could not end session.');
      setEnding(false);
    }
  }

  if (!scenario) {
    return (
      <div className="page">
        <p className="loading-line">Setting the scene…</p>
      </div>
    );
  }

  const characterName = scenario.persona_description?.split(',')[0]?.split(' ')[0] || 'CHARACTER';

  return (
    <div className="roleplay-layout">
      <div className="roleplay-header">
        <div>
          <h2>{scenario.title}</h2>
          <div className="obj">Objective: {scenario.objective}</div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-ghost" onClick={handleEnd} disabled={ending}>
            {ending ? 'Wrapping up take…' : 'End scene & get notes'}
          </button>
        </div>
      </div>

      {error && <div className="error-banner" style={{ margin: '12px 32px 0' }}>{error}</div>}

      <div className="transcript">
        {messages.map((m) => (
          <div key={m.id} className={`script-line ${m.role === 'user' ? 'trainee' : ''}`}>
            <div className="cue">{m.role === 'user' ? 'YOU' : characterName.toUpperCase()}</div>
            <p>{m.content}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {sending && <div className="typing-indicator">{characterName.toLowerCase()} is responding…</div>}

      <form className="composer" onSubmit={handleSend}>
        <textarea
          placeholder="Say your line… (Enter to send, Shift+Enter for newline)"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend(e);
            }
          }}
        />
        <button className="btn btn-primary" disabled={sending || !draft.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}

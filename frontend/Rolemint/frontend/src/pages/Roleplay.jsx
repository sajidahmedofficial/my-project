import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';

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
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function load() {
    try {
      const data = await api.getSession(id);
      setSession(data.session);
      setScenario(data.scenario);
      setMessages(data.messages);
      if (data.session.status === 'completed') {
        navigate(`/sessions/${id}/feedback`, { replace: true });
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!draft.trim() || sending) return;
    const content = draft.trim();
    setDraft('');
    setSending(true);
    setError('');

    setMessages((m) => [...m, { id: `temp-${Date.now()}`, role: 'user', content }]);

    try {
      const res = await api.sendMessage(id, content);
      setMessages((m) => [
        ...m.filter((msg) => !msg.id.toString().startsWith('temp-')),
        res.userMessage,
        res.assistantMessage,
      ]);
    } catch (err) {
      setError(err.message);
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
      setError(err.message);
      setEnding(false);
    }
  }

  if (!scenario) {
    return <div className="page"><p className="loading-line">Setting the scene…</p></div>;
  }

  return (
    <div className="roleplay-layout">
      <div className="roleplay-header">
        <div>
          <h2>{scenario.title}</h2>
          <div className="obj">Objective: {scenario.objective}</div>
        </div>
        <button className="btn btn-ghost" onClick={handleEnd} disabled={ending}>
          {ending ? 'Wrapping up…' : 'End scene & get notes'}
        </button>
      </div>

      {error && <div className="error-banner" style={{ margin: '12px 32px 0' }}>{error}</div>}

      <div className="transcript">
        {messages.map((m) => (
          <div key={m.id} className={`script-line ${m.role === 'user' ? 'trainee' : ''}`}>
            <div className="cue">{m.role === 'user' ? 'YOU' : 'CHARACTER'}</div>
            <p>{m.content}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {sending && <div className="typing-indicator">character is responding…</div>}

      <form className="composer" onSubmit={handleSend}>
        <textarea
          placeholder="Say your line…"
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

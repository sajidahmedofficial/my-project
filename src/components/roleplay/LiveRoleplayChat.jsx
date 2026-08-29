// agent-notes: { ctx: "Real-time interactive roleplay dialogue room with turn-by-turn AI persona responses and end-session feedback trigger", deps: ["lucide-react", "react"], state: "active", last: "anti@2026-08-29" }

import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Bot, User, CheckCircle, ArrowLeft, AlertCircle, Clock, Award, Shield, RefreshCw } from 'lucide-react';

export default function LiveRoleplayChat({ session, scenario, initialMessages = [], onSendMessage, onEndSession, onBack }) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!draft.trim() || sending) return;

    const userText = draft.trim();
    setDraft('');
    setSending(true);
    setError('');

    const tempUserMsg = {
      id: `temp_${Date.now()}`,
      role: 'user',
      content: userText,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const response = await onSendMessage(userText);
      if (response?.userMessage && response?.assistantMessage) {
        setMessages(prev => [
          ...prev.filter(m => m.id !== tempUserMsg.id),
          response.userMessage,
          response.assistantMessage
        ]);
      }
    } catch (err) {
      setError(err.message || 'Failed to get response from AI character.');
    } finally {
      setSending(false);
    }
  };

  const handleEnd = async () => {
    setEnding(true);
    setError('');
    try {
      await onEndSession();
    } catch (err) {
      setError(err.message || 'Failed to complete session.');
      setEnding(false);
    }
  };

  const traineeTurnCount = messages.filter(m => m.role === 'user').length;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[850px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-fadeIn">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-xl transition-colors"
            title="Back to scenarios"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {scenario?.title}
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold uppercase tracking-wider">
                {scenario?.difficulty}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 max-w-xl">
              <strong className="text-slate-700 dark:text-slate-300">Goal:</strong> {scenario?.objective}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300">
            <Award className="w-3.5 h-3.5 text-indigo-500" />
            <span>Turns: {traineeTurnCount}</span>
          </div>

          <button
            onClick={handleEnd}
            disabled={ending}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50"
          >
            {ending ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Scoring Transcript...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                <span>End & Get Scored Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Persona Banner */}
      <div className="px-5 py-2.5 bg-indigo-50/50 dark:bg-indigo-950/20 border-b border-indigo-100/50 dark:border-indigo-900/30 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="truncate">
            <strong className="text-slate-900 dark:text-white">AI Character:</strong> {scenario?.persona_description}
          </span>
        </div>
        <span className="hidden md:inline text-indigo-600 dark:text-indigo-400 font-medium shrink-0 ml-3">
          Live Roleplay Active
        </span>
      </div>

      {/* Error alert if any */}
      {error && (
        <div className="m-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Messages Transcript */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                  isUser
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-indigo-600 text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] sm:max-w-[70%] p-4 rounded-2xl text-sm leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-xs shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-xs border border-slate-200/70 dark:border-slate-700/60'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      isUser ? 'text-indigo-200' : 'text-indigo-600 dark:text-indigo-400'
                    }`}
                  >
                    {isUser ? 'You (Trainee)' : (scenario?.persona_description?.split(',')[0] || 'AI Character')}
                  </span>
                </div>
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          );
        })}

        {sending && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-xs border border-slate-200/70 dark:border-slate-700/60 flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                character is replying...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Composer Input */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form onSubmit={handleSend} className="flex items-end gap-2.5">
          <textarea
            rows={2}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your response in character... (Enter to send, Shift+Enter for new line)"
            className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
            disabled={sending || ending}
          />

          <button
            type="submit"
            disabled={sending || ending || !draft.trim()}
            className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            title="Send response"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

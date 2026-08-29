// agent-notes: { ctx: "Scored coaching evaluation view displaying readiness score meter, strengths, actionable improvements, and replay transcript", deps: ["lucide-react", "react"], state: "active", last: "anti@2026-08-29" }

import React, { useState } from 'react';
import { Award, CheckCircle2, TrendingUp, Sparkles, ArrowLeft, RefreshCw, ChevronDown, ChevronUp, Bot, User, MessageSquare } from 'lucide-react';

export default function RoleplayFeedbackView({ session, scenario, feedback, messages = [], onRetry, onNewScenario }) {
  const [showTranscript, setShowTranscript] = useState(false);

  const score = feedback?.overall_score ?? 75;

  const getScoreBadge = (s) => {
    if (s >= 85) return { label: 'Exceptional', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800' };
    if (s >= 70) return { label: 'Proficient', color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800' };
    return { label: 'Developing', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800' };
  };

  const badge = getScoreBadge(score);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn pb-12">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Award className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            <span>Simulation Coaching Report</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {scenario?.title} • <span className="uppercase font-semibold text-xs tracking-wider">{scenario?.category}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Scenario</span>
          </button>
          <button
            onClick={onNewScenario}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Choose Another Scene</span>
          </button>
        </div>
      </div>

      {/* Hero Score & Executive Summary */}
      <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-8">
        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 shrink-0 w-44 text-center">
          <div className="text-5xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
            {score}
          </div>
          <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
            Out of 100
          </div>
          <span className={`mt-3 px-2.5 py-0.5 rounded-full border text-xs font-bold uppercase tracking-wider ${badge.color}`}>
            {badge.label}
          </span>
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Executive Performance Summary</span>
          </div>
          <p className="text-slate-700 dark:text-slate-200 text-sm sm:text-base leading-relaxed">
            {feedback?.summary || 'Completed the simulation exchange successfully. Review the strengths and key improvement areas below to sharpen your communication agility.'}
          </p>
          <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 flex flex-wrap gap-4">
            <span><strong>Target Goal:</strong> {scenario?.objective}</span>
          </div>
        </div>
      </div>

      {/* Strengths and Improvements 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-100 dark:border-emerald-950/50 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-base">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3>Key Strengths & What Worked</h3>
          </div>
          <ul className="space-y-3">
            {(feedback?.strengths || ['Articulated ideas clearly', 'Kept conversation focused']).map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Improvements */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-amber-100 dark:border-amber-950/50 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-base">
            <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3>Tactical Next Take & Growth Areas</h3>
          </div>
          <ul className="space-y-3">
            {(feedback?.improvements || ['Add more specific metrics', 'Proactively address objections']).map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Replay Transcript Accordion */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <button
          onClick={() => setShowTranscript(prev => !prev)}
          className="w-full px-6 py-4 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100/60 dark:hover:bg-slate-800/70 transition-colors text-left"
        >
          <div className="flex items-center gap-2.5 text-sm font-bold text-slate-900 dark:text-white">
            <MessageSquare className="w-4 h-4 text-indigo-500" />
            <span>Full Session Transcript ({messages.length} lines)</span>
          </div>
          {showTranscript ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>

        {showTranscript && (
          <div className="p-6 space-y-4 border-t border-slate-100 dark:border-slate-800 max-h-96 overflow-y-auto">
            {messages.map((m, idx) => {
              const isUser = m.role === 'user';
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {isUser ? <User className="w-3 h-3 text-slate-600" /> : <Bot className="w-3 h-3 text-indigo-500" />}
                    <span>{isUser ? 'You' : 'AI Character'}</span>
                  </div>
                  <p className={`p-3 rounded-xl text-xs sm:text-sm ${
                    isUser
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-slate-900 dark:text-slate-100 border border-indigo-100 dark:border-indigo-900/40'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                  }`}>
                    {m.content}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

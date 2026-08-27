// agent-notes: { ctx: "Clean minimal SaaS Topic configuration modal for selecting difficulty, question count & quiz mode", deps: ["lucide-react"], state: "active", last: "anti@2026-08-27" }

import React, { useState } from 'react';
import { X, Play, Clock, ShieldCheck, Sparkles } from 'lucide-react';

export default function TopicConfigModal({ topic, isOpen, onClose, onStartQuiz }) {
  const [difficulty, setDifficulty] = useState('medium');
  const [limit, setLimit] = useState(20);
  const [mode, setMode] = useState('practice');

  if (!isOpen || !topic) return null;

  const handleStart = () => {
    onStartQuiz({
      topicId: topic.id,
      topicName: topic.title,
      category: topic.category,
      difficulty,
      limit,
      mode
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in text-slate-900">
      <div className="bg-white max-w-lg w-full rounded-2xl p-6 sm:p-7 border border-slate-200 space-y-5 shadow-modal relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div>
          <span className="saas-badge saas-badge-indigo text-[10px] mb-1.5 inline-block">
            {topic.category}
          </span>
          <h2 className="text-lg font-bold text-slate-900">{topic.title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">1,000 Questions Bank Available • AI Verified</p>
        </div>

        {/* Difficulty Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 block uppercase tracking-wider">Select Difficulty</label>
          <div className="grid grid-cols-4 gap-2">
            {['easy', 'medium', 'hard', 'expert'].map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`py-2 px-3 rounded-lg font-medium text-xs capitalize border transition-colors ${
                  difficulty === d
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-950 font-semibold shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Number of Questions Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 block uppercase tracking-wider">Number of Questions</label>
          <div className="grid grid-cols-5 gap-2">
            {[10, 20, 30, 50, 100].map((num) => (
              <button
                key={num}
                onClick={() => setLimit(num)}
                className={`py-2 text-center rounded-lg font-medium text-xs border transition-colors ${
                  limit === num
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-950 font-semibold shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Mode Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 block uppercase tracking-wider">Practice Mode</label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: 'practice', name: 'Practice', desc: 'Instant Answer & Tips', icon: ShieldCheck },
              { id: 'test', name: 'Test Mode', desc: 'Real Exam Setup', icon: Play },
              { id: 'timed', name: 'Timed Mode', desc: 'Strict Timer Run', icon: Clock }
            ].map((m) => {
              const Icon = m.icon;
              const isSelected = mode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`p-3 rounded-lg border text-left flex flex-col justify-between space-y-1 transition-colors ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-950 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">{m.name}</span>
                    <span className="text-[10px] text-slate-500 line-clamp-1">{m.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Start Button */}
        <div className="pt-2">
          <button
            onClick={handleStart}
            className="saas-btn-primary w-full py-2.5 text-xs font-medium gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" /> Start Assessment Session ({limit} Questions)
          </button>
        </div>
      </div>
    </div>
  );
}

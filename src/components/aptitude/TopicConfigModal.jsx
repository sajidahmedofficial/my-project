// agent-notes: { ctx: "Topic configuration modal for selecting difficulty, question count & quiz mode", deps: ["lucide-react"], state: "active", last: "anti@2026-08-04" }

import React, { useState } from 'react';
import { X, Play, Clock, ShieldCheck, Zap } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass max-w-lg w-full rounded-3xl p-6 md:p-8 border border-card-border space-y-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-2 rounded-xl bg-gray-900 border border-gray-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <span className="text-[10px] font-bold text-accent-pink uppercase tracking-wider block mb-1">
            {topic.category}
          </span>
          <h2 className="text-2xl font-black text-white">{topic.title}</h2>
          <p className="text-xs text-gray-400 mt-1">1,000 Questions Bank Available • AI Verified</p>
        </div>

        {/* Difficulty Selection */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold text-gray-300 block uppercase tracking-wider">Select Difficulty</label>
          <div className="grid grid-cols-4 gap-2">
            {['easy', 'medium', 'hard', 'expert'].map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`py-2 px-3 rounded-xl font-bold text-xs capitalize border transition-all ${
                  difficulty === d
                    ? 'bg-accent-purple/20 border-accent-purple text-white shadow-lg shadow-purple-600/30'
                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Number of Questions Selection */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold text-gray-300 block uppercase tracking-wider">Number of Questions</label>
          <div className="grid grid-cols-5 gap-2">
            {[10, 20, 30, 50, 100].map((num) => (
              <button
                key={num}
                onClick={() => setLimit(num)}
                className={`py-2 text-center rounded-xl font-bold text-xs border transition-all ${
                  limit === num
                    ? 'bg-accent-pink/20 border-accent-pink text-white shadow-lg shadow-pink-600/30'
                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Mode Selection */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold text-gray-300 block uppercase tracking-wider">Practice Mode</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'practice', name: 'Practice', desc: 'Instant Answer & Explanations', icon: ShieldCheck },
              { id: 'test', name: 'Test Mode', desc: 'Real Exam Environment', icon: Play },
              { id: 'timed', name: 'Timed Mode', desc: 'Strict Timer Challenge', icon: Clock }
            ].map((m) => {
              const Icon = m.icon;
              const isSelected = mode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between space-y-1 transition-all ${
                    isSelected
                      ? 'bg-gradient-to-tr from-accent-purple/30 to-accent-pink/30 border-accent-purple text-white shadow-lg'
                      : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-accent-pink' : 'text-gray-500'}`} />
                  <div>
                    <div className="text-xs font-bold text-white">{m.name}</div>
                    <div className="text-[9px] text-gray-400">{m.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleStart}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-accent-purple to-accent-pink hover:opacity-95 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-purple-600/30 transition-all hover:scale-[1.02]"
        >
          <Zap className="w-4 h-4 fill-current" /> Start Practice Session ({limit} Qs)
        </button>
      </div>
    </div>
  );
}

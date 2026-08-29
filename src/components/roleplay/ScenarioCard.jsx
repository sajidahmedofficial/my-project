// agent-notes: { ctx: "High-contrast card component displaying roleplay scenario details, category, difficulty tag, and start button", deps: ["lucide-react"], state: "active", last: "anti@2026-08-29" }

import React from 'react';
import { Play, Sparkles, User, Target, Shield, Trash2, ArrowRight } from 'lucide-react';

export default function ScenarioCard({ scenario, onStart, onDelete, isStarting }) {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'hard':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'interview':
        return '💼';
      case 'career':
      case 'sales':
        return '📈';
      case 'workplace':
        return '🤝';
      case 'leadership':
        return '👑';
      default:
        return '✨';
    }
  };

  return (
    <div className="group relative flex flex-col justify-between p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-600/50 transition-all duration-200">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl" role="img" aria-label="category">{getCategoryIcon(scenario.category)}</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {scenario.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium uppercase tracking-wider ${getDifficultyColor(scenario.difficulty)}`}>
              {scenario.difficulty}
            </span>
            {!scenario.is_system && onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(scenario.id);
                }}
                className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                title="Delete custom scene"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2">
          {scenario.title}
        </h3>

        <div className="space-y-2.5 my-3 text-sm">
          <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
            <User className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
            <p className="line-clamp-2 text-xs leading-relaxed">
              <strong className="text-slate-900 dark:text-white">AI Persona:</strong> {scenario.persona_description}
            </p>
          </div>

          <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
            <Target className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <p className="line-clamp-2 text-xs leading-relaxed">
              <strong className="text-slate-900 dark:text-white">Your Goal:</strong> {scenario.objective}
            </p>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between">
        <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 font-medium">
          <Shield className="w-3.5 h-3.5" /> {scenario.is_system ? 'Verified Simulation' : 'Custom Scene'}
        </span>

        <button
          onClick={() => onStart(scenario.id)}
          disabled={isStarting}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow active:scale-95 transition-all disabled:opacity-50"
        >
          {isStarting ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Preparing...</span>
            </>
          ) : (
            <>
              <span>Start Roleplay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

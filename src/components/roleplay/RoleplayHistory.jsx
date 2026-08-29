// agent-notes: { ctx: "Roleplay session history component displaying completed simulation sessions, score trends, and recap actions", deps: ["lucide-react", "react"], state: "active", last: "anti@2026-08-29" }

import React from 'react';
import { History, Award, Calendar, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

export default function RoleplayHistory({ history = [], onViewSession, onStartNew }) {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
          <History className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">No roleplay sessions yet</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          Start a simulation from the scenario catalog to build your communication, leadership, and interview readiness.
        </p>
        <button
          onClick={onStartNew}
          className="mt-5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow transition-all"
        >
          Browse Scenarios
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-500" />
          <span>Past Roleplay Sessions ({history.length})</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {history.map((item) => (
          <div
            key={item.id}
            onClick={() => onViewSession(item.id)}
            className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700/60 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {item.scenario_category}
                </span>
                {item.overall_score ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-full">
                    <Award className="w-3 h-3" />
                    <span>Score: {item.overall_score}/100</span>
                  </span>
                ) : (
                  <span className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full font-medium">
                    In Progress
                  </span>
                )}
              </div>

              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 line-clamp-1">
                {item.scenario_title}
              </h4>

              {item.feedback_summary && (
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {item.feedback_summary}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-3 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {item.started_at ? new Date(item.started_at).toLocaleDateString() : 'Recent'}
              </span>

              <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 hover:underline">
                View Feedback <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

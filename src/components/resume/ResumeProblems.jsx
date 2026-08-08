// agent-notes: { ctx: "Actionable resume problem list component with Apply Fix capability", deps: ["react", "lucide-react"], state: "active", last: "anti@2026-08-06" }
import React from 'react';
import { AlertCircle, Check } from 'lucide-react';

export default function ResumeProblems({ problems = [], onApplyFix }) {
  return (
    <div className="glass rounded-2xl p-6 border border-gray-800 space-y-4">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-400" /> RESUME PROBLEMS
      </h3>

      <div className="space-y-3">
        {problems.map((prob) => (
          <div key={prob.id} className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-300">{prob.problem}</span>
              {!prob.fixed ? (
                <button
                  onClick={() => onApplyFix(prob.id)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> Apply Fix
                </button>
              ) : (
                <span className="text-xs font-bold text-emerald-400">Fixed ✓</span>
              )}
            </div>
            <p className="text-xs text-gray-400 line-through">{prob.original}</p>
            <p className="text-xs text-emerald-400">Suggested: {prob.suggested}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

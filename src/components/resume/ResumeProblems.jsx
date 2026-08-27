// agent-notes: { ctx: "Clean minimal SaaS Resume Problems list component", deps: ["react", "lucide-react"], state: "active", last: "anti@2026-08-27" }
import React from 'react';
import { AlertCircle, Check } from 'lucide-react';

export default function ResumeProblems({ problems = [], onApplyFix }) {
  const unfixedCount = problems.filter(p => !p.fixed).length;

  const handleApplyAll = () => {
    problems.forEach(p => {
      if (!p.fixed) onApplyFix(p.id);
    });
  };

  return (
    <div className="saas-card p-5 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-amber-600" /> Resume Optimizations
        </h3>

        {unfixedCount > 0 && (
          <button
            onClick={handleApplyAll}
            className="saas-btn-primary py-1 px-3 text-xs gap-1.5"
          >
            <Check className="w-3.5 h-3.5" /> Apply All Fixes
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {problems.map((prob) => (
          <div key={prob.id} className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900">{prob.problem}</span>
              {!prob.fixed ? (
                <button
                  onClick={() => onApplyFix(prob.id)}
                  className="saas-btn-secondary py-1 px-2.5 text-xs font-medium gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> Apply Fix
                </button>
              ) : (
                <span className="saas-badge saas-badge-success text-xs">Fixed ✓</span>
              )}
            </div>
            <p className="text-xs text-slate-400 line-through">{prob.original}</p>
            <p className="text-xs text-emerald-800 font-medium bg-emerald-50 p-2 rounded-md border border-emerald-100">
              Suggested: {prob.suggested}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// agent-notes: { ctx: "Clean minimal SaaS AI Suggestion diff card rendering structured JSON patches", deps: ["react", "lucide-react"], state: "active", last: "anti@2026-08-27" }
import React from 'react';
import { Sparkles, Check, X, Plus, Edit2 } from 'lucide-react';

export default function ResumeSuggestionCard({ 
  patch = {
    changes: [
      {
        section: "Skills",
        action: "add",
        value: "React",
        reason: "Verified through Skill Bridge"
      },
      {
        section: "Projects",
        action: "update",
        original: "Portfolio website",
        updated: "Responsive React portfolio application",
        reason: "React skill verified"
      }
    ]
  },
  onApplyAllSuggestions, 
  onReject 
}) {
  const changes = patch?.changes || [];

  return (
    <div className="saas-card p-5 space-y-4 border-indigo-200 bg-indigo-50/30">
      <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
        <div>
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> AI Resume Suggestion Patch
          </h3>
          <p className="text-[11px] text-slate-500">Review recommended edits before applying to your active resume</p>
        </div>

        <span className="saas-badge saas-badge-indigo text-[10px]">
          {changes.length} Pending
        </span>
      </div>

      <div className="space-y-2">
        {changes.map((item, idx) => (
          <div key={idx} className="p-3 rounded-lg bg-white border border-slate-200 space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`saas-badge text-[10px] ${
                  item.action === 'add' ? 'saas-badge-success' : 'saas-badge-indigo'
                }`}>
                  {item.action === 'add' ? <Plus className="w-3 h-3" /> : <Edit2 className="w-3 h-3" />}
                  {item.action} {item.section}
                </span>
                <span className="text-slate-400 text-[11px]">Reason: {item.reason}</span>
              </div>
            </div>

            {item.action === 'add' ? (
              <div className="p-2 rounded bg-emerald-50 text-emerald-900 font-medium">
                + Add "{item.value}" to {item.section}
              </div>
            ) : (
              <div className="space-y-0.5">
                <div className="text-slate-400 line-through text-[11px]">Original: {item.original}</div>
                <div className="text-emerald-800 font-medium">Updated: {item.updated}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          onClick={onReject}
          className="saas-btn-secondary py-1.5 px-3 text-xs gap-1"
        >
          <X className="w-3.5 h-3.5 text-slate-400" /> Reject
        </button>

        <button
          onClick={onApplyAllSuggestions}
          className="saas-btn-primary py-1.5 px-4 text-xs font-medium gap-1.5"
        >
          <Check className="w-3.5 h-3.5" /> Apply All Changes
        </button>
      </div>
    </div>
  );
}

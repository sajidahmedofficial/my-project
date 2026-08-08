// agent-notes: { ctx: "AI Suggestion diff card rendering structured JSON patches with APPLY ALL SUGGESTIONS button", deps: ["react", "lucide-react"], state: "active", last: "anti@2026-08-06" }
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
    <div className="glass rounded-2xl p-6 border border-accent-purple/40 bg-accent-purple/5 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between pb-3 border-b border-accent-purple/20">
        <div>
          <h3 className="text-sm font-black text-white flex items-center gap-2 tracking-wider uppercase">
            <Sparkles className="w-4 h-4 text-accent-purple" /> AI RESUME UPDATE ENGINE - STRUCTURED PATCH
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">Review AI-proposed section edits before applying to your active resume</p>
        </div>

        <span className="px-2.5 py-0.5 rounded bg-accent-purple/20 text-accent-purple text-[10px] font-bold uppercase">
          {changes.length} PATCHES PENDING
        </span>
      </div>

      <div className="space-y-3">
        {changes.map((item, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1 ${
                  item.action === 'add' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {item.action === 'add' ? <Plus className="w-3 h-3" /> : <Edit2 className="w-3 h-3" />}
                  {item.action} {item.section}
                </span>
                <span className="text-gray-400 text-[11px] italic">Reason: {item.reason}</span>
              </div>
            </div>

            {item.action === 'add' ? (
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold">
                + Add "{item.value}" to {item.section}
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-gray-500 line-through">Original: {item.original}</div>
                <div className="text-emerald-400 font-bold">Updated: {item.updated}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          onClick={onReject}
          className="px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all"
        >
          <X className="w-4 h-4 text-red-400" /> Reject
        </button>

        <button
          onClick={onApplyAllSuggestions}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
        >
          <Check className="w-4.5 h-4.5" /> APPLY ALL SUGGESTIONS
        </button>
      </div>
    </div>
  );
}

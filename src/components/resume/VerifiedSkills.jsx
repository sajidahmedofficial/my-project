// agent-notes: { ctx: "Clean minimal SaaS verified skills list", deps: ["react", "lucide-react"], state: "active", last: "anti@2026-08-27" }
import React from 'react';
import { Award, CheckCircle2 } from 'lucide-react';

export default function VerifiedSkills({ skillsStatus = [] }) {
  const verified = skillsStatus.filter(s => s.certified || s.status === 'GAINED');

  return (
    <div className="saas-card p-5 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <h3 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
          <Award className="w-4 h-4 text-indigo-600" /> Verified Skills ({verified.length})
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {verified.map((sk) => (
          <div key={sk.name || sk.skill} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 text-center space-y-0.5">
            <span className="text-xs font-medium text-slate-900 block truncate">{sk.name || sk.skill}</span>
            <span className="text-[10px] font-semibold text-emerald-700 block">Verified ✓</span>
          </div>
        ))}
      </div>
    </div>
  );
}

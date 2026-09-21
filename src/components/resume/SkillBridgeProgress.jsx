// agent-notes: { ctx: "Clean minimal SaaS Skill bridge learning progress tracker", deps: ["react", "lucide-react"], state: "active", last: "anti@2026-08-27" }
import React from 'react';
import { BookOpen, Zap, CheckCircle2 } from 'lucide-react';

export default function SkillBridgeProgress({ skillsStatus = [], onOpenVerification }) {
  const learningSkills = skillsStatus.filter(s => s.status !== 'GAINED');

  if (learningSkills.length === 0) {
    return (
      <div className="saas-card p-4 bg-emerald-50 border-emerald-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <div>
            <h4 className="text-xs font-semibold text-slate-900">All Target Skills Verified</h4>
            <p className="text-[11px] text-slate-500">Your profile is 100% complete for your target role.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="saas-card p-5 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <h3 className="text-xs font-semibold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
          <BookOpen className="w-4 h-4 text-indigo-600" /> Skills In Progress ({learningSkills.length})
        </h3>
        <span className="text-xs text-slate-500">Complete tests to earn verified badges</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {learningSkills.map((sk) => (
          <div key={sk.name || sk.skill} className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-slate-900 text-xs truncate">{sk.name || sk.skill}</span>
              <span className="saas-badge saas-badge-warning text-[10px]">
                {sk.progress ?? sk.currentLevel ?? 40}%
              </span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${sk.progress ?? sk.currentLevel ?? 40}%` }}
              />
            </div>

            <div className="pt-1 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Pending Test</span>
              <button
                onClick={() => onOpenVerification && onOpenVerification(sk.name || sk.skill)}
                className="saas-btn-secondary py-0.5 px-2 text-[11px] font-medium"
              >
                Verify Skill
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

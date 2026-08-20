// agent-notes: { ctx: "Compact 2-column Skill bridge learning progress tracker supporting verification pipeline trigger", deps: ["react", "lucide-react"], state: "active", last: "anti@2026-08-20" }
import React from 'react';
import { BookOpen, Zap, CheckCircle2 } from 'lucide-react';

export default function SkillBridgeProgress({ skillsStatus = [], onOpenVerification }) {
  const learningSkills = skillsStatus.filter(s => s.status !== 'GAINED');

  if (learningSkills.length === 0) {
    return (
      <div className="glass rounded-2xl p-4 border border-emerald-500/30 bg-emerald-950/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <div>
            <h4 className="text-xs font-bold text-white">All Target Skills Verified & Gained!</h4>
            <p className="text-[11px] text-gray-400">Your profile is 100% complete for your target role.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-5 border border-gray-800 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-gray-800">
        <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
          <BookOpen className="w-4 h-4 text-amber-400" /> Skills In Progress ({learningSkills.length})
        </h3>
        <span className="text-[11px] text-gray-400">Complete assessments to gain verified badges</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {learningSkills.map((sk) => (
          <div key={sk.name || sk.skill} className="p-3 rounded-xl bg-gray-900/80 border border-gray-800 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-white text-xs truncate">{sk.name || sk.skill}</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 text-[10px] font-extrabold border border-amber-500/30 shrink-0">
                {sk.progress ?? sk.currentLevel ?? 40}%
              </span>
            </div>

            <div className="w-full bg-gray-950 rounded-full h-1.5 overflow-hidden border border-gray-800">
              <div 
                className="bg-gradient-to-r from-accent-purple to-accent-pink h-full transition-all duration-300 rounded-full"
                style={{ width: `${sk.progress ?? sk.currentLevel ?? 40}%` }}
              />
            </div>

            <div className="pt-1 flex items-center justify-between">
              <span className="text-[10px] text-gray-400">Pending Test</span>
              <button
                onClick={() => onOpenVerification && onOpenVerification(sk.name || sk.skill)}
                className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-accent-purple to-accent-pink hover:opacity-95 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-md shadow-accent-purple/20 transition-all"
              >
                <Zap className="w-3 h-3 fill-white" /> Start Verify
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

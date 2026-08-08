// agent-notes: { ctx: "Verified & certified skill list component", deps: ["react", "lucide-react"], state: "active", last: "anti@2026-08-06" }
import React from 'react';
import { Award } from 'lucide-react';

export default function VerifiedSkills({ skillsStatus = [] }) {
  const verified = skillsStatus.filter(s => s.certified || s.status === 'GAINED');

  return (
    <div className="glass rounded-2xl p-6 border border-gray-800 space-y-4">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <Award className="w-4 h-4 text-emerald-400" /> VERIFIED SKILLS
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {verified.map((sk) => (
          <div key={sk.name} className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-center space-y-1">
            <span className="text-xs font-bold text-white block">{sk.name}</span>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block">CERTIFIED ✓</span>
          </div>
        ))}
      </div>
    </div>
  );
}

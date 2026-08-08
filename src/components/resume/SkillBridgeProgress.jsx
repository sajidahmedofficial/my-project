// agent-notes: { ctx: "Skill bridge learning progress bar tracker component supporting verification pipeline trigger", deps: ["react", "lucide-react"], state: "active", last: "anti@2026-08-06" }
import React from 'react';
import { BookOpen, Zap } from 'lucide-react';

export default function SkillBridgeProgress({ skillsStatus = [], onOpenVerification, onAdvanceSkill }) {
  const learningSkills = skillsStatus.filter(s => s.status !== 'GAINED');

  return (
    <div className="glass rounded-2xl p-6 border border-gray-800 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-400" /> SKILL BRIDGE LEARNING & VERIFICATION
        </h3>
        <span className="text-xs text-gray-400">Complete MCQ → Coding → Project to gain verification</span>
      </div>

      <div className="space-y-4">
        {learningSkills.map((sk) => (
          <div key={sk.name || sk.skill} className="space-y-2 p-3.5 rounded-xl bg-gray-900/60 border border-gray-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{sk.name || sk.skill}</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold">
                  {sk.status || 'LEARNING'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 font-semibold">{sk.progress ?? sk.currentLevel ?? 40}% Progress</span>
                <button
                  onClick={() => onOpenVerification && onOpenVerification(sk.name || sk.skill)}
                  className="px-3 py-1 rounded-lg bg-gradient-to-r from-accent-purple to-accent-pink hover:opacity-95 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-accent-purple/20 transition-all"
                >
                  <Zap className="w-3.5 h-3.5 fill-white" /> Start Verification Module
                </button>
              </div>
            </div>
            <div className="w-full bg-gray-900 rounded-full h-2 overflow-hidden border border-gray-800">
              <div 
                className="bg-gradient-to-r from-accent-purple to-accent-pink h-full transition-all duration-300"
                style={{ width: `${sk.progress ?? sk.currentLevel ?? 40}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

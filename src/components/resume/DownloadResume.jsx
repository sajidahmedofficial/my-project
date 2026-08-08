// agent-notes: { ctx: "Updated resume download action bar component evaluating 100% completion logic", deps: ["react", "lucide-react"], state: "active", last: "anti@2026-08-06" }
import React from 'react';
import { CheckCircle, Eye, Download, Trophy, Sparkles } from 'lucide-react';

export function calculateOverallSkillScore(skillGap = []) {
  if (!skillGap || !skillGap.length) return 0;
  const total = skillGap.reduce(
    (sum, skill) => sum + (skill.currentLevel ?? skill.progress ?? (skill.status === 'GAINED' ? 100 : 0)),
    0
  );
  return Math.round(total / skillGap.length);
}

export default function DownloadResume({ skillsStatus = [], onPreview, onDownload }) {
  const overallScore = calculateOverallSkillScore(skillsStatus);
  const is100Percent = overallScore === 100;
  const gained = skillsStatus.filter(s => (s.status === 'GAINED' || (s.progress ?? s.currentLevel) >= 100)).map(s => s.name || s.skill).join(', ');

  return (
    <div className={`glass rounded-2xl p-6 border transition-all ${
      is100Percent 
        ? 'border-amber-400/50 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-accent-purple/10 shadow-2xl' 
        : 'border-emerald-500/30 bg-emerald-500/5'
    } flex flex-col md:flex-row md:items-center justify-between gap-6`}>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {is100Percent ? (
            <span className="px-2.5 py-0.5 rounded bg-amber-400/20 text-amber-300 text-xs font-black uppercase tracking-wider flex items-center gap-1">
              <Trophy className="w-4 h-4 text-amber-300" /> 100% JOURNEY COMPLETE
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              {overallScore}% SKILL MASTERY
            </span>
          )}
        </div>

        <h3 className="text-base font-black text-white flex items-center gap-2">
          {is100Percent ? (
            <>
              <Sparkles className="w-5 h-5 text-amber-300" /> Congratulations! Your Skill Bridge journey is complete.
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5 text-emerald-400" /> UPDATED RESUME & CERTIFICATES READY
            </>
          )}
        </h3>

        <p className="text-xs text-gray-300">
          Verified Skills ({skillsStatus.filter(s => (s.status === 'GAINED' || (s.progress ?? s.currentLevel) >= 100)).length}/{skillsStatus.length}): {gained}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={onPreview} 
          className="px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-emerald-400 text-white text-xs font-bold flex items-center gap-2 transition-all"
        >
          <Eye className="w-4 h-4 text-emerald-400" /> PREVIEW RESUME
        </button>

        <button 
          onClick={onDownload} 
          className={`px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 shadow-lg transition-all ${
            is100Percent 
              ? 'bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-400 text-gray-950 hover:opacity-95 shadow-amber-400/20' 
              : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
          }`}
        >
          <Download className="w-4 h-4" /> {is100Percent ? 'DOWNLOAD 100% FINAL RESUME' : 'DOWNLOAD RESUME'}
        </button>
      </div>
    </div>
  );
}

// agent-notes: { ctx: "Clean minimal SaaS resume download action bar component", deps: ["react", "lucide-react"], state: "active", last: "anti@2026-08-27" }
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
    <div className="saas-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          {is100Percent ? (
            <span className="saas-badge saas-badge-success text-xs">
              <Trophy className="w-3.5 h-3.5" /> 100% Mastery Complete
            </span>
          ) : (
            <span className="saas-badge saas-badge-indigo text-xs">
              {overallScore}% Skill Mastery
            </span>
          )}
        </div>

        <h3 className="text-sm font-semibold text-slate-900">
          {is100Percent ? "Congratulations! Your Skill Bridge profile is complete." : "Optimized Resume & Certificates Ready"}
        </h3>

        <p className="text-xs text-slate-500">
          Verified Skills ({skillsStatus.filter(s => (s.status === 'GAINED' || (s.progress ?? s.currentLevel) >= 100)).length}/{skillsStatus.length}): {gained || "In progress"}
        </p>
      </div>

      <div className="flex items-center gap-2.5">
        <button 
          onClick={onPreview} 
          className="saas-btn-secondary py-2 px-3 text-xs gap-1.5"
        >
          <Eye className="w-3.5 h-3.5 text-slate-500" /> Preview Resume
        </button>

        <button 
          onClick={onDownload} 
          className="saas-btn-primary py-2 px-4 text-xs font-medium gap-1.5"
        >
          <Download className="w-3.5 h-3.5" /> {is100Percent ? 'Download Master Resume' : 'Download Resume'}
        </button>
      </div>
    </div>
  );
}

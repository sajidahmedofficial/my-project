// agent-notes: { ctx: "Clean minimal SaaS interactive pipeline flow component", deps: ["react", "lucide-react"], state: "active", last: "anti@2026-08-27" }
import React from 'react';
import { Upload, Search, BarChart3, Target, BookOpen, ShieldCheck, FileCheck, Trophy, Download } from 'lucide-react';

export default function TargetPipelineFlow({ currentStage = 1, onStepClick }) {
  const steps = [
    { num: 1, label: "Upload", icon: Upload, desc: "PDF / DOCX", tab: 'overview', targetId: 'upload-section' },
    { num: 2, label: "Audit", icon: Search, desc: "ATS & Grammar", tab: 'overview', targetId: 'analysis-summary' },
    { num: 3, label: "Score", icon: BarChart3, desc: "Metrics", tab: 'overview', targetId: 'score-cards' },
    { num: 4, label: "Skill Gap", icon: Target, desc: "Matrix", tab: 'skills', targetId: 'skill-gap-section' },
    { num: 5, label: "Bridge", icon: BookOpen, desc: "Learning", tab: 'skills', targetId: 'skill-bridge-section' },
    { num: 6, label: "Certify", icon: ShieldCheck, desc: "Credentials", tab: 'certs', targetId: 'certificates-section' },
    { num: 7, label: "Fixes", icon: FileCheck, desc: "Apply Fixes", tab: 'issues', targetId: 'problems-section' },
    { num: 8, label: "Mastery", icon: Trophy, desc: "100% Score", tab: 'certs', targetId: 'mastery-section' },
    { num: 9, label: "Export", icon: Download, desc: "Download PDF", tab: 'certs', targetId: 'download-section' }
  ];

  const handleClick = (step) => {
    if (onStepClick) {
      onStepClick(step);
    }
  };

  return (
    <div className="saas-card p-3 space-y-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" /> Progression Pipeline
        </h3>
        <span className="text-[11px] text-slate-500">Click any stage to navigate</span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1.5 pt-0.5">
        {steps.map((st) => {
          const Icon = st.icon;
          const isCurrent = st.num === currentStage;
          const isPassed = st.num < currentStage;

          return (
            <button
              key={st.num}
              onClick={() => handleClick(st)}
              className={`p-2 rounded-lg text-center space-y-1 border transition-colors cursor-pointer ${
                isCurrent 
                  ? 'bg-indigo-50 border-indigo-600 text-indigo-900 font-semibold shadow-sm' 
                  : isPassed 
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className={`w-6 h-6 rounded-md flex items-center justify-center mx-auto text-xs ${
                isCurrent 
                  ? 'bg-indigo-600 text-white' 
                  : isPassed 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-slate-100 text-slate-500'
              }`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="text-[11px] truncate leading-tight">{st.label}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// agent-notes: { ctx: "Interactive clickable target pipeline flow with auto-scroll and tab-jump triggers", deps: ["react", "lucide-react"], state: "active", last: "anti@2026-08-20" }
import React from 'react';
import { Upload, Search, BarChart3, Target, BookOpen, ShieldCheck, FileCheck, Trophy, Download, ChevronRight } from 'lucide-react';

export default function TargetPipelineFlow({ currentStage = 1, onStepClick }) {
  const steps = [
    { num: 1, label: "Upload Resume", icon: Upload, desc: "PDF / DOCX Upload", tab: 'overview', targetId: 'upload-section' },
    { num: 2, label: "7-Dimensional Parser", icon: Search, desc: "Grammar, ATS & Skills", tab: 'overview', targetId: 'analysis-summary' },
    { num: 3, label: "Resume Score", icon: BarChart3, desc: "Multi-Metric Evaluation", tab: 'overview', targetId: 'score-cards' },
    { num: 4, label: "Skill Gap Engine", icon: Target, desc: "Target Role Matrix", tab: 'skills', targetId: 'skill-gap-section' },
    { num: 5, label: "Skill Bridge AI", icon: BookOpen, desc: "Learning, MCQ & Code", tab: 'skills', targetId: 'skill-bridge-section' },
    { num: 6, label: "Certification", icon: ShieldCheck, desc: "SBA PDF Certificate", tab: 'certs', targetId: 'certificates-section' },
    { num: 7, label: "Update Resume", icon: FileCheck, desc: "Structured Patch App", tab: 'issues', targetId: 'problems-section' },
    { num: 8, label: "100% Mastery", icon: Trophy, desc: "Master Profile", tab: 'certs', targetId: 'mastery-section' },
    { num: 9, label: "Download", icon: Download, desc: "Export Clean Resume", tab: 'certs', targetId: 'download-section' }
  ];

  const handleClick = (step) => {
    if (onStepClick) {
      onStepClick(step);
    }
  };

  return (
    <div className="glass rounded-2xl p-4 border border-gray-800 space-y-2.5 bg-gray-950/70">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black text-gray-300 uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> INTERACTIVE PIPELINE FLOW
        </h3>
        <span className="text-[10px] text-accent-purple font-semibold">Click any step to auto-scroll & view feature ›</span>
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
              className={`p-2.5 rounded-xl text-center space-y-1.5 border transition-all cursor-pointer group hover:scale-[1.03] active:scale-95 ${
                isCurrent 
                  ? 'bg-accent-purple/20 border-accent-purple text-white shadow-lg shadow-accent-purple/15 ring-1 ring-accent-purple/50' 
                  : isPassed 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
                  : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-white'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center mx-auto text-xs font-black transition-all ${
                isCurrent 
                  ? 'bg-accent-purple text-white shadow-md' 
                  : isPassed 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-gray-950 border border-gray-800 text-gray-400 group-hover:text-white'
              }`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="text-[10px] font-extrabold truncate leading-tight">{st.label}</div>
              <div className="text-[8px] text-gray-500 hidden lg:block truncate">{st.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

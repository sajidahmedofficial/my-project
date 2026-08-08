// agent-notes: { ctx: "Interactive target flow diagram banner illustrating the end-to-end SkillBridge AI candidate progression pipeline", deps: ["react", "lucide-react"], state: "active", last: "anti@2026-08-06" }
import React from 'react';
import { Upload, Search, BarChart3, Target, BookOpen, ShieldCheck, FileCheck, Trophy, Download, ChevronRight } from 'lucide-react';

export default function TargetPipelineFlow({ currentStage = 1 }) {
  const steps = [
    { num: 1, label: "Upload Resume", icon: Upload, desc: "PDF / DOCX Upload" },
    { num: 2, label: "7-Dimensional Parser", icon: Search, desc: "Grammar, ATS, Problems & Skills" },
    { num: 3, label: "Resume Score", icon: BarChart3, desc: "Multi-Metric Evaluation" },
    { num: 4, label: "Skill Gap Engine", icon: Target, desc: "Target Job Comparison" },
    { num: 5, label: "Skill Bridge AI", icon: BookOpen, desc: "Learning, MCQ & Coding" },
    { num: 6, label: "Certification", icon: ShieldCheck, desc: "SHA-256 Verified PDF" },
    { num: 7, label: "Update Resume", icon: FileCheck, desc: "Structured Patch Approval" },
    { num: 8, label: "100% Mastery", icon: Trophy, desc: "Master Profile" },
    { num: 9, label: "Download", icon: Download, desc: "Final Resume Export" }
  ];

  return (
    <div className="glass rounded-2xl p-5 border border-gray-800 space-y-3 bg-gray-950/60">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black text-gray-300 uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> END-TO-END TARGET PIPELINE FLOW
        </h3>
        <span className="text-[10px] text-gray-500 font-mono">System 01 → System 07</span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1.5 pt-1">
        {steps.map((st, i) => {
          const Icon = st.icon;
          return (
            <div 
              key={st.num}
              className={`p-2.5 rounded-xl text-center space-y-1.5 border transition-all ${
                st.num === currentStage 
                  ? 'bg-accent-purple/20 border-accent-purple text-white shadow-lg shadow-accent-purple/10' 
                  : st.num < currentStage 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-gray-900/40 border-gray-800 text-gray-400'
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-gray-950 border border-gray-800 flex items-center justify-center mx-auto text-xs font-black">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="text-[10px] font-extrabold truncate leading-tight">{st.label}</div>
              <div className="text-[8px] text-gray-500 hidden lg:block truncate">{st.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

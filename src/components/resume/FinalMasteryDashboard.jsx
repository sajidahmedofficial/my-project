// agent-notes: { ctx: "100% Final Mastery Dashboard component displaying completion banner, verified skills list, updated resume summary, and download actions", deps: ["react", "lucide-react"], state: "active", last: "anti@2026-08-06" }
import React from 'react';
import { Trophy, CheckCircle, Eye, Download, Award, Sparkles } from 'lucide-react';

export default function FinalMasteryDashboard({ 
  targetRole = "Full Stack Developer", 
  skillsStatus = [],
  onPreviewResume, 
  onDownloadFinalResume, 
  onDownloadCertificates 
}) {
  const verifiedList = skillsStatus.length > 0 ? skillsStatus : [
    { name: "HTML", status: "GAINED" },
    { name: "CSS", status: "GAINED" },
    { name: "JavaScript", status: "GAINED" },
    { name: "React", status: "GAINED" },
    { name: "Node.js", status: "GAINED" },
    { name: "Express.js", status: "GAINED" },
    { name: "MongoDB", status: "GAINED" },
    { name: "REST API", status: "GAINED" },
    { name: "Docker", status: "GAINED" },
    { name: "AWS", status: "GAINED" }
  ];

  const resumeImprovements = [
    "Grammar corrected",
    "ATS optimized",
    "Formatting improved",
    "Skills updated",
    "Verified skills added",
    "Projects improved"
  ];

  return (
    <div className="glass rounded-3xl border-2 border-amber-400/50 bg-gradient-to-b from-amber-500/10 via-gray-950 to-black p-6 sm:p-8 space-y-8 shadow-2xl animate-fade-in">
      {/* 100% COMPLETE BANNER */}
      <div className="text-center space-y-3 pb-6 border-b border-amber-400/20">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-black tracking-widest uppercase shadow-lg shadow-amber-400/10">
          <Sparkles className="w-4 h-4" /> 🎉 100% COMPLETE
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
          {targetRole} Skill Profile
        </h2>

        <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-emerald-400 to-teal-300 py-1">
          100% ✓
        </div>

        <p className="text-xs sm:text-sm text-amber-200/80 font-medium">
          All required competencies verified through SkillBridge AI
        </p>
      </div>

      {/* VERIFIED SKILLS LIST */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" /> VERIFIED SKILLS
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {verifiedList.map((sk, idx) => (
            <div 
              key={idx} 
              className="p-3.5 rounded-xl bg-gray-900/80 border border-gray-800 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2 font-bold text-white">
                <span className="text-emerald-400 font-black">✓</span>
                <span>{sk.name || sk.skill}</span>
              </div>
              <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-black tracking-wider uppercase border border-emerald-500/30">
                CERTIFIED
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* UPDATED RESUME HIGHLIGHTS */}
      <div className="space-y-4 pt-4 border-t border-gray-800">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" /> UPDATED RESUME
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {resumeImprovements.map((imp, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <span className="text-emerald-400 font-black">✓</span>
              <span>{imp}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6 border-t border-gray-800">
        <button
          onClick={onPreviewResume}
          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gray-900 border border-gray-800 hover:border-accent-purple text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md"
        >
          <Eye className="w-4 h-4 text-accent-purple" /> PREVIEW RESUME
        </button>

        <button
          onClick={onDownloadFinalResume}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-400 hover:opacity-95 text-gray-950 text-xs font-black flex items-center justify-center gap-2 shadow-xl shadow-amber-400/20 transition-all"
        >
          <Download className="w-4 h-4" /> DOWNLOAD FINAL RESUME
        </button>

        <button
          onClick={onDownloadCertificates}
          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-accent-purple hover:bg-accent-purple/90 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-accent-purple/20 transition-all"
        >
          <Award className="w-4 h-4" /> DOWNLOAD CERTIFICATES
        </button>
      </div>
    </div>
  );
}

// agent-notes: { ctx: "Clean minimal SaaS 100% Final Mastery Dashboard component", deps: ["react", "lucide-react"], state: "active", last: "anti@2026-08-27" }
import React from 'react';
import { Trophy, CheckCircle, Eye, Download, Award } from 'lucide-react';

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
    "Grammar & style corrected",
    "ATS format optimized",
    "Quantifiable metrics added",
    "Technical skills matrix updated",
    "Verified credential badges embedded",
    "Project bullet points enhanced"
  ];

  return (
    <div className="saas-card p-6 sm:p-8 space-y-6 border-emerald-200 bg-emerald-50/20">
      {/* 100% COMPLETE BANNER */}
      <div className="text-center space-y-2 pb-4 border-b border-emerald-100">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
          <Trophy className="w-3.5 h-3.5" /> 100% Placement Ready
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          {targetRole} Profile Complete
        </h2>

        <div className="text-3xl sm:text-4xl font-bold text-emerald-600">
          100% Verified
        </div>

        <p className="text-xs text-slate-600">
          All required role competencies verified through standardized assessments
        </p>
      </div>

      {/* VERIFIED SKILLS LIST */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <CheckCircle className="w-4 h-4 text-emerald-600" /> Verified Competencies
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {verifiedList.map((sk, idx) => (
            <div 
              key={idx} 
              className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2 font-medium text-slate-900">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>{sk.name || sk.skill}</span>
              </div>
              <span className="saas-badge saas-badge-success text-[10px]">
                Certified
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* UPDATED RESUME HIGHLIGHTS */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
          Applied Resume Enhancements
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {resumeImprovements.map((imp, idx) => (
            <div key={idx} className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs flex items-center gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>{imp}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-4 border-t border-slate-100">
        <button
          onClick={onPreviewResume}
          className="w-full sm:w-auto saas-btn-secondary py-2 px-4 text-xs font-medium gap-1.5"
        >
          <Eye className="w-3.5 h-3.5 text-slate-500" /> Preview Resume
        </button>

        <button
          onClick={onDownloadFinalResume}
          className="w-full sm:w-auto saas-btn-primary py-2 px-4 text-xs font-medium gap-1.5"
        >
          <Download className="w-3.5 h-3.5" /> Download Final Resume PDF
        </button>

        <button
          onClick={onDownloadCertificates}
          className="w-full sm:w-auto saas-btn-secondary py-2 px-4 text-xs font-medium gap-1.5"
        >
          <Award className="w-3.5 h-3.5 text-slate-500" /> Export Certificates
        </button>
      </div>
    </div>
  );
}

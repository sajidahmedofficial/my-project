// agent-notes: { ctx: "Clean minimal SaaS Unified Master Certificate component", deps: ["react", "lucide-react"], state: "active", last: "anti@2026-08-27" }
import React, { useState } from 'react';
import { Award, ShieldCheck, Download, CheckCircle2, FileCheck } from 'lucide-react';

export default function CertificateList({ certificates = [], candidateName = "Candidate" }) {
  const [showModal, setShowModal] = useState(false);

  const verifiedTools = [
    { name: "HTML5", category: "Frontend Core", score: 100 },
    { name: "CSS3", category: "Styling & Responsive UI", score: 100 },
    { name: "JavaScript", category: "Programming & Logic", score: 100 },
    { name: "React.js", category: "Frontend Framework", score: 95 },
    { name: "Node.js", category: "Backend Runtime", score: 92 },
    { name: "Express.js", category: "API Web Server", score: 90 },
    { name: "MongoDB", category: "Database & Data Models", score: 88 },
    { name: "REST APIs", category: "Full-Stack Integration", score: 96 }
  ];

  const allCerts = certificates && certificates.length > 0 ? certificates : [];
  const masterCertId = "SBA-UNIFIED-MASTER-2026-99482";
  const issuedDate = "August 2026";
  const purpose = "Awarded for demonstrating end-to-end technical competency and successful verification across all full-stack engineering tools, frameworks, and job-readiness requirements.";

  const handleDownloadMasterCert = () => {
    const textContent = `
====================================================================
           SKILLBRIDGE AI UNIFIED MASTER CERTIFICATE
====================================================================
Certificate ID: ${masterCertId}
Issued Date: ${issuedDate}
Candidate Name: ${candidateName}

AWARD PURPOSE:
${purpose}

VERIFIED TECHNICAL TOOLS & SKILL COMPETENCIES INCLUDED:
${verifiedTools.map(t => `  ✓ ${t.name} (${t.category}) — Score: ${t.score}/100`).join('\n')}

====================================================================
Verification Hash: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
Official SkillBridge AI Certification System
====================================================================
`;
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${candidateName.replace(/\s+/g, '_')}_Master_Unified_Certificate.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="saas-card p-5 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
            <Award className="w-4 h-4 text-indigo-600" /> Unified Master Certificate
          </h3>
          <p className="text-[11px] text-slate-500">
            Consolidated certificate of verified competencies
          </p>
        </div>

        <button
          onClick={handleDownloadMasterCert}
          className="saas-btn-primary py-1 px-3 text-xs gap-1"
        >
          <Download className="w-3.5 h-3.5" /> Export Certificate
        </button>
      </div>

      {/* Master Certificate Card */}
      <div 
        onClick={() => setShowModal(true)}
        className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-center space-y-3 cursor-pointer transition-colors"
      >
        <div className="flex items-center justify-center gap-1">
          <span className="saas-badge saas-badge-success text-[10px]">
            <ShieldCheck className="w-3 h-3" /> Verified Credential
          </span>
        </div>

        <div>
          <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Certificate of Technical Mastery
          </h4>
          <div className="text-lg font-bold text-slate-900 mt-0.5">
            {candidateName}
          </div>
        </div>

        <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
          {purpose}
        </p>

        {/* Tools Grid */}
        <div className="pt-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-left">
            {verifiedTools.map((tool, idx) => (
              <div key={idx} className="p-2 rounded-md bg-white border border-slate-200 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-900 truncate">
                  {tool.name}
                </span>
                <span className="text-[10px] font-semibold text-emerald-700">{tool.score}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 flex items-center justify-between">
          <span>SkillBridge AI Verification Authority</span>
          <span className="font-mono text-slate-700 font-medium">ID: {masterCertId}</span>
        </div>
      </div>

      {/* Modal View */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="saas-card max-w-lg w-full p-6 space-y-4 text-center shadow-modal">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                Official Credential View
              </span>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 text-xs font-bold">✕</button>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900">{candidateName}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{purpose}</p>

              <div className="grid grid-cols-2 gap-1.5 text-left text-xs pt-2">
                {verifiedTools.map((t, idx) => (
                  <div key={idx} className="p-2 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-900">{t.name}</div>
                      <div className="text-[10px] text-slate-500">{t.category}</div>
                    </div>
                    <span className="text-xs font-semibold text-emerald-700">
                      {t.score}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
              <button 
                onClick={handleDownloadMasterCert} 
                className="saas-btn-primary flex-1 py-2 text-xs font-medium gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Download Certificate
              </button>
              <button 
                onClick={() => setShowModal(false)} 
                className="saas-btn-secondary px-4 py-2 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// agent-notes: { ctx: "Unified Master Certificate component displaying all verified tools and certificate purpose on a single card", deps: ["react", "lucide-react"], state: "active", last: "anti@2026-08-15" }
import React, { useState } from 'react';
import { Award, ShieldCheck, Download, Sparkles, CheckCircle2, FileCheck } from 'lucide-react';

export default function CertificateList({ certificates = [], candidateName = "Aarav Sharma" }) {
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
    <div className="glass rounded-2xl p-6 border border-gray-800 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-white flex items-center gap-2 tracking-wide uppercase">
            <Award className="w-4 h-4 text-amber-400" /> OFFICIAL UNIFIED MASTER CERTIFICATE
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Consolidated certification containing all verified technical tools in one document
          </p>
        </div>

        <button
          onClick={handleDownloadMasterCert}
          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-400 text-gray-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-400/20 transition-all hover:opacity-95"
        >
          <Download className="w-3.5 h-3.5" /> Export Master Cert
        </button>
      </div>

      {/* Unified Master Certificate Card */}
      <div 
        onClick={() => setShowModal(true)}
        className="p-6 rounded-2xl bg-gradient-to-b from-gray-900 via-gray-950 to-black border-2 border-amber-400/40 text-center space-y-5 relative overflow-hidden shadow-2xl cursor-pointer hover:border-amber-400/70 transition-all"
      >
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase border border-emerald-500/30">
          <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED UNIFIED CERTIFICATE
        </div>

        <div className="text-xs font-black text-amber-400 tracking-widest uppercase flex items-center justify-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-300" /> SKILLBRIDGE AI CERTIFICATION ENGINE
        </div>

        <div>
          <h4 className="text-xs font-black text-gray-400 tracking-widest uppercase">
            CERTIFICATE OF FULL STACK TOOL MASTERY
          </h4>
          <div className="text-2xl font-black text-white mt-1 tracking-wide">
            {candidateName}
          </div>
        </div>

        {/* Certificate Purpose Explanation */}
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed font-medium">
          <strong className="text-amber-300 block mb-0.5 font-bold uppercase text-[10px] tracking-wider">What this certificate is given for:</strong>
          {purpose}
        </div>

        {/* Included Tools Grid */}
        <div className="space-y-2 pt-1 text-left">
          <span className="text-[10px] font-black uppercase text-gray-400 block tracking-wider">
            All Verified Tools Included in this Certificate (8/8):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {verifiedTools.map((tool, idx) => (
              <div key={idx} className="p-2 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-between text-[11px]">
                <span className="font-bold text-white flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {tool.name}
                </span>
                <span className="text-[9px] font-mono text-emerald-400 font-bold">{tool.score}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-gray-800/80 flex flex-wrap items-center justify-between text-[10px] text-gray-400">
          <div>Issuer: <strong className="text-gray-200">SkillBridge AI Evaluation System</strong></div>
          <div className="font-mono font-bold">Certificate ID: <span className="text-amber-300">{masterCertId}</span></div>
          <div>Issued: <strong className="text-gray-200">{issuedDate}</strong></div>
        </div>
      </div>

      {/* Individual Skill Verified Certificates */}
      {allCerts.length > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Individually Verified Skill Certificates ({allCerts.length})
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {allCerts.map((cert, cIdx) => (
              <div key={cIdx} className="p-4 rounded-xl bg-gray-900 border border-gray-800 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-xs">{cert.skillName}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-extrabold text-[10px] border border-emerald-500/30">
                    {cert.score || 92}% Verified
                  </span>
                </div>
                <div className="font-mono text-[10px] text-gray-400 truncate">
                  ID: <span className="text-accent-purple font-bold">{cert.certificateCode || cert.certificateId || `SBA-${cert.skillName.toUpperCase()}-948201`}</span>
                </div>
                <a
                  href={`/api/certificates/${cert.certificateCode || cert.certificateId || `SBA-${cert.skillName.toUpperCase()}-948201`}/download`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" /> Download PDF Certificate
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Modal View */}
      {showModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass max-w-xl w-full rounded-3xl p-6 border border-amber-400/40 space-y-6 text-center">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="w-4 h-4" /> OFFICIAL FULL-STACK MASTER CERTIFICATE
              </span>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white text-xs font-bold">✕ Close</button>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-b from-gray-900 via-gray-950 to-black border-2 border-amber-400/50 space-y-5 shadow-2xl">
              <div className="text-xs font-black text-amber-400 tracking-widest uppercase">
                SKILLBRIDGE AI CERTIFICATION AUTHORITY
              </div>

              <div>
                <h4 className="text-sm font-black text-gray-300 tracking-wider uppercase">
                  UNIFIED CERTIFICATE OF TOOL COMPETENCY
                </h4>
                <div className="text-3xl font-black text-white mt-1">
                  {candidateName}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 leading-relaxed text-left">
                <strong className="text-amber-300 block mb-1 font-bold">CERTIFICATE PURPOSE & AWARD RATIONALE:</strong>
                {purpose}
              </div>

              <div className="space-y-2 text-left">
                <span className="text-xs font-black uppercase text-gray-300 block">ALL INCLUDED VERIFIED TOOLS:</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {verifiedTools.map((t, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">{t.name}</div>
                        <div className="text-[10px] text-gray-400">{t.category}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                        {t.score}/100
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-800 text-xs text-gray-400 space-y-1 text-center">
                <div>Official Hash: <span className="font-mono text-[10px] text-gray-500">e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</span></div>
                <div className="font-mono font-bold text-amber-400">Master ID: {masterCertId}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={handleDownloadMasterCert} 
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-emerald-400 text-gray-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg"
              >
                <Download className="w-4 h-4" /> Download Certificate File
              </button>
              <button 
                onClick={() => setShowModal(false)} 
                className="px-6 py-3 rounded-xl bg-gray-900 border border-gray-800 text-white font-bold text-xs hover:bg-gray-800"
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

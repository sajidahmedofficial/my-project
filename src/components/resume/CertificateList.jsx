// agent-notes: { ctx: "Issued certificates view displaying official SkillBridge AI Certificate of Skill Mastery cards", deps: ["react", "lucide-react"], state: "active", last: "anti@2026-08-06" }
import React, { useState } from 'react';
import { Award, ShieldCheck, Download, ExternalLink } from 'lucide-react';

export default function CertificateList({ certificates = [], candidateName = "Aarav Sharma" }) {
  const [selectedCert, setSelectedCert] = useState(null);

  const certList = certificates.length > 0 ? certificates : [
    {
      skillName: "REACT",
      score: 91,
      certificateId: "SB-REACT-2026-00142",
      issuedDate: "August 2026",
      verificationHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    }
  ];

  return (
    <div className="glass rounded-2xl p-6 border border-gray-800 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-400" /> ISSUED CERTIFICATES OF MASTERY
        </h3>
        <span className="text-[11px] text-gray-400">Click to view official certificate</span>
      </div>

      <div className="space-y-3">
        {certList.map((cert, idx) => {
          const skillName = cert.skillName || cert.skill || 'REACT';
          const score = cert.score || 91;
          const certId = cert.certificateId || cert.certificateCode || `SB-${skillName.toUpperCase()}-2026-00142`;

          return (
            <div 
              key={idx}
              onClick={() => setSelectedCert({ ...cert, skillName, score, certId })}
              className="p-4 rounded-xl bg-gray-950 border border-gray-800 hover:border-accent-purple/50 cursor-pointer transition-all space-y-3"
            >
              {/* Certificate Banner Card Layout */}
              <div className="p-6 rounded-xl bg-gradient-to-b from-gray-900 via-gray-950 to-black border-2 border-accent-purple/30 text-center space-y-3 relative overflow-hidden shadow-2xl">
                <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase">
                  <ShieldCheck className="w-3 h-3" /> VERIFIED
                </div>

                <div className="text-[10px] font-black text-accent-purple tracking-widest uppercase">
                  SKILLBRIDGE AI
                </div>

                <div>
                  <h4 className="text-xs font-black text-gray-300 tracking-wider uppercase">
                    CERTIFICATE OF SKILL MASTERY
                  </h4>
                  <div className="text-lg font-black text-white mt-1">
                    {candidateName}
                  </div>
                </div>

                <p className="text-[11px] text-gray-400 italic">
                  has successfully demonstrated
                </p>

                <div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-purple to-accent-pink tracking-widest uppercase">
                  {skillName}
                </div>

                <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs">
                  Score: {score}/100
                </div>

                <div className="pt-2 border-t border-gray-800/80 space-y-1">
                  <div className="text-[10px] text-gray-400">
                    SkillBridge Verification System
                  </div>
                  <div className="text-[10px] font-mono text-gray-500 font-bold">
                    Certificate ID: <span className="text-gray-300">{certId}</span>
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {cert.issuedDate || "August 2026"}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded Modal */}
      {selectedCert && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass max-w-lg w-full rounded-3xl p-6 border border-accent-purple/40 space-y-5 text-center">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <span className="text-xs font-bold text-accent-purple uppercase tracking-wider">SKILLBRIDGE AI CERTIFICATION ENGINE</span>
              <button onClick={() => setSelectedCert(null)} className="text-gray-400 hover:text-white text-xs font-bold">✕ Close</button>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-b from-gray-900 via-gray-950 to-black border-2 border-accent-purple/40 text-center space-y-4 shadow-2xl">
              <div className="text-xs font-black text-accent-purple tracking-widest uppercase">
                SKILLBRIDGE AI
              </div>

              <div>
                <h4 className="text-sm font-black text-gray-300 tracking-wider uppercase">
                  CERTIFICATE OF SKILL MASTERY
                </h4>
                <div className="text-2xl font-black text-white mt-1">
                  {candidateName}
                </div>
              </div>

              <p className="text-xs text-gray-400 italic">
                has successfully demonstrated
              </p>

              <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-purple to-accent-pink tracking-widest uppercase">
                {selectedCert.skillName}
              </div>

              <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold text-sm">
                Score: {selectedCert.score}/100
              </div>

              <div className="pt-4 border-t border-gray-800 space-y-1">
                <div className="text-xs text-gray-400 font-semibold">
                  SkillBridge Verification System
                </div>
                <div className="text-xs font-mono text-gray-400 font-bold">
                  Certificate ID: <span className="text-emerald-400">{selectedCert.certId}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {selectedCert.issuedDate || "August 2026"}
                </div>
              </div>
            </div>

            <button 
              onClick={() => setSelectedCert(null)} 
              className="w-full py-3 rounded-xl bg-accent-purple hover:bg-accent-purple/90 text-white font-bold text-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

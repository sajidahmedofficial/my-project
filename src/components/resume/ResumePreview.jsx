// agent-notes: { ctx: "Resume preview modal component displaying updated resume content", deps: ["react", "lucide-react"], state: "active", last: "anti@2026-08-06" }
import React from 'react';
import { FileText, Download } from 'lucide-react';

export default function ResumePreview({ profile, skillsStatus = [], problems = [], onClose, onDownload }) {
  const gained = skillsStatus.filter(s => s.status === 'GAINED');
  const fixed = problems.filter(p => p.fixed);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass max-w-2xl w-full max-h-[85vh] overflow-y-auto rounded-2xl p-6 border border-gray-800 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent-purple" /> Auto-Generated Resume Preview
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-lg font-bold px-2">✕</button>
        </div>

        <div className="p-6 rounded-xl bg-gray-950 border border-gray-800 font-mono text-xs text-gray-300 space-y-4 whitespace-pre-wrap leading-relaxed">
          <div className="border-b border-gray-800 pb-3">
            <h2 className="text-base font-bold text-white">{profile?.name || 'Aarav Sharma'}</h2>
            <p className="text-gray-400">Target Role: Full Stack Developer</p>
          </div>

          <div>
            <h4 className="font-bold text-accent-purple uppercase mb-1">VERIFIED SKILLS:</h4>
            <p className="text-emerald-400">{gained.map(s => `[✓] ${s.name}`).join('  ')}</p>
          </div>

          <div>
            <h4 className="font-bold text-accent-purple uppercase mb-1">KEY ACHIEVEMENTS (AI FIXED):</h4>
            <ul className="list-disc pl-4 space-y-1 text-gray-300">
              {fixed.map(p => <li key={p.id}>{p.suggested}</li>)}
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-gray-900 text-gray-300 text-xs font-bold">Close</button>
          <button onClick={onDownload} className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5">
            <Download className="w-4 h-4" /> Download Resume
          </button>
        </div>
      </div>
    </div>
  );
}

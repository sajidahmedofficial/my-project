// agent-notes: { ctx: "ATS analysis summary component evaluating resume formatting warnings", deps: ["react", "lucide-react"], state: "active", last: "anti@2026-08-06" }
import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function ATSAnalysis({ warningsCount = 4, isFixed = false }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-900/60 border border-gray-800">
      <span className="text-xs font-semibold text-gray-300 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-accent-purple" /> ATS Problems
      </span>
      <span className="px-2.5 py-1 rounded bg-accent-purple/10 text-accent-purple text-xs font-bold">
        {isFixed ? '0 ATS Errors' : `${warningsCount} ATS Warnings`}
      </span>
    </div>
  );
}

// agent-notes: { ctx: "Clean minimal SaaS ATS analysis summary badge", deps: ["react", "lucide-react"], state: "active", last: "anti@2026-08-27" }
import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function ATSAnalysis({ warningsCount = 4, isFixed = false }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
      <span className="font-medium text-slate-700 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-indigo-600" /> ATS Status
      </span>
      <span className={`saas-badge text-xs ${isFixed ? 'saas-badge-success' : 'saas-badge-warning'}`}>
        {isFixed ? '0 ATS Errors' : `${warningsCount} ATS Warnings`}
      </span>
    </div>
  );
}

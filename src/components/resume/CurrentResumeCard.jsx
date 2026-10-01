// agent-notes: { ctx: "Current Resume view card showing active uploaded file details, score, and Replace Resume action", deps: ["react", "lucide-react"], state: "active", last: "anti@2026-10-01" }
import React, { useRef } from 'react';
import { FileText, CheckCircle2, RefreshCw, UploadCloud, Calendar, Award, Target, ExternalLink } from 'lucide-react';

export default function CurrentResumeCard({
  profile,
  selectedFile,
  apiResumeScore,
  onAnalyze,
  onReplaceFile,
  isAnalyzing,
  replaceError,
}) {
  const fileInputRef = useRef(null);

  const fileName = selectedFile?.name || profile?.resumeFileName || 'Uploaded_Resume.pdf';
  const score = apiResumeScore || profile?.scores?.resumeScore || 82;
  const uploadedDate = profile?.resumeUploadedAt || profile?.updatedAt
    ? new Date(profile?.resumeUploadedAt || profile?.updatedAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Active Synced';
  const skillsCount = (profile?.skills || []).length || 5;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onReplaceFile) {
      onReplaceFile(file);
    }
  };

  return (
    <div className="saas-card p-6 bg-white border border-slate-200/90 shadow-sm rounded-2xl space-y-5">
      {/* Header with status badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-xs">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
              Current Active Resume
            </span>
            <h3 className="text-base font-bold text-slate-900 truncate max-w-[280px] sm:max-w-md">
              {fileName}
            </h3>
            <div className="flex items-center gap-3 text-xs text-slate-500 pt-0.5">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Uploaded: {uploadedDate}
              </span>
              <span className="flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-indigo-500" />
                {profile?.careerGoal || 'Full Stack Developer'}
              </span>
            </div>
          </div>
        </div>

        <span className="saas-badge saas-badge-success text-xs px-2.5 py-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Synced</span>
        </span>
      </div>

      {/* Metric badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
          <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block">
            Resume Score
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-slate-900">{score}</span>
            <span className="text-xs text-slate-400 font-normal">/ 100</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
          <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block">
            Detected Skills
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-slate-900">{skillsCount}</span>
            <span className="text-xs text-slate-400 font-normal">Skills</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5 col-span-2 sm:col-span-1">
          <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block">
            Storage Location
          </span>
          <span className="text-xs font-semibold text-emerald-700 block truncate">
            Supabase Vault
          </span>
        </div>
      </div>

      {replaceError && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <span>{replaceError}</span>
        </div>
      )}

      {/* Explicit Actions: [Analyze Resume] & [Replace Resume] */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          Ready to re-score or update with a revised copy?
        </p>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="saas-btn-secondary px-4 py-2 text-xs font-semibold flex items-center gap-2 shadow-xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Resume'}</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalyzing}
            className="saas-btn-primary px-4 py-2 text-xs font-semibold flex items-center gap-2 shadow-sm transition"
          >
            <UploadCloud className="w-3.5 h-3.5 text-white" />
            <span>Replace Resume</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}

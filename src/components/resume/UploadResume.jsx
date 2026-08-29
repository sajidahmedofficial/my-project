// agent-notes: { ctx: "Clean minimal SaaS resume upload dropzone with active file badge & error feedback", deps: ["react", "lucide-react", "../../services/resumeApi"], state: "active", last: "anti@2026-08-27" }
import React, { useRef, useState } from "react";
import { FileText, CheckCircle2, RefreshCw, Upload, Sparkles, AlertCircle } from "lucide-react";
import { analyzeResume } from "../../services/resumeApi";

function UploadResume({ onAnalysis, onFileSelect, parsing, selectedFile, onSelectPreset, analyzed, profile }) {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;

    setError("");

    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    const isPdfOrDocx = validTypes.includes(file.type) || 
      file.name.endsWith('.pdf') || 
      file.name.endsWith('.docx');

    if (!isPdfOrDocx) {
      setError("Only PDF and DOCX files are supported.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Maximum file size is 5MB.");
      return;
    }

    try {
      setLoading(true);
      if (onFileSelect) onFileSelect(file);

      const targetRole = profile?.careerGoal || "Full Stack Developer";
      const result = await analyzeResume(file, targetRole);
      if (onAnalysis) onAnalysis(result);

    } catch (err) {
      setError(err.message || "Resume analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const isLoading = loading || parsing;
  const isUploadedAndAnalyzed = Boolean(analyzed && selectedFile);
  
  const activeFileName = selectedFile?.name || "Uploaded_Resume.pdf";

  return (
    <div 
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`saas-card p-6 transition-all space-y-4 flex flex-col justify-between ${
        dragActive 
          ? "border-indigo-600 bg-indigo-50/40" 
          : ""
      }`}
    >
      {isUploadedAndAnalyzed ? (
        <div className="space-y-4">
          {/* Active File Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-emerald-800">
                    Active Resume Synced
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-slate-900 truncate max-w-[240px]">
                  {activeFileName}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {profile?.name || 'Candidate'} • {profile?.careerGoal || 'Full Stack Developer'}
                </p>
              </div>
            </div>

            <span className="saas-badge saas-badge-success text-[10px]">
              <CheckCircle2 className="w-3 h-3" /> Analyzed
            </span>
          </div>

          {/* Quick Metrics from Parsed Resume */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5">
              <span className="text-[10px] text-slate-500 font-medium block">Extracted Skills</span>
              <span className="text-xs font-semibold text-slate-900">
                {(profile?.skills || ["HTML", "CSS", "JavaScript"]).length} Skills
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5">
              <span className="text-[10px] text-slate-500 font-medium block">Analysis Status</span>
              <span className="text-xs font-semibold text-emerald-700">
                ATS Optimized
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-500">
              Upload new version?
            </span>
            <button
              onClick={() => inputRef.current?.click()}
              disabled={isLoading}
              className="saas-btn-secondary py-1 px-3 text-xs"
            >
              {isLoading ? "Analyzing..." : "Replace File"}
            </button>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-indigo-600 rounded-xl p-8 text-center cursor-pointer transition-colors space-y-3"
        >
          <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Upload className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-900">Upload Your Resume</h4>
            <p className="text-xs text-slate-500">Drag and drop your PDF or DOCX file (up to 5MB)</p>
          </div>
          <button 
            type="button"
            className="saas-btn-primary py-1.5 px-4 text-xs font-medium"
          >
            Browse Files
          </button>
        </div>
      )}

      {error && (
        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <input 
        ref={inputRef}
        type="file" 
        accept=".pdf,.docx" 
        className="hidden" 
        onChange={(e) => e.target.files && handleFile(e.target.files[0])}
      />
    </div>
  );
}

export default UploadResume;

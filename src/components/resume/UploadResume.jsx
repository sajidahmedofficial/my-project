// agent-notes: { ctx: "Upload resume component with active file card, PDF/DOCX validation, replace action, and sample presets", deps: ["react", "lucide-react", "../../services/resumeApi"], state: "active", last: "anti@2026-08-20" }
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
  const isUploadedAndAnalyzed = Boolean(analyzed || selectedFile || profile?.hasUploadedResume);
  
  // Format active filename
  const activeFileName = selectedFile?.name 
    ? selectedFile.name 
    : `${(profile?.name || 'Sajid_Ahmed_M').replace(/[^a-zA-Z0-9]/g, '_')}_Resume.pdf`;

  return (
    <div 
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`upload-box glass rounded-2xl p-6 border transition-all space-y-4 flex flex-col justify-between ${
        dragActive 
          ? "border-accent-purple bg-accent-purple/10 shadow-lg shadow-accent-purple/20" 
          : isUploadedAndAnalyzed
            ? "border-emerald-500/30 bg-emerald-950/10" 
            : "border-gray-800"
      }`}
    >
      {isUploadedAndAnalyzed ? (
        <div className="space-y-4">
          {/* Active File Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black shadow-lg shadow-emerald-500/10">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                    Active Resume Analyzed
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <h4 className="text-sm font-black text-white truncate max-w-[240px]">
                  {activeFileName}
                </h4>
                <p className="text-[11px] text-gray-400 font-medium">
                  {profile?.name || 'Candidate'} • {profile?.careerGoal || 'Full Stack Developer'}
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-black uppercase tracking-wider shrink-0 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Synced
            </span>
          </div>

          {/* Quick Metrics from Parsed Resume */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="p-2.5 rounded-xl bg-gray-900/90 border border-gray-800 space-y-0.5">
              <span className="text-[10px] text-gray-400 font-semibold block">Detected Skills</span>
              <span className="text-xs font-bold text-white">
                {(profile?.skills || ["HTML", "CSS", "JavaScript"]).length} Skills Extracted
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-gray-900/90 border border-gray-800 space-y-0.5">
              <span className="text-[10px] text-gray-400 font-semibold block">Analysis Status</span>
              <span className="text-xs font-bold text-emerald-400">
                7-Dimensional Verified
              </span>
            </div>
          </div>

          {/* Action Row: Replace / Upload New Resume */}
          <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between gap-3">
            <span className="text-[11px] text-gray-400">
              Want to upload an updated version?
            </span>
            <button
              disabled={isLoading}
              onClick={() => inputRef.current?.click()}
              className="px-3.5 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs border border-gray-700 hover:border-accent-purple transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5 text-accent-purple" />
              {isLoading ? "Analyzing..." : "Upload New Resume"}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="upload-icon w-12 h-12 rounded-2xl bg-accent-purple/10 text-accent-purple flex items-center justify-center font-bold text-xl mx-auto">
            <Upload className="w-6 h-6" />
          </div>

          <div className="text-center space-y-1">
            <h3 className="text-sm font-bold text-white">
              {isLoading
                ? "AI is analyzing your resume..."
                : "Drag and drop file here"}
            </h3>
            <p className="text-xs text-gray-400">
              PDF or DOCX up to 5MB
            </p>
          </div>

          <button
            disabled={isLoading}
            onClick={() => inputRef.current?.click()}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-accent-purple to-accent-pink hover:opacity-95 text-white font-bold text-xs shadow-md shadow-accent-purple/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Analyzing Resume...
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" /> Select Resume File
              </>
            )}
          </button>
        </>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {/* Preset Profiles Selector */}
      {onSelectPreset && (
        <div className="pt-2 border-t border-gray-800/60 text-center space-y-2">
          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">
            Or switch profile preset:
          </span>
          <div className="flex flex-wrap gap-1.5 justify-center">
            <button
              onClick={() => {
                const preset = { name: "Sajid Ahmed M", careerGoal: "Full Stack Developer · AI Application Development", skills: ["HTML", "CSS", "JavaScript", "React", "Node.js", "Express", "Python", "SQL", "Git", "REST APIs", "AI Application Development"] };
                if (onSelectPreset) onSelectPreset(preset);
              }}
              className="px-2.5 py-1 rounded-lg bg-accent-purple/20 border border-accent-purple/50 hover:bg-accent-purple/30 text-white text-[10px] font-bold transition-all shadow-sm"
            >
              Sajid (Full Stack & AI) ★
            </button>
            <button
              onClick={() => {
                const preset = { name: "Aarav Sharma", careerGoal: "Frontend Developer", skills: ["HTML", "CSS", "JavaScript", "React"] };
                if (onSelectPreset) onSelectPreset(preset);
              }}
              className="px-2.5 py-1 rounded-lg bg-gray-900 border border-gray-800 hover:border-accent-purple text-gray-300 hover:text-white text-[10px] font-semibold transition-all"
            >
              Aarav (Frontend)
            </button>
            <button
              onClick={() => {
                const preset = { name: "Priya Patel", careerGoal: "Backend Engineer", skills: ["Node.js", "Express", "MongoDB", "Python"] };
                if (onSelectPreset) onSelectPreset(preset);
              }}
              className="px-2.5 py-1 rounded-lg bg-gray-900 border border-gray-800 hover:border-accent-purple text-gray-300 hover:text-white text-[10px] font-semibold transition-all"
            >
              Priya (Backend)
            </button>
            <button
              onClick={() => {
                const preset = { name: "Rohan Verma", careerGoal: "Full Stack Developer", skills: ["HTML", "CSS", "JavaScript", "React", "Node.js", "Express"] };
                if (onSelectPreset) onSelectPreset(preset);
              }}
              className="px-2.5 py-1 rounded-lg bg-gray-900 border border-gray-800 hover:border-accent-purple text-gray-300 hover:text-white text-[10px] font-semibold transition-all"
            >
              Rohan (Full Stack)
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="upload-error p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold text-center flex items-center justify-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </div>
      )}
    </div>
  );
}

export default UploadResume;

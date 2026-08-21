// agent-notes: { ctx: "Cartoon style resume upload dropzone with active file badges, preset buttons & animated feedback", deps: ["react", "lucide-react", "../../services/resumeApi"], state: "active", last: "anti@2026-08-21" }
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
  
  const activeFileName = selectedFile?.name 
    ? selectedFile.name 
    : `${(profile?.name || 'Sajid_Ahmed_M').replace(/[^a-zA-Z0-9]/g, '_')}_Resume.pdf`;

  return (
    <div 
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`cartoon-card p-6 border-2 transition-all space-y-4 flex flex-col justify-between select-none ${
        dragActive 
          ? "border-pink-400 bg-pink-950/20 shadow-2xl scale-102" 
          : isUploadedAndAnalyzed
            ? "border-emerald-500/40 bg-emerald-950/20" 
            : "border-purple-500/30"
      }`}
    >
      {isUploadedAndAnalyzed ? (
        <div className="space-y-4">
          {/* Active File Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white border-2 border-emerald-300/40 flex items-center justify-center font-black shadow-lg shadow-emerald-500/20">
                <FileText className="w-7 h-7" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                    Active Resume Synced
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <h4 className="text-sm font-black text-white truncate max-w-[240px]">
                  {activeFileName}
                </h4>
                <p className="text-xs text-gray-300 font-medium">
                  {profile?.name || 'Candidate'} • {profile?.careerGoal || 'Full Stack Developer'}
                </p>
              </div>
            </div>

            <span className="cartoon-badge cartoon-badge-mint">
              <CheckCircle2 className="w-3.5 h-3.5" /> Analyzed
            </span>
          </div>

          {/* Quick Metrics from Parsed Resume */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="p-3 rounded-2xl bg-[#13192b] border border-purple-500/20 space-y-0.5">
              <span className="text-[10px] text-gray-400 font-bold block">Detected Skills</span>
              <span className="text-xs font-black text-white">
                {(profile?.skills || ["HTML", "CSS", "JavaScript"]).length} Skills Extracted
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-[#13192b] border border-purple-500/20 space-y-0.5">
              <span className="text-[10px] text-gray-400 font-bold block">AI Audit Status</span>
              <span className="text-xs font-black text-emerald-400">
                7-Dimensional Verified
              </span>
            </div>
          </div>

          {/* Action Row: Replace / Upload New Resume */}
          <div className="pt-2 border-t-2 border-white/10 flex items-center justify-between gap-3">
            <span className="text-xs text-gray-400 font-medium">
              Want to upload a fresh PDF?
            </span>
            <button
              disabled={isLoading}
              onClick={() => inputRef.current?.click()}
              className="cartoon-btn cartoon-btn-purple py-2 px-4 text-xs font-bold gap-1.5 disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              {isLoading ? "Analyzing..." : "Upload New"}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center font-bold text-xl mx-auto shadow-lg shadow-purple-500/30 border-2 border-white/20">
            <Upload className="w-7 h-7" />
          </div>

          <div className="text-center space-y-1">
            <h3 className="text-sm font-black text-white">
              {isLoading
                ? "Sparky is analyzing your resume..."
                : "Drag & drop your resume here"}
            </h3>
            <p className="text-xs text-gray-400 font-medium">
              PDF or DOCX up to 5MB
            </p>
          </div>

          <button
            disabled={isLoading}
            onClick={() => inputRef.current?.click()}
            className="cartoon-btn cartoon-btn-purple w-full py-3 text-xs font-black gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing Resume...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" /> Choose Resume File
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
        <div className="pt-3 border-t-2 border-white/10 text-center space-y-2">
          <span className="text-[11px] uppercase tracking-wider text-purple-300 font-black block">
            ✨ Or load a demo student profile:
          </span>
          <div className="flex flex-wrap gap-1.5 justify-center">
            <button
              onClick={() => {
                const preset = { name: "Sajid Ahmed M", careerGoal: "Full Stack Developer · AI Application Development", skills: ["HTML", "CSS", "JavaScript", "React", "Node.js", "Express", "Python", "SQL", "Git", "REST APIs", "AI Application Development"] };
                if (onSelectPreset) onSelectPreset(preset);
              }}
              className="cartoon-badge cartoon-badge-purple hover:scale-105 transition-transform cursor-pointer"
            >
              Sajid (Full Stack AI) ★
            </button>
            <button
              onClick={() => {
                const preset = { name: "Aarav Sharma", careerGoal: "Frontend Developer", skills: ["HTML", "CSS", "JavaScript", "React"] };
                if (onSelectPreset) onSelectPreset(preset);
              }}
              className="cartoon-badge cartoon-badge-cyan hover:scale-105 transition-transform cursor-pointer"
            >
              Aarav (Frontend)
            </button>
            <button
              onClick={() => {
                const preset = { name: "Priya Patel", careerGoal: "Backend Engineer", skills: ["Node.js", "Express", "MongoDB", "Python"] };
                if (onSelectPreset) onSelectPreset(preset);
              }}
              className="cartoon-badge cartoon-badge-pink hover:scale-105 transition-transform cursor-pointer"
            >
              Priya (Backend)
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-2xl bg-rose-500/10 border-2 border-rose-500/30 text-rose-300 text-xs font-bold text-center flex items-center justify-center gap-1.5">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}
    </div>
  );
}

export default UploadResume;

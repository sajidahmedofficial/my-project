// agent-notes: { ctx: "Upload resume component with PDF/DOCX file validation and analyzeResume API call", deps: ["react", "../../services/resumeApi"], state: "active", last: "anti@2026-08-06" }
import React, { useRef, useState } from "react";
import { analyzeResume } from "../../services/resumeApi";

function UploadResume({ onAnalysis, onFileSelect, parsing, selectedFile, onSelectPreset }) {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

      const result = await analyzeResume(file, "Full Stack Developer");
      if (onAnalysis) onAnalysis(result);

    } catch (err) {
      setError(err.message || "Resume analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const [dragActive, setDragActive] = useState(false);

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

  return (
    <div 
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`upload-box glass rounded-2xl p-6 border transition-all space-y-4 flex flex-col justify-between ${
        dragActive 
          ? "border-accent-purple bg-accent-purple/10 shadow-lg shadow-accent-purple/20" 
          : selectedFile 
            ? "border-emerald-500/40 bg-emerald-500/5" 
            : "border-gray-800"
      }`}
    >
      {selectedFile ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-lg">
                ✓
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
                  Uploaded & Analyzed
                </span>
                <h4 className="text-xs font-bold text-white truncate max-w-[220px]">
                  {selectedFile.name}
                </h4>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
              AI Ready ✓
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-gray-900/80 border border-gray-800 flex items-center justify-between text-xs">
            <span className="text-gray-400 text-[11px]">
              Ready to replace or re-analyze?
            </span>
            <button
              disabled={isLoading}
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-bold text-[11px] border border-gray-700 transition-all"
            >
              {isLoading ? "Analyzing..." : "Change File"}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="upload-icon w-12 h-12 rounded-2xl bg-accent-purple/10 text-accent-purple flex items-center justify-center font-bold text-xl mx-auto">
            ↑
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
            className="w-full py-2.5 rounded-xl bg-accent-purple hover:bg-accent-purple/90 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
          >
            {isLoading
              ? "Analyzing..."
              : "Select File"}
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

      {onSelectPreset && (
        <div className="pt-2 border-t border-gray-800/60 text-center space-y-2">
          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">
            Or load a sample profile preset:
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
        <div className="upload-error p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold text-center">
          {error}
        </div>
      )}
    </div>
  );
}

export default UploadResume;

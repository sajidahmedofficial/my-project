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

  const isLoading = loading || parsing;

  return (
    <div className="upload-box glass rounded-2xl p-6 border border-gray-800 space-y-4 flex flex-col justify-between">
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

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <button
        disabled={isLoading}
        onClick={() => inputRef.current?.click()}
        className="w-full py-2.5 rounded-xl bg-accent-purple hover:bg-accent-purple/90 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
      >
        {isLoading
          ? "Analyzing..."
          : "Select File"}
      </button>

      {onSelectPreset && (
        <div className="pt-2 border-t border-gray-800/60 text-center space-y-2">
          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">
            Or load a sample profile preset:
          </span>
          <div className="flex flex-wrap gap-1.5 justify-center">
            <button
              onClick={() => onSelectPreset({ name: "Aarav Sharma", careerGoal: "Frontend Developer" })}
              className="px-2.5 py-1 rounded-lg bg-gray-900 border border-gray-800 hover:border-accent-purple text-gray-300 hover:text-white text-[10px] font-semibold transition-all"
            >
              Aarav (Frontend)
            </button>
            <button
              onClick={() => onSelectPreset({ name: "Priya Patel", careerGoal: "Backend Engineer" })}
              className="px-2.5 py-1 rounded-lg bg-gray-900 border border-gray-800 hover:border-accent-purple text-gray-300 hover:text-white text-[10px] font-semibold transition-all"
            >
              Priya (Backend)
            </button>
            <button
              onClick={() => onSelectPreset({ name: "Rohan Verma", careerGoal: "Full Stack Developer" })}
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

// agent-notes: { ctx: "Compact & modern 3-column Skill Gap matrix with status filters, micro-bars, and quick verify triggers", deps: ["react", "lucide-react"], state: "active", last: "anti@2026-08-20" }
import React, { useState } from "react";
import { CheckCircle2, Zap, Award, Layers } from "lucide-react";

function SkillGap({
  skills = [],
  skillsStatus = [],
  onOpenSkillBridge,
  onOpenVerification
}) {
  const [filter, setFilter] = useState("all");

  // Normalize skills data format
  const rawList = skills.length > 0 ? skills : skillsStatus;

  const normalizedSkills = rawList.length > 0 ? rawList.map(item => {
    if (typeof item === 'string') {
      return { skill: item, currentLevel: 100, status: 'GAINED' };
    }
    const skill = item.skill || item.name;
    let currentLevel = item.currentLevel ?? item.progress;
    let status = item.status;
    if (currentLevel === undefined) {
      currentLevel = status === 'GAINED' ? 100 : status === 'LEARNING' ? 60 : 0;
    }
    if (!status) {
      status = currentLevel >= 100 ? 'GAINED' : currentLevel > 0 ? 'LEARNING' : 'MISSING';
    }
    return { skill, currentLevel, status: status.toUpperCase() };
  }) : [];

  const gainedCount = normalizedSkills.filter(s => s.status === 'GAINED' || s.currentLevel >= 100).length;
  const learningCount = normalizedSkills.filter(s => s.status === 'LEARNING' || (s.currentLevel > 0 && s.currentLevel < 100)).length;
  const missingCount = normalizedSkills.filter(s => s.status === 'MISSING' || s.currentLevel === 0).length;

  const filteredSkills = normalizedSkills.filter(s => {
    if (filter === "gained") return s.status === 'GAINED' || s.currentLevel >= 100;
    if (filter === "learning") return s.status === 'LEARNING' || (s.currentLevel > 0 && s.currentLevel < 100);
    if (filter === "missing") return s.status === 'MISSING' || s.currentLevel === 0;
    return true;
  });

  return (
    <section className="skill-gap glass rounded-2xl p-5 border border-gray-800 space-y-4">
      {/* Header with Stats & Filter Chips */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-accent-purple/20 text-accent-purple flex items-center justify-center font-bold">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white tracking-wide flex items-center gap-2">
              Skill Gap & Competency Matrix
            </h2>
            <p className="text-[11px] text-gray-400">
              {gainedCount} of {normalizedSkills.length} target role skills verified
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              filter === "all"
                ? "bg-accent-purple text-white shadow-sm"
                : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            All ({normalizedSkills.length})
          </button>
          <button
            onClick={() => setFilter("gained")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              filter === "gained"
                ? "bg-emerald-500 text-white shadow-sm"
                : "bg-gray-900 border border-gray-800 text-emerald-400 hover:bg-emerald-500/10"
            }`}
          >
            ✓ Gained ({gainedCount})
          </button>
          {learningCount > 0 && (
            <button
              onClick={() => setFilter("learning")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                filter === "learning"
                  ? "bg-blue-500 text-white shadow-sm"
                  : "bg-gray-900 border border-gray-800 text-blue-400 hover:bg-blue-500/10"
              }`}
            >
              ◐ Learning ({learningCount})
            </button>
          )}
          {missingCount > 0 && (
            <button
              onClick={() => setFilter("missing")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                filter === "missing"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-gray-900 border border-gray-800 text-amber-400 hover:bg-amber-500/10"
              }`}
            >
              ✗ Missing ({missingCount})
            </button>
          )}
          {onOpenSkillBridge && (
            <button
              onClick={onOpenSkillBridge}
              className="px-3 py-1 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-700 text-white font-extrabold text-[11px] transition-all ml-auto sm:ml-2"
            >
              Open Skill Bridge ›
            </button>
          )}
        </div>
      </div>

      {/* Compact 2/3-Column Matrix Grid (No Excessive Scrolling) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {filteredSkills.map((item) => {
          const isGained = item.status === "GAINED" || item.currentLevel >= 100;
          const isLearning = item.status === "LEARNING" || (item.currentLevel > 0 && item.currentLevel < 100);

          return (
            <div
              key={item.skill}
              className={`p-3 rounded-xl border transition-all flex flex-col justify-between space-y-2 ${
                isGained
                  ? "bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/50"
                  : isLearning
                  ? "bg-blue-950/20 border-blue-500/30 hover:border-blue-500/50"
                  : "bg-gray-900/60 border-gray-800 hover:border-amber-500/40"
              }`}
            >
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`text-xs font-black shrink-0 ${
                    isGained ? "text-emerald-400" : isLearning ? "text-blue-400" : "text-amber-400"
                  }`}>
                    {isGained ? "✓" : isLearning ? "◐" : "✗"}
                  </span>
                  <h4 className="text-xs font-bold text-white truncate">{item.skill}</h4>
                </div>

                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shrink-0 ${
                    isGained
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : isLearning
                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  {isGained ? "GAINED" : isLearning ? "LEARNING" : "MISSING"}
                </span>
              </div>

              {/* Compact Progress Line */}
              <div className="space-y-1">
                <div className="w-full bg-gray-950 rounded-full h-1.5 overflow-hidden border border-gray-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isGained
                        ? "bg-emerald-400"
                        : isLearning
                        ? "bg-gradient-to-r from-blue-400 to-accent-purple"
                        : "bg-gray-800"
                    }`}
                    style={{ width: `${item.currentLevel}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-400 font-semibold">
                  <span>Score: {item.currentLevel}%</span>
                  {!isGained && onOpenVerification && (
                    <button
                      onClick={() => onOpenVerification(item.skill)}
                      className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-0.5"
                    >
                      <Zap className="w-2.5 h-2.5 fill-amber-400" /> Verify
                    </button>
                  )}
                  {isGained && (
                    <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Certified
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSkills.length === 0 && (
        <div className="p-8 text-center text-gray-500 text-xs italic bg-gray-900/30 rounded-xl border border-gray-800">
          No skills found under the selected filter.
        </div>
      )}
    </section>
  );
}

export default SkillGap;

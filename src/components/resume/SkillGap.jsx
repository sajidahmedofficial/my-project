// agent-notes: { ctx: "Clean minimal SaaS 3-column Skill Gap matrix with status filters & verify actions", deps: ["react", "lucide-react"], state: "active", last: "anti@2026-08-27" }
import React, { useState } from "react";
import { CheckCircle2, Zap, Award, Layers } from "lucide-react";

function SkillGap({
  skills = [],
  skillsStatus = [],
  onOpenSkillBridge,
  onOpenVerification
}) {
  const [filter, setFilter] = useState("all");

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
    <section className="saas-card p-5 space-y-4">
      {/* Header with Stats & Filter Chips */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Competency Matrix
            </h2>
            <p className="text-xs text-slate-500">
              {gainedCount} of {normalizedSkills.length} target role skills verified
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              filter === "all"
                ? "bg-slate-900 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            All ({normalizedSkills.length})
          </button>
          <button
            onClick={() => setFilter("gained")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              filter === "gained"
                ? "bg-slate-900 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            ✓ Gained ({gainedCount})
          </button>
          {learningCount > 0 && (
            <button
              onClick={() => setFilter("learning")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                filter === "learning"
                  ? "bg-slate-900 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              ◐ Learning ({learningCount})
            </button>
          )}
          {missingCount > 0 && (
            <button
              onClick={() => setFilter("missing")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                filter === "missing"
                  ? "bg-slate-900 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              ✗ Missing ({missingCount})
            </button>
          )}
        </div>
      </div>

      {/* Grid of Skill Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {filteredSkills.map((item) => {
          const isGained = item.status === "GAINED" || item.currentLevel >= 100;
          const isLearning = item.status === "LEARNING" || (item.currentLevel > 0 && item.currentLevel < 100);

          return (
            <div
              key={item.skill}
              className="p-3 rounded-lg border border-slate-200 bg-white flex flex-col justify-between space-y-2"
            >
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`text-xs font-semibold shrink-0 ${
                    isGained ? "text-emerald-600" : isLearning ? "text-amber-600" : "text-rose-600"
                  }`}>
                    {isGained ? "✓" : isLearning ? "◐" : "✗"}
                  </span>
                  <span className="text-xs font-medium text-slate-900 truncate">
                    {item.skill}
                  </span>
                </div>
                <span className={`saas-badge text-[10px] ${
                  isGained ? 'saas-badge-success' : isLearning ? 'saas-badge-warning' : 'saas-badge-danger'
                }`}>
                  {item.status}
                </span>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    isGained ? "bg-emerald-600" : isLearning ? "bg-amber-500" : "bg-slate-300"
                  }`} 
                  style={{ width: `${item.currentLevel}%` }} 
                />
              </div>

              {!isGained && onOpenVerification && (
                <button
                  onClick={() => onOpenVerification(item.skill)}
                  className="saas-btn-secondary py-0.5 px-2 text-[11px] w-full"
                >
                  Verify Skill
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default SkillGap;

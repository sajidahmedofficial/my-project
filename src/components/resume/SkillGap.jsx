// agent-notes: { ctx: "Skill Gap component connecting Resume Analyzer to Skill Bridge learning progress", deps: ["react"], state: "active", last: "anti@2026-08-06" }
import React from "react";

function SkillGap({
  skills = [],
  skillsStatus = [],
  onOpenSkillBridge
}) {
  // Normalize skills data format
  const rawList = skills.length > 0 ? skills : skillsStatus;

  const normalizedSkills = rawList.length > 0 ? rawList.map(item => {
    if (typeof item === 'string') {
      return { skill: item, currentLevel: 100 };
    }
    const skill = item.skill || item.name;
    let currentLevel = item.currentLevel ?? item.progress;
    if (currentLevel === undefined) {
      currentLevel = item.status === 'GAINED' ? 100 : item.status === 'LEARNING' ? 50 : 0;
    }
    return { skill, currentLevel };
  }) : [
    { skill: "HTML", currentLevel: 100 },
    { skill: "CSS", currentLevel: 100 },
    { skill: "JavaScript", currentLevel: 100 },
    { skill: "React", currentLevel: 75 },
    { skill: "Node.js", currentLevel: 40 },
    { skill: "MongoDB", currentLevel: 15 },
    { skill: "Docker", currentLevel: 0 },
    { skill: "AWS", currentLevel: 0 }
  ];

  return (
    <section className="skill-gap glass rounded-2xl p-6 border border-gray-800 space-y-6">
      <div className="section-heading flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
        <div>
          <h2 className="text-base font-bold text-white tracking-wide">
            Skill Gap Analysis
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Skills required for your target role
          </p>
        </div>

        <button
          onClick={onOpenSkillBridge}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-accent-purple to-accent-pink hover:opacity-95 text-white font-extrabold text-xs shadow-lg shadow-accent-purple/20 transition-all self-start sm:self-auto"
        >
          Open Skill Bridge ›
        </button>
      </div>

      <div className="skill-gap-list space-y-3">
        {normalizedSkills.map((item) => {
          const status =
            item.currentLevel >= 100
              ? "gained"
              : item.currentLevel > 0
              ? "learning"
              : "missing";

          return (
            <div
              className="skill-gap-row p-3.5 rounded-xl bg-gray-900/60 border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              key={item.skill}
            >
              <div className="skill-name flex items-center gap-2 text-xs font-bold text-white min-w-[140px]">
                <span className={
                  status === "gained" ? "text-emerald-400 font-black text-sm" :
                  status === "learning" ? "text-amber-400 font-black text-sm" : "text-gray-500 text-sm"
                }>
                  {status === "gained"
                    ? "✓"
                    : status === "learning"
                    ? "◐"
                    : "○"}
                </span>

                <span>{item.skill}</span>
              </div>

              <div className="skill-progress flex-1 flex items-center gap-3">
                <div className="progress-bar flex-1 bg-gray-950 rounded-full h-2 overflow-hidden border border-gray-800">
                  <div
                    className={`progress-fill h-full transition-all duration-500 ${
                      status === "gained" ? "bg-emerald-400" :
                      status === "learning" ? "bg-gradient-to-r from-accent-purple to-amber-400" : "bg-gray-800"
                    }`}
                    style={{
                      width: `${item.currentLevel}%`
                    }}
                  />
                </div>

                <span className="text-[11px] font-bold text-gray-400 w-9 text-right">
                  {item.currentLevel}%
                </span>
              </div>

              <div
                className={`skill-status px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider text-center w-24 ${
                  status === "gained"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : status === "learning"
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                }`}
              >
                {status === "gained"
                  ? "GAINED"
                  : status === "learning"
                  ? "LEARNING"
                  : "MISSING"}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default SkillGap;

// agent-notes: { ctx: "Playful cartoon multi-metric score cards with color-coded states (Green, Yellow, Red) and micro-interactions", deps: ["react"], state: "active", last: "anti@2026-08-21" }
import React from "react";

function ResumeScore({
  scores = {},
  resumeScore,
  atsScore,
  grammarScore,
  skillGapScore
}) {
  const safeScores = {
    overall: scores.overall ?? resumeScore ?? 68,
    ats: scores.ats ?? atsScore ?? 72,
    grammar: scores.grammar ?? grammarScore ?? 84,
    format: scores.format ?? 88,
    skills: scores.skills ?? skillGapScore ?? 47,
    projects: scores.projects ?? 75
  };

  const items = [
    { name: "Overall Score", value: safeScores.overall },
    { name: "ATS Match", value: safeScores.ats },
    { name: "Grammar & Verbs", value: safeScores.grammar },
    { name: "Format Quality", value: safeScores.format },
    { name: "Skills Match", value: safeScores.skills },
    { name: "Projects Impact", value: safeScores.projects }
  ];

  const getStatusBadge = (val) => {
    if (val >= 80) {
      return {
        label: "🟢 Excellent",
        color: "text-emerald-400 border-emerald-500/40 bg-emerald-950/30",
        valColor: "text-emerald-300"
      };
    }
    if (val >= 50) {
      return {
        label: "🟡 Needs Polish",
        color: "text-yellow-400 border-yellow-500/40 bg-yellow-950/30",
        valColor: "text-yellow-300"
      };
    }
    return {
      label: "🔴 Critical Gap",
      color: "text-rose-400 border-rose-500/40 bg-rose-950/30",
      valColor: "text-rose-300"
    };
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 select-none">
      {items.map((item) => {
        const status = getStatusBadge(item.value);
        return (
          <div
            key={item.name}
            className={`cartoon-card p-4 text-center space-y-1.5 border-2 hover:scale-105 transition-all ${status.color}`}
          >
            <div className={`text-2xl md:text-3xl font-black ${status.valColor}`}>
              {item.value}%
            </div>
            <div className="text-[11px] font-black text-gray-300 uppercase tracking-wider truncate">
              {item.name}
            </div>
            <div className="pt-1">
              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
                {status.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ResumeScore;

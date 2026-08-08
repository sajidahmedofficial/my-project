// agent-notes: { ctx: "Multi-metric resume score card grid displaying Overall, ATS, Grammar, Format, Skills, Projects", deps: ["react"], state: "active", last: "anti@2026-08-06" }
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
    ["Overall", safeScores.overall],
    ["ATS", safeScores.ats],
    ["Grammar", safeScores.grammar],
    ["Format", safeScores.format],
    ["Skills", safeScores.skills],
    ["Projects", safeScores.projects]
  ];

  return (
    <div className="score-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
      {items.map(([name, value]) => (
        <div
          className="score-card glass rounded-2xl p-4 border border-gray-800 text-center space-y-1 hover:border-accent-purple/40 transition-all"
          key={name}
        >
          <div className="score-value text-2xl md:text-3xl font-black text-emerald-400">
            {value}%
          </div>
          <div className="score-name text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            {name}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ResumeScore;

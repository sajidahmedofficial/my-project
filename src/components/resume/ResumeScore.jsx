// agent-notes: { ctx: "Clean minimal SaaS multi-metric score cards with neutral borders and status indicators", deps: ["react"], state: "active", last: "anti@2026-08-27" }
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
        label: "Optimal",
        badgeClass: "saas-badge-success"
      };
    }
    if (val >= 50) {
      return {
        label: "Needs Polish",
        badgeClass: "saas-badge-warning"
      };
    }
    return {
      label: "Gap Found",
      badgeClass: "saas-badge-danger"
    };
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {items.map((item) => {
        const status = getStatusBadge(item.value);
        return (
          <div
            key={item.name}
            className="saas-card p-3.5 text-center space-y-1"
          >
            <div className="text-xl sm:text-2xl font-bold text-slate-900">
              {item.value}%
            </div>
            <div className="text-[11px] font-medium text-slate-500 truncate">
              {item.name}
            </div>
            <div className="pt-0.5">
              <span className={`saas-badge text-[10px] ${status.badgeClass}`}>
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

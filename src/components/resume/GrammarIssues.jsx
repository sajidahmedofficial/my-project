// agent-notes: { ctx: "Grammar & Writing Issues component displaying original, problem, correction, and Apply Fix button", deps: ["react"], state: "active", last: "anti@2026-08-06" }
import React from "react";

function GrammarIssues({
  issues = [],
  issuesCount,
  isFixed,
  onApply
}) {
  const displayIssues = issues.length > 0 ? issues : (
    isFixed ? [] : [
      {
        severity: "medium",
        original: "Responsible for developing web applications using React.",
        problem: "Passive tone and weak action verb without quantifiable impact.",
        correction: "Developed responsive React applications improving user engagement by 35%."
      }
    ]
  );

  return (
    <section className="analysis-section glass rounded-2xl p-6 border border-gray-800 space-y-4">
      <h2 className="text-base font-bold text-white flex items-center justify-between">
        Grammar & Writing Issues
        {displayIssues.length > 0 && (
          <span className="text-xs px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 font-semibold">
            {displayIssues.length} Found
          </span>
        )}
      </h2>

      {displayIssues.length === 0 ? (
        <div className="success-box p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          ✓ No major grammar problems found.
        </div>
      ) : (
        <div className="space-y-4">
          {displayIssues.map((issue, index) => (
            <div
              className="problem-card p-4 rounded-xl bg-gray-900/80 border border-gray-800 space-y-2 hover:border-gray-700 transition-all"
              key={index}
            >
              <div className="problem-header flex items-center justify-between">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
                  {issue.severity || "medium"}
                </span>
                <strong className="text-xs text-gray-300">
                  Grammar Issue
                </strong>
              </div>

              <div className="text-xs">
                <b className="text-gray-400">Original:</b>
                <p className="text-gray-400 italic line-through mt-0.5">{issue.original}</p>
              </div>

              <div className="text-xs">
                <b className="text-gray-300">Problem:</b>
                <p className="text-gray-300 mt-0.5">{issue.problem}</p>
              </div>

              <div className="suggestion text-xs p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                <b className="text-emerald-400">Suggested:</b>
                <p className="text-emerald-300 font-medium mt-0.5">{issue.correction || issue.suggested}</p>
              </div>

              {onApply && (
                <button
                  onClick={() => onApply(issue)}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all"
                >
                  Apply Fix
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default GrammarIssues;

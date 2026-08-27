// agent-notes: { ctx: "Clean minimal SaaS Grammar & Writing Issues component", deps: ["react"], state: "active", last: "anti@2026-08-27" }
import React from "react";

function GrammarIssues({
  issues = [],
  issuesCount,
  isFixed,
  onApply
}) {
  const displayIssues = issues;

  return (
    <section className="saas-card p-5 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <h2 className="text-sm font-semibold text-slate-900">
          Grammar & Phrasing Improvements
        </h2>
        {displayIssues.length > 0 && (
          <span className="saas-badge saas-badge-warning text-xs">
            {displayIssues.length} Found
          </span>
        )}
      </div>

      {displayIssues.length === 0 ? (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
          ✓ No grammar or action verb deficiencies detected.
        </div>
      ) : (
        <div className="space-y-3">
          {displayIssues.map((issue, index) => (
            <div
              className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-2"
              key={index}
            >
              <div className="flex items-center justify-between">
                <span className="saas-badge text-[10px] uppercase">
                  {issue.severity || "medium"}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Style Improvement
                </span>
              </div>

              <div className="text-xs">
                <span className="font-semibold text-slate-700">Original:</span>
                <p className="text-slate-400 line-through mt-0.5">{issue.original}</p>
              </div>

              <div className="text-xs">
                <span className="font-semibold text-slate-700">Issue:</span>
                <p className="text-slate-600 mt-0.5">{issue.problem}</p>
              </div>

              <div className="text-xs p-2.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-900">
                <span className="font-semibold text-emerald-800">Suggested:</span>
                <p className="font-medium mt-0.5">{issue.correction || issue.suggested}</p>
              </div>

              {onApply && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => onApply(issue)}
                    className="saas-btn-primary py-1 px-3 text-xs"
                  >
                    Apply Correction
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default GrammarIssues;

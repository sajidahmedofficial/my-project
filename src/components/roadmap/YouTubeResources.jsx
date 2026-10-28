// agent-notes: { ctx: "Stage-wise YouTube learning resources component with video cards, watch button, and completion tracking", deps: ["lucide-react"], state: "active", last: "sato@2026-10-28" }
import React from 'react';
import { Youtube, ExternalLink, CheckCircle, Clock, Bookmark } from 'lucide-react';

export default function YouTubeResources({
  resources = [],
  _stageNumber = 1,
  completedTutorials = [],
  savedForLater = [],
  onToggleComplete,
  onToggleSave
}) {
  if (!resources || resources.length === 0) {
    return (
      <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
        No specific YouTube tutorials found for this stage. Search YouTube for latest courses.
      </div>
    );
  }

  return (
    <div className="space-y-3 pt-3 border-t border-slate-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <Youtube className="w-3.5 h-3.5" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              YouTube Learning Resources
              <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200">
                Verified Tutorials
              </span>
            </h5>
          </div>
        </div>
        <span className="text-[11px] text-slate-500">
          {resources.filter(r => completedTutorials.includes(r.id)).length} of {resources.length} completed
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {resources.map((res) => {
          const isDone = completedTutorials.includes(res.id);
          const isSaved = savedForLater.includes(res.id);

          return (
            <div
              key={res.id}
              className={`p-3.5 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                isDone 
                  ? 'bg-emerald-50/40 border-emerald-200 text-slate-500' 
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div className="space-y-2">
                {/* Header row: Channel & duration */}
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-semibold text-rose-600 truncate max-w-[140px] flex items-center gap-1">
                    <Youtube className="w-3 h-3 shrink-0" /> {res.channel}
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3 h-3" /> {res.duration}
                  </span>
                </div>

                {/* Title */}
                <h6 className={`text-xs font-semibold leading-snug line-clamp-2 ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                  {res.title}
                </h6>

                {/* Skills tags */}
                {res.skillsCovered && res.skillsCovered.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {res.skillsCovered.slice(0, 3).map((sk, idx) => (
                      <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {sk}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <a
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-medium transition-colors shadow-xs"
                >
                  <Youtube className="w-3 h-3" />
                  <span>Watch Tutorial</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                </a>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onToggleSave && onToggleSave(res.id)}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      isSaved ? 'bg-amber-50 border-amber-300 text-amber-600' : 'border-slate-200 text-slate-400 hover:text-slate-600'
                    }`}
                    title={isSaved ? "Saved for later" : "Save for later"}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onToggleComplete && onToggleComplete(res.id)}
                    className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium border transition-colors ${
                      isDone
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle className={`w-3.5 h-3.5 ${isDone ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{isDone ? 'Done' : 'Mark Done'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

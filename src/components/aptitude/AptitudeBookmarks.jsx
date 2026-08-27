// agent-notes: { ctx: "Clean minimal SaaS Bookmarked Aptitude Questions repository & practice module", deps: ["lucide-react"], state: "active", last: "anti@2026-08-27" }

import React from 'react';
import { BookmarkCheck, Trash2, Play, HelpCircle } from 'lucide-react';

export default function AptitudeBookmarks({ bookmarks = [], onPracticeBookmarks, onRemoveBookmark }) {
  return (
    <div className="space-y-6 animate-fade-in text-slate-900">
      <div className="saas-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="saas-badge saas-badge-indigo text-[10px]">
              <BookmarkCheck className="w-3 h-3" /> Bookmarks
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Saved Questions Repository
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Review and practice questions bookmarked during test sessions</p>
        </div>

        {bookmarks.length > 0 && (
          <button
            onClick={onPracticeBookmarks}
            className="saas-btn-primary py-2 px-4 text-xs font-medium gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Practice All Bookmarks ({bookmarks.length})
          </button>
        )}
      </div>

      {bookmarks.length === 0 ? (
        <div className="saas-card p-12 text-center space-y-2">
          <BookmarkCheck className="w-8 h-8 text-slate-400 mx-auto mb-1" />
          <h3 className="text-sm font-semibold text-slate-900">No Bookmarked Questions Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click the bookmark icon on any question during practice or test mode to save it here for targeted revision.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {bookmarks.map((bm, idx) => (
            <div key={idx} className="saas-card p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="saas-badge text-[10px]">{bm.topicName || 'General'}</span>
                <button
                  onClick={() => onRemoveBookmark(bm.id)}
                  className="text-slate-400 hover:text-rose-600 text-xs flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>

              <h4 className="text-xs font-medium text-slate-900 leading-relaxed">{bm.questionText || bm.question}</h4>

              {bm.explanation && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                  <span className="text-[10px] font-semibold uppercase text-indigo-600 flex items-center gap-1">
                    <HelpCircle className="w-3 h-3" /> Solution Hint
                  </span>
                  <p className="leading-relaxed">{bm.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

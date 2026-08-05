// agent-notes: { ctx: "Bookmarked Aptitude Questions repository & practice module", deps: ["lucide-react"], state: "active", last: "anti@2026-08-04" }

import React from 'react';
import { BookmarkCheck, Trash2, Play, HelpCircle } from 'lucide-react';

export default function AptitudeBookmarks({ bookmarks = [], onPracticeBookmarks, onRemoveBookmark }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass rounded-3xl p-6 border border-card-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookmarkCheck className="w-6 h-6 text-accent-pink" /> Saved Questions Repository
          </h2>
          <p className="text-xs text-gray-400 mt-1">Review and practice questions bookmarked during test sessions</p>
        </div>

        {bookmarks.length > 0 && (
          <button
            onClick={onPracticeBookmarks}
            className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-accent-purple to-accent-pink text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30"
          >
            <Play className="w-4 h-4 fill-current" /> Practice All Bookmarks ({bookmarks.length})
          </button>
        )}
      </div>

      {bookmarks.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center border border-gray-800 space-y-3">
          <BookmarkCheck className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Bookmarked Questions Yet</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Click the bookmark star icon on any question during practice or test mode to save it here for targeted revision.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarks.map((bm, idx) => (
            <div key={idx} className="glass rounded-2xl p-5 border border-gray-800 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-850 pb-2">
                <span className="text-[10px] font-bold text-accent-purple uppercase">{bm.topicName || 'General'}</span>
                <button
                  onClick={() => onRemoveBookmark(bm.id)}
                  className="text-gray-500 hover:text-red-400 text-xs flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>

              <h4 className="text-xs font-bold text-white leading-relaxed">{bm.questionText || bm.question}</h4>

              {bm.explanation && (
                <div className="p-3 rounded-xl bg-gray-950 border border-gray-850 text-xs text-gray-400 space-y-1">
                  <span className="text-[9px] font-bold uppercase text-accent-pink flex items-center gap-1">
                    <HelpCircle className="w-3 h-3" /> Solution Hint
                  </span>
                  <p>{bm.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

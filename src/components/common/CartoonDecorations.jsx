// agent-notes: { ctx: "Subtle floating cartoon decorative shapes, stars, sparkles, and clouds for background aesthetics", deps: ["react"], state: "active", last: "anti@2026-08-21" }
import React from 'react';

export default function CartoonDecorations() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Floating Sparkle Top-Left */}
      <div className="absolute top-12 left-10 text-purple-400 opacity-25 animate-float-gentle" style={{ animationDelay: '0s' }}>
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
        </svg>
      </div>

      {/* Floating Cloud Top-Right */}
      <div className="absolute top-20 right-24 text-sky-400 opacity-20 animate-float-gentle" style={{ animationDelay: '1.5s' }}>
        <svg className="w-16 h-10" viewBox="0 0 64 40" fill="currentColor">
          <path d="M16 32h36a12 12 0 0 0 0-24 16 16 0 0 0-30-4 12 12 0 0 0-6 28z" />
        </svg>
      </div>

      {/* Floating Star Mid-Right */}
      <div className="absolute top-1/2 right-12 text-yellow-300 opacity-20 animate-float-gentle" style={{ animationDelay: '2s' }}>
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
        </svg>
      </div>

      {/* Floating Blob Bottom-Left */}
      <div className="absolute bottom-20 left-16 text-pink-400 opacity-20 animate-float-gentle" style={{ animationDelay: '2.5s' }}>
        <svg className="w-12 h-12" viewBox="0 0 48 48" fill="currentColor">
          <path d="M24 4C14 4 6 12 6 22c0 14 12 22 22 22s14-8 14-18S34 4 24 4z" />
        </svg>
      </div>

      {/* Floating Sparkle Bottom-Right */}
      <div className="absolute bottom-12 right-1/4 text-mint-400 opacity-20 animate-float-gentle" style={{ animationDelay: '3s' }}>
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#34d399">
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
        </svg>
      </div>
    </div>
  );
}

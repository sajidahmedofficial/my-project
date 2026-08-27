// agent-notes: { ctx: "Subtle minimalist background grid/dot texture for clean SaaS aesthetics", deps: ["react"], state: "active", last: "anti@2026-08-27" }
import React from 'react';

export default function CartoonDecorations() {
  // Minimalist, subtle grid pattern for clean SaaS feel
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none opacity-40">
      <div 
        className="absolute inset-0" 
        style={{
          backgroundImage: `radial-gradient(#e2e8f0 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }} 
      />
    </div>
  );
}

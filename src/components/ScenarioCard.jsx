// agent-notes: { ctx: "Rolemint screenplay scenario card with difficulty badge and instant rehearse CTA", deps: [], state: "active", last: "anti@2026-08-29" }

import React from 'react';

export default function ScenarioCard({ scenario, onStart, starting, onDelete }) {
  return (
    <div className="card scenario-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className={`badge difficulty-${scenario.difficulty}`}>
          {scenario.category} · {scenario.difficulty}
        </span>
        {!scenario.is_system && onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(scenario.id);
            }}
            style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '12px', cursor: 'pointer' }}
            title="Delete custom scene"
          >
            ✕
          </button>
        )}
      </div>

      <h3>{scenario.title}</h3>
      <p>{scenario.objective}</p>
      
      <button
        className="btn btn-primary btn-block"
        disabled={starting}
        onClick={() => onStart(scenario.id)}
      >
        {starting ? 'Setting the scene…' : 'Rehearse this scene'}
      </button>
    </div>
  );
}

import { useNavigate } from 'react-router-dom';

export default function ScenarioCard({ scenario, onStart, starting }) {
  return (
    <div className="card scenario-card">
      <span className={`badge difficulty-${scenario.difficulty}`}>
        {scenario.category} · {scenario.difficulty}
      </span>
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

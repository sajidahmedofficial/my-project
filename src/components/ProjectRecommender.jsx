// agent-notes: { ctx: "Clean minimal SaaS Project Recommender with match metrics, expandable guidelines & tech stack tags", deps: ["lucide-react", "../utils/mockData"], state: "active", last: "anti@2026-08-27" }
import React, { useState, useMemo } from 'react';
import { 
  Code, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  FolderGit2, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { PROJECT_RECOMMENDATIONS } from '../utils/mockData';

export default function ProjectRecommender({ profile }) {
  const [expandedIndex, setExpandedIndex] = useState(-1);

  const scoredRecommendations = useMemo(() => {
    return PROJECT_RECOMMENDATIONS.map(project => {
      const matchCount = project.tags.filter(tag => 
        (profile?.skills || []).some(s => s.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes(s.toLowerCase()))
      ).length;
      
      return {
        ...project,
        matchCount
      };
    }).sort((a, b) => b.matchCount - a.matchCount);
  }, [profile]);

  return (
    <div className="space-y-6 text-slate-900 pb-12">
      {/* Header Banner */}
      <div className="saas-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-indigo-600" />
            <h1 className="text-lg font-bold text-slate-900">Recommended Capstone Projects</h1>
          </div>
          <p className="text-xs text-slate-500">
            Expand your portfolio with structured capstone architectures tailored to your current technical skills
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scoredRecommendations.map((proj, idx) => {
          const isExpanded = expandedIndex === idx;
          const matchedTagsCount = proj.matchCount;
          
          return (
            <div 
              key={idx} 
              className="saas-card p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className={`saas-badge text-[10px] ${
                      proj.difficulty === 'Hard' 
                        ? 'saas-badge-danger' 
                        : proj.difficulty === 'Medium' 
                        ? 'saas-badge-warning' 
                        : 'saas-badge-success'
                    }`}>
                      {proj.difficulty}
                    </span>
                    <h3 className="text-sm font-semibold text-slate-900">{proj.title}</h3>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 border border-slate-200 px-2 py-1 rounded-md shrink-0">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> {proj.timeEstimate}
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">{proj.description}</p>

                {/* Tech tags */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Technology Stack</span>
                  <div className="flex flex-wrap gap-1">
                    {proj.tags.map((tag, tIdx) => {
                      const isMatched = (profile?.skills || []).some(s => s.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes(s.toLowerCase()));
                      return (
                        <span 
                          key={tIdx} 
                          className={`saas-badge text-[11px] ${
                            isMatched ? 'saas-badge-indigo' : ''
                          }`}
                        >
                          {tag}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Match indicator alert */}
                {matchedTagsCount > 0 && (
                  <div className="text-xs text-emerald-800 flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/80 p-2 rounded-lg">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Matches <strong className="font-semibold">{matchedTagsCount}</strong> skills in your profile</span>
                  </div>
                )}

                {/* Expanded guide */}
                {isExpanded && (
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    {/* Key features */}
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-semibold uppercase text-slate-900 tracking-wider">Required Features</h4>
                      <ul className="space-y-1">
                        {proj.features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-1.5 text-xs text-slate-600">
                            <span className="text-slate-400">•</span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Step guidelines */}
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-semibold uppercase text-slate-900 tracking-wider">Implementation Steps</h4>
                      <div className="space-y-1">
                        {proj.guidelines.map((guide, gIdx) => (
                          <div key={gIdx} className="flex gap-2 text-xs text-slate-600">
                            <span className="font-semibold text-slate-900 shrink-0">{gIdx + 1}.</span>
                            <p>{guide}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button 
                onClick={() => setExpandedIndex(isExpanded ? -1 : idx)}
                className="saas-btn-secondary w-full py-1.5 text-xs font-medium gap-1.5 mt-2"
              >
                <span>{isExpanded ? "Hide Details" : "View Implementation Guide"}</span>
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

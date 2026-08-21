// agent-notes: { ctx: "Playful cartoon Project Recommender with 3D difficulty pills, interactive expandable steps & tech stack badges", deps: ["lucide-react", "../utils/mockData"], state: "active", last: "anti@2026-08-21" }
import React, { useState, useMemo } from 'react';
import { 
  Code, 
  Clock, 
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  FolderGit2,
  CheckCircle2
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
    <div className="space-y-6 animate-fade-in select-none">
      {/* Header Banner */}
      <div className="cartoon-card p-6 md:p-8 border-2 border-purple-500/30 relative overflow-hidden bg-gradient-to-r from-[#171d33] via-[#1c243f] to-[#1a2138]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="cartoon-badge cartoon-badge-pink mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Project Portfolio Lab
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
              <FolderGit2 className="w-8 h-8 text-cyan-400" />
              <span>Recommended Capstone Projects</span>
            </h1>
            <p className="text-gray-300 text-xs mt-1 font-medium">
              Expand your portfolio with custom project structures ranked by compatibility with your current technical skills!
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scoredRecommendations.map((proj, idx) => {
          const isExpanded = expandedIndex === idx;
          const matchedTagsCount = proj.matchCount;
          
          return (
            <div 
              key={idx} 
              className={`cartoon-card p-6 border-2 transition-all flex flex-col justify-between ${
                isExpanded ? 'border-purple-400 shadow-xl' : 'border-purple-500/20 hover:border-purple-500/50'
              }`}
            >
              <div className="space-y-4">
                {/* Header info */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <span className={`cartoon-badge text-[10px] ${
                      proj.difficulty === 'Hard' 
                        ? 'cartoon-badge-orange' 
                        : proj.difficulty === 'Medium' 
                        ? 'cartoon-badge-yellow' 
                        : 'cartoon-badge-mint'
                    }`}>
                      {proj.difficulty}
                    </span>
                    <h3 className="text-base font-black text-white leading-snug">{proj.title}</h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-300 bg-[#0d1220] border border-white/10 px-3 py-1.5 rounded-xl shrink-0">
                    <Clock className="w-3.5 h-3.5 text-purple-400" /> {proj.timeEstimate}
                  </div>
                </div>

                <p className="text-xs text-gray-300 font-medium leading-relaxed">{proj.description}</p>

                {/* Tech tags */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-black text-purple-300 block">Technology Stack</span>
                  <div className="flex flex-wrap gap-1.5">
                    {proj.tags.map((tag, tIdx) => {
                      const isMatched = (profile?.skills || []).some(s => s.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes(s.toLowerCase()));
                      return (
                        <span 
                          key={tIdx} 
                          className={`cartoon-badge text-[10px] ${
                            isMatched 
                              ? 'cartoon-badge-purple' 
                              : 'bg-[#0d1220] text-gray-400 border-white/10'
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
                  <div className="text-xs text-emerald-300 font-bold flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-500/30 p-2.5 rounded-xl">
                    <Zap className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                    Matches <strong className="text-white">{matchedTagsCount}</strong> of your verified profile skills.
                  </div>
                )}

                {/* Expanded guide */}
                {isExpanded && (
                  <div className="pt-4 border-t-2 border-white/10 space-y-4 animate-fade-in">
                    {/* Key features */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-black uppercase text-pink-300 tracking-wider">Required Key Features</h4>
                      <ul className="space-y-1.5">
                        {proj.features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-2 text-xs text-gray-200 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-pink-400 mt-1.5 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Step guidelines */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-black uppercase text-cyan-300 tracking-wider">Step-by-step Guidelines</h4>
                      <div className="space-y-2">
                        {proj.guidelines.map((guide, gIdx) => (
                          <div key={gIdx} className="flex gap-2 text-xs text-gray-200 font-medium">
                            <span className="font-black text-purple-400 shrink-0">{gIdx + 1}.</span>
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
                className="mt-5 cartoon-btn cartoon-btn-dark w-full py-2.5 text-xs font-bold gap-1.5"
              >
                {isExpanded ? (
                  <>
                    <span>Hide Implementation Guide</span> <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>View Implementation Guide</span> <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

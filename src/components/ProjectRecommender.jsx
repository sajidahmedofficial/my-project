import React from 'react';
import { 
  Code, 
  Clock, 
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { PROJECT_RECOMMENDATIONS } from '../utils/mockData';

export default function ProjectRecommender({ profile }) {
  const [expandedIndex, setExpandedIndex] = React.useState(-1);

  // Filter or score recommendations based on user skills
  // Let's sort projects so that projects that match most profile skills appear first
  const scoredRecommendations = React.useMemo(() => {
    return PROJECT_RECOMMENDATIONS.map(project => {
      // Calculate how many tags match user skills
      const matchCount = project.tags.filter(tag => 
        profile.skills.some(s => s.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes(s.toLowerCase()))
      ).length;
      
      return {
        ...project,
        matchCount
      };
    }).sort((a, b) => b.matchCount - a.matchCount);
  }, [profile]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Code className="w-5 h-5 text-accent-purple" /> AI Project Recommendations
        </h2>
        <p className="text-xs text-gray-400">Expand your portfolio with custom project structures ranked by compatibility with your current technical skills</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scoredRecommendations.map((proj, idx) => {
          const isExpanded = expandedIndex === idx;
          const matchedTagsCount = proj.matchCount;
          
          return (
            <div 
              key={idx} 
              className={`glass rounded-2xl p-5 border transition-all flex flex-col justify-between ${isExpanded ? 'border-accent-purple/30 bg-accent-purple/5' : 'border-gray-800 hover:border-gray-700'}`}
            >
              <div className="space-y-4">
                {/* Header info */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${proj.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : proj.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                      {proj.difficulty}
                    </span>
                    <h3 className="text-sm font-semibold text-white mt-1.5 leading-relaxed">{proj.title}</h3>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 bg-gray-800/80 px-2 py-1 rounded shrink-0">
                    <Clock className="w-3.5 h-3.5" /> {proj.timeEstimate}
                  </div>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">{proj.description}</p>

                {/* Tech tags */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-gray-500 block">Technology Stack</span>
                  <div className="flex flex-wrap gap-1.5">
                    {proj.tags.map((tag, tIdx) => {
                      const isMatched = profile.skills.some(s => s.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes(s.toLowerCase()));
                      return (
                        <span 
                          key={tIdx} 
                          className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${isMatched ? 'bg-accent-purple/15 text-accent-purple border-accent-purple/30' : 'bg-gray-850 text-gray-400 border-gray-800'}`}
                        >
                          {tag}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Match indicator alert */}
                {matchedTagsCount > 0 && (
                  <div className="text-[10px] text-accent-emerald flex items-center gap-1 bg-accent-emerald/5 border border-accent-emerald/10 px-2 py-1 rounded">
                    Matches <span className="font-bold">{matchedTagsCount}</span> of your profile skills.
                  </div>
                )}

                {/* Expanded guide */}
                {isExpanded && (
                  <div className="pt-4 border-t border-gray-850 space-y-4 animate-fade-in">
                    {/* Key features */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Required Features</h4>
                      <ul className="space-y-1.5">
                        {proj.features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-1.5 text-xs text-gray-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-pink mt-1.5 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Step guidelines */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Step-by-step Guidelines</h4>
                      <div className="space-y-2">
                        {proj.guidelines.map((guide, gIdx) => (
                          <div key={gIdx} className="flex gap-2 text-xs text-gray-300">
                            <span className="font-bold text-accent-purple shrink-0">{gIdx + 1}.</span>
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
                className="mt-5 w-full text-center text-xs font-semibold py-2 rounded-lg bg-gray-800 hover:bg-gray-700 hover:text-white border border-gray-700 text-gray-300 transition-colors flex items-center justify-center gap-1"
              >
                {isExpanded ? (
                  <>
                    Hide Guide <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Show Implementation Guide <ChevronDown className="w-4 h-4" />
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

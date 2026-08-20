// agent-notes: { ctx: "Personalized Learning Roadmap component with backend API integration, persistent checked topics, and explicit LOADING/SUCCESS/EMPTY/ERROR states", deps: ["react", "lucide-react", "../services/skillGapApi"], state: "active", last: "anti@2026-08-20" }
import React, { useState, useEffect } from 'react';
import { 
  Map, 
  BookOpen, 
  ExternalLink, 
  CheckCircle2, 
  HelpCircle,
  Award,
  Zap,
  Code2,
  FolderGit2,
  Layers,
  RefreshCw,
  AlertCircle,
  FolderOpen
} from 'lucide-react';
import { skillGapApi } from '../services/skillGapApi';

export default function LearningRoadmap({ profile, missingSkillsList = [], targetRole, onOpenVerification, onNavigate }) {
  const activeTargetRole = targetRole || profile?.careerGoal || "Frontend Developer";

  // State: 'LOADING' | 'SUCCESS' | 'EMPTY' | 'ERROR'
  const [status, setStatus] = useState('LOADING');
  const [roadmap, setRoadmap] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [expandedWeek, setExpandedWeek] = useState(0);

  // Restore checked topics from localStorage
  const [checkedTopics, setCheckedTopics] = useState(() => {
    try {
      const saved = localStorage.getItem('sb_checked_roadmap_topics');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const loadRoadmap = async () => {
    // If no missing skills are provided from profile or props
    const targetSkills = (missingSkillsList && missingSkillsList.length > 0)
      ? missingSkillsList
      : (profile?.skills?.length ? [] : []);

    if (!targetSkills.length && (!missingSkillsList || !missingSkillsList.length)) {
      // Check if user has missing skills from profile
      setStatus('EMPTY');
      return;
    }

    setStatus('LOADING');
    setErrorMessage(null);

    try {
      const primarySkill = targetSkills[0] || "Core Skills";
      const res = await skillGapApi.generateRoadmap({
        skillName: primarySkill,
        targetRole: activeTargetRole,
        userId: profile?.id || profile?.email || "guest_user"
      });

      if (res && res.roadmap && res.roadmap.stages) {
        // Convert API stages into weekly view format
        const formattedRoadmap = res.roadmap.stages.map((stage, idx) => ({
          id: `stage-${stage.stageNumber || idx + 1}`,
          week: `Stage ${stage.stageNumber || idx + 1}`,
          title: stage.title || `Stage ${stage.stageNumber || idx + 1}`,
          level: stage.level || (idx === 0 ? "Beginner" : idx === 1 ? "Intermediate" : "Advanced"),
          topics: stage.topics || [],
          practiceTasks: stage.practiceTasks || [],
          recommendedProject: stage.miniProject ? {
            title: stage.miniProject,
            description: `Hands-on practical implementation of ${stage.title || primarySkill}.`
          } : null,
          assessment: {
            mcqCount: 5,
            codingCount: 1,
            passingThreshold: 75
          }
        }));

        setRoadmap(formattedRoadmap);
        setStatus('SUCCESS');
        setExpandedWeek(0);
      } else {
        setStatus('EMPTY');
      }
    } catch (err) {
      console.error("Roadmap generation error:", err);
      setErrorMessage(err.message || "Unable to generate learning roadmap.");
      setStatus('ERROR');
    }
  };

  useEffect(() => {
    loadRoadmap();
  }, [missingSkillsList, activeTargetRole]);

  const handleToggleTopic = (stageId, topicIdx) => {
    const key = `${stageId}-${topicIdx}`;
    setCheckedTopics(prev => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('sb_checked_roadmap_topics', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const getWeekProgress = (week) => {
    const topics = week.topics || [];
    if (!topics.length) return 0;
    const checkedCount = topics.filter((_, idx) => checkedTopics[`${week.id}-${idx}`]).length;
    return Math.round((checkedCount / topics.length) * 100);
  };

  const getOverallProgress = () => {
    const totalTopics = roadmap.reduce((acc, w) => acc + (w.topics?.length || 0), 0);
    if (!totalTopics) return 0;
    const checkedCount = Object.values(checkedTopics).filter(Boolean).length;
    return Math.min(100, Math.round((checkedCount / totalTopics) * 100));
  };

  return (
    <div className="space-y-6 animate-fade-in text-white pb-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Map className="w-5 h-5 text-accent-purple" /> Personalized Learning Roadmap
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-accent-purple/20 text-accent-purple text-xs font-bold border border-accent-purple/30">
              Target: {activeTargetRole}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Step-by-step curriculum generated by AI for {activeTargetRole} skills
          </p>
        </div>

        {status === 'SUCCESS' && roadmap.length > 0 && (
          <div className="glass rounded-xl px-4 py-2 flex items-center gap-3 shrink-0 self-start md:self-center border border-accent-purple/20">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Progress</span>
              <span className="text-sm font-extrabold text-white">{getOverallProgress()}%</span>
            </div>
            <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-accent-purple to-accent-pink transition-all duration-500" 
                style={{ width: `${getOverallProgress()}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 1. LOADING STATE */}
      {status === 'LOADING' && (
        <div className="glass rounded-2xl p-16 border border-gray-800 text-center space-y-4 flex flex-col items-center justify-center min-h-[340px]">
          <RefreshCw className="w-8 h-8 text-accent-purple animate-spin" />
          <div className="space-y-1">
            <h4 className="text-base font-bold text-white">Generating Personalized Roadmap...</h4>
            <p className="text-xs text-gray-400">Structuring beginner, intermediate, and advanced learning stages with AI...</p>
          </div>
        </div>
      )}

      {/* 2. ERROR STATE */}
      {status === 'ERROR' && (
        <div className="glass rounded-2xl p-12 border border-rose-500/30 bg-rose-950/10 text-center space-y-4 flex flex-col items-center justify-center min-h-[300px]">
          <AlertCircle className="w-10 h-10 text-rose-400" />
          <div className="space-y-1">
            <h4 className="text-base font-bold text-white">Unable to generate learning roadmap.</h4>
            <p className="text-xs text-rose-300 max-w-md mx-auto">{errorMessage || "Roadmap service encountered an issue. Please retry."}</p>
          </div>
          <button
            onClick={loadRoadmap}
            className="px-4 py-2 rounded-xl bg-accent-purple text-white text-xs font-bold shadow-md hover:bg-accent-purple/90 transition-all flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry Generation
          </button>
        </div>
      )}

      {/* 3. EMPTY STATE */}
      {status === 'EMPTY' && (
        <div className="glass rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4 border border-gray-800 min-h-[300px]">
          <FolderOpen className="w-10 h-10 text-gray-500" />
          <div className="space-y-1">
            <h4 className="text-base font-bold text-white">No Roadmap Available Yet</h4>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Run a Skill Gap analysis to identify missing skills, then click "Start Roadmap" to generate your custom learning path.
            </p>
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate('skillgap')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-accent-purple to-accent-pink text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" /> Go to Skill Gap Hub
            </button>
          )}
        </div>
      )}

      {/* 4. SUCCESS STATE: REAL ROADMAP ACCORDION */}
      {status === 'SUCCESS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline navigation (Left) */}
          <div className="space-y-3 lg:col-span-2">
            {roadmap.map((week, index) => {
              const isExpanded = expandedWeek === index;
              const progress = getWeekProgress(week);
              const levelColor = week.level === "Advanced" ? "bg-purple-500/20 text-purple-300 border-purple-500/30" : week.level === "Intermediate" ? "bg-blue-500/20 text-blue-300 border-blue-500/30" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
              
              return (
                <div 
                  key={week.id} 
                  className={`glass rounded-xl transition-all border overflow-hidden ${isExpanded ? 'border-accent-purple/40 shadow-lg shadow-accent-purple/5' : 'border-gray-800 hover:border-gray-700'}`}
                >
                  {/* Accordion header */}
                  <button 
                    onClick={() => setExpandedWeek(isExpanded ? -1 : index)}
                    className="w-full text-left p-4 flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-accent-purple tracking-wider">{week.week}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${levelColor}`}>
                          {week.level || 'Beginner'}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-white truncate leading-relaxed">{week.title}</h4>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0">
                      {progress === 100 ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded bg-gray-800 text-gray-300 border border-gray-700">{progress}%</span>
                      )}
                    </div>
                  </button>

                  {/* Accordion contents */}
                  {isExpanded && (
                    <div className="px-4 pb-5 pt-1 border-t border-gray-800/50 space-y-4">
                      {/* Checkbox tasks */}
                      <div className="space-y-2">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider mb-2">1. Topics to Learn ({week.level || 'Beginner'})</span>
                        {week.topics.map((topic, tIdx) => {
                          const topicKey = `${week.id}-${tIdx}`;
                          const isChecked = checkedTopics[topicKey];
                          
                          return (
                            <label 
                              key={tIdx} 
                              className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${isChecked ? 'bg-emerald-500/10 border-emerald-500/30 text-gray-300' : 'bg-gray-900/50 border-gray-800 text-gray-200 hover:bg-gray-900'}`}
                            >
                              <input 
                                type="checkbox" 
                                checked={!!isChecked} 
                                onChange={() => handleToggleTopic(week.id, tIdx)}
                                className="mt-0.5 w-4 h-4 rounded border-gray-700 bg-gray-950 text-accent-purple focus:ring-accent-purple" 
                              />
                              <div className="space-y-0.5 overflow-hidden">
                                <span className={`text-xs block ${isChecked ? 'line-through text-gray-400' : 'font-medium'}`}>{topic}</span>
                              </div>
                            </label>
                          );
                        })}
                      </div>

                      {/* Practical Exercises */}
                      {week.practiceTasks && week.practiceTasks.length > 0 && (
                        <div className="space-y-2 pt-2">
                          <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">2. Practical Practice Tasks</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {week.practiceTasks.map((task, pIdx) => (
                              <div key={pIdx} className="p-2.5 rounded-lg bg-gray-900/80 border border-gray-800 text-[11px] text-gray-300 flex items-start gap-2">
                                <Code2 className="w-3.5 h-3.5 text-accent-purple shrink-0 mt-0.5" />
                                <span>{task}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right sidebar: Project recommendations & verification */}
          <div className="space-y-4">
            {roadmap[expandedWeek >= 0 ? expandedWeek : 0]?.recommendedProject && (
              <div className="glass rounded-xl p-5 border border-gray-800 space-y-3">
                <div className="flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-accent-pink" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Recommended Stage Project</h4>
                </div>
                <div className="space-y-1.5 p-3 rounded-lg bg-gray-900/90 border border-gray-800">
                  <h5 className="text-xs font-bold text-white">
                    {roadmap[expandedWeek >= 0 ? expandedWeek : 0].recommendedProject.title}
                  </h5>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    {roadmap[expandedWeek >= 0 ? expandedWeek : 0].recommendedProject.description}
                  </p>
                </div>
              </div>
            )}

            {/* Direct Verification Trigger */}
            <div className="glass rounded-xl p-5 border border-emerald-500/30 bg-emerald-950/10 space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">Ready for Verification?</h4>
              </div>
              <p className="text-[11px] text-gray-300">
                Completed the topics above? Prove your knowledge through coding challenges and receive a verified badge.
              </p>
              <button
                onClick={() => onOpenVerification && onOpenVerification(missingSkillsList[0] || "React.js")}
                className="w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Award className="w-4 h-4" /> Start Skill Assessment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

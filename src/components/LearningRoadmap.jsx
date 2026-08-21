// agent-notes: { ctx: "Playful cartoon Learning Roadmap component with 3D buttons, bouncy stage accordions, server-authoritative progress & verification badges", deps: ["lucide-react", "../services/skillGapApi"], state: "active", last: "anti@2026-08-21" }
import React, { useState, useEffect } from 'react';
import { 
  Map, 
  CheckCircle2, 
  Award, 
  Zap, 
  Code2, 
  FolderGit2, 
  RefreshCw, 
  AlertCircle, 
  FolderOpen,
  BookOpen,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { skillGapApi } from '../services/skillGapApi';

export default function LearningRoadmap({ profile, missingSkillsList = [], targetRole, onOpenVerification, onNavigate }) {
  const activeTargetRole = targetRole || profile?.careerGoal || "Frontend Developer";
  const userId = profile?.id || profile?.email || "guest_user";

  // State: 'LOADING' | 'SUCCESS' | 'EMPTY' | 'ERROR'
  const [status, setStatus] = useState('LOADING');
  const [activeSkill, setActiveSkill] = useState("");
  const [roadmapData, setRoadmapData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [expandedStage, setExpandedStage] = useState(0);

  // Map of taskId -> boolean completed status loaded from backend
  const [taskCompletionMap, setTaskCompletionMap] = useState({});

  const availableSkills = (missingSkillsList && missingSkillsList.length > 0)
    ? missingSkillsList
    : (profile?.skills?.length ? ["React.js", "TypeScript", "Next.js", "Docker"] : []);

  useEffect(() => {
    if (availableSkills.length > 0) {
      const skillToLoad = activeSkill || availableSkills[0];
      if (!activeSkill) setActiveSkill(skillToLoad);
      loadRoadmap(skillToLoad);
    } else {
      setStatus('EMPTY');
    }
  }, [missingSkillsList, activeTargetRole, activeSkill]);

  const loadRoadmap = async (skillToFetch, forceRefresh = false) => {
    if (!skillToFetch) {
      setStatus('EMPTY');
      return;
    }

    setStatus('LOADING');
    setErrorMessage(null);

    try {
      const res = await skillGapApi.generateRoadmap({
        skillGapId: profile?.id || "guest_user",
        skill: skillToFetch,
        skillName: skillToFetch,
        targetRole: activeTargetRole,
        currentLevel: "Beginner",
        targetLevel: "Advanced",
        priority: "High",
        userId,
        forceRefresh
      });

      if (res && res.roadmap && res.roadmap.stages) {
        setRoadmapData(res.roadmap);
        
        const initialMap = {};
        (res.roadmap.tasks || []).forEach(t => {
          if (t.taskId) {
            initialMap[t.taskId] = t.status === 'completed' || t.completed === true;
          }
        });
        setTaskCompletionMap(initialMap);

        setStatus('SUCCESS');
        setExpandedStage(0);
      } else {
        setStatus('EMPTY');
      }
    } catch (err) {
      console.error("Roadmap retrieval error:", err);
      setErrorMessage(err.message || "Unable to retrieve learning roadmap from backend.");
      setStatus('ERROR');
    }
  };

  const handleToggleTask = async (task) => {
    if (!task || !task.taskId) return;
    const taskId = task.taskId;
    const currentCompleted = !!taskCompletionMap[taskId];
    const nextCompleted = !currentCompleted;
    const nextStatus = nextCompleted ? "completed" : "pending";

    setTaskCompletionMap(prev => ({
      ...prev,
      [taskId]: nextCompleted
    }));

    try {
      const result = await skillGapApi.updateRoadmapTaskProgress({
        taskId,
        roadmapId: roadmapData?.roadmapId,
        userId,
        status: nextStatus
      });

      if (result && result.data) {
        setRoadmapData(prev => ({
          ...prev,
          overallProgress: result.data.overallProgress ?? prev.overallProgress,
          stages: result.data.stages || prev.stages
        }));
      }
    } catch (err) {
      console.error("Failed to update task progress on backend:", err);
      setTaskCompletionMap(prev => ({
        ...prev,
        [taskId]: currentCompleted
      }));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-white pb-12 select-none">
      {/* Header section */}
      <div className="cartoon-card p-6 md:p-8 border-2 border-purple-500/30 relative overflow-hidden bg-gradient-to-r from-[#171d33] via-[#1c243f] to-[#1a2138]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 border-2 border-white/20">
              <Map className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-black text-white">Personalized Learning Roadmap</h2>
                <span className="cartoon-badge cartoon-badge-purple text-[10px]">
                  Target: {activeTargetRole}
                </span>
              </div>
              <p className="text-xs text-gray-300 font-medium">Server-calculated task milestones, cross-device persistence, and capstone milestones</p>
            </div>
          </div>

          {/* Skill Selector Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            {availableSkills.length > 1 && (
              <div className="flex items-center gap-1 bg-[#0d1220] border-2 border-purple-500/30 rounded-2xl p-1.5">
                {availableSkills.slice(0, 5).map(skill => (
                  <button
                    key={skill}
                    onClick={() => {
                      setActiveSkill(skill);
                      loadRoadmap(skill);
                    }}
                    className={`cartoon-badge text-xs transition-all cursor-pointer ${
                      activeSkill === skill 
                        ? 'cartoon-badge-purple scale-105 shadow-md' 
                        : 'bg-transparent text-gray-400 border-transparent hover:text-white'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            )}

            {status === 'SUCCESS' && (
              <button
                onClick={() => loadRoadmap(activeSkill, true)}
                className="cartoon-btn cartoon-btn-dark py-2 px-3 text-xs font-bold gap-1.5"
                title="Regenerate from AI"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 1. LOADING STATE */}
      {status === 'LOADING' && (
        <div className="cartoon-card p-16 border-2 border-purple-500/30 text-center space-y-4 flex flex-col items-center justify-center min-h-[340px]">
          <div className="w-14 h-14 rounded-2xl bg-purple-950/60 border-2 border-purple-400 flex items-center justify-center text-purple-400 shadow-lg shadow-purple-500/20">
            <RefreshCw className="w-7 h-7 animate-spin text-pink-400" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-black text-white">Loading Roadmap for {activeSkill}...</h4>
            <p className="text-xs text-gray-300 font-medium">Synchronizing task milestones from database...</p>
          </div>
        </div>
      )}

      {/* 2. ERROR STATE */}
      {status === 'ERROR' && (
        <div className="cartoon-card p-12 border-2 border-rose-500/40 bg-rose-950/20 text-center space-y-4 flex flex-col items-center justify-center min-h-[300px]">
          <AlertCircle className="w-10 h-10 text-rose-400" />
          <div className="space-y-1">
            <h4 className="text-base font-black text-white">Unable to load learning roadmap.</h4>
            <p className="text-xs text-rose-300 max-w-md mx-auto font-medium">{errorMessage || "Roadmap service encountered an issue. Please retry."}</p>
          </div>
          <button
            onClick={() => loadRoadmap(activeSkill)}
            className="cartoon-btn cartoon-btn-purple py-2 px-5 text-xs font-black gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry Retrieval
          </button>
        </div>
      )}

      {/* 3. EMPTY STATE */}
      {status === 'EMPTY' && (
        <div className="cartoon-card p-12 text-center flex flex-col items-center justify-center space-y-4 border-2 border-purple-500/30 min-h-[300px]">
          <FolderOpen className="w-10 h-10 text-purple-400" />
          <div className="space-y-1">
            <h4 className="text-base font-black text-white">No Roadmap Available Yet</h4>
            <p className="text-xs text-gray-300 max-w-md mx-auto font-medium">
              Run a Skill Gap analysis to identify missing skills, then click "Start Roadmap" to generate your custom learning path.
            </p>
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate('skillgap')}
              className="cartoon-btn cartoon-btn-purple py-2.5 px-6 text-xs font-black gap-2"
            >
              <Zap className="w-4 h-4 fill-current" /> Go to Skill Gap Hub
            </button>
          )}
        </div>
      )}

      {/* 4. SUCCESS STATE */}
      {status === 'SUCCESS' && roadmapData && (
        <>
          {/* Top Overview & Progress */}
          <div className="cartoon-card p-6 border-2 border-purple-500/30 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white">{roadmapData.skillName} Curriculum</h3>
                  <span className="cartoon-badge cartoon-badge-mint text-[10px]">
                    Est. {roadmapData.estimatedLearningHours || 20} Hours
                  </span>
                </div>
                <p className="text-xs text-gray-300 font-medium">
                  Target Proficiency: <strong className="text-white font-bold">{roadmapData.targetLevel || "Advanced"}</strong> | Priority: <strong className="text-pink-400 font-bold">{roadmapData.priority || "High"}</strong>
                </p>
              </div>

              {/* Progress Widget */}
              <div className="flex items-center gap-3 self-start md:self-center bg-[#0d1220] border-2 border-purple-500/30 px-5 py-3 rounded-2xl">
                <div>
                  <span className="text-[10px] uppercase font-black text-purple-300 block">Verified Progress</span>
                  <span className="text-base font-black text-white">{roadmapData.overallProgress || 0}%</span>
                </div>
                <div className="w-32 h-3 bg-[#151b2e] rounded-full overflow-hidden border border-white/10">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-emerald-400 transition-all duration-500 rounded-full" 
                    style={{ width: `${roadmapData.overallProgress || 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Prerequisites */}
            {roadmapData.prerequisites && roadmapData.prerequisites.length > 0 && (
              <div className="pt-3 border-t-2 border-white/10 flex items-center gap-2 flex-wrap text-xs">
                <span className="text-gray-300 font-black flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-purple-400" /> Recommended Prerequisites:
                </span>
                {roadmapData.prerequisites.map((prereq, idx) => (
                  <span key={idx} className="cartoon-badge cartoon-badge-purple text-[10px]">
                    {prereq}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Stages Accordion */}
            <div className="space-y-4 lg:col-span-2">
              {(roadmapData.stages || []).map((stage, sIdx) => {
                const isExpanded = expandedStage === sIdx;
                const stageTasks = stage.tasks || (stage.topics || []).map((t, idx) => ({
                  taskId: `task_${roadmapData.roadmapId || 'rdm'}_s${stage.stageNumber || sIdx + 1}_top${idx}`,
                  title: t
                }));

                const completedStageCount = stageTasks.filter(t => taskCompletionMap[t.taskId]).length;
                const stageProgress = stageTasks.length > 0 
                  ? Math.round((completedStageCount / stageTasks.length) * 100) 
                  : (stage.stageProgress || 0);

                return (
                  <div
                    key={sIdx}
                    className={`cartoon-card border-2 transition-all overflow-hidden ${
                      isExpanded ? 'border-purple-400 shadow-xl' : 'border-purple-500/20 hover:border-purple-500/50'
                    }`}
                  >
                    {/* Stage Header */}
                    <button
                      onClick={() => setExpandedStage(isExpanded ? -1 : sIdx)}
                      className="w-full text-left p-5 flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1 overflow-hidden">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-black text-purple-300 tracking-wider">
                            Stage {stage.stageNumber || sIdx + 1}
                          </span>
                          <span className="cartoon-badge cartoon-badge-cyan text-[10px]">
                            {stage.level || "Beginner"}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-white truncate">{stage.title}</h4>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {stageProgress === 100 ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <span className="cartoon-badge cartoon-badge-purple text-xs">
                            {stageProgress}%
                          </span>
                        )}
                      </div>
                    </button>

                    {/* Stage Body */}
                    {isExpanded && (
                      <div className="px-6 pb-6 pt-2 border-t-2 border-white/10 space-y-4 animate-fade-in">
                        <div className="space-y-2">
                          <span className="text-[10px] uppercase font-black text-purple-300 block tracking-wider">
                            1. Theoretical Core Modules ({stage.level || "Beginner"})
                          </span>
                          {stageTasks.map((task, tIdx) => {
                            const isChecked = !!taskCompletionMap[task.taskId];

                            return (
                              <label
                                key={task.taskId || tIdx}
                                className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                                  isChecked 
                                    ? 'bg-emerald-950/30 border-emerald-500/30 text-gray-300' 
                                    : 'bg-[#0d1220] border-purple-500/20 text-gray-200 hover:border-purple-500/50'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggleTask(task)}
                                  className="mt-0.5 w-4 h-4 rounded accent-purple-500 cursor-pointer"
                                />
                                <div className="space-y-0.5">
                                  <span className={`text-xs block ${isChecked ? 'line-through text-gray-400' : 'font-bold'}`}>
                                    {task.title}
                                  </span>
                                </div>
                              </label>
                            );
                          })}
                        </div>

                        {/* Practical Exercises */}
                        {stage.practiceTasks && stage.practiceTasks.length > 0 && (
                          <div className="space-y-2 pt-2 border-t-2 border-white/10">
                            <span className="text-[10px] uppercase font-black text-cyan-300 block tracking-wider">
                              2. Hands-on Practice Tasks
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {stage.practiceTasks.map((task, pIdx) => (
                                <div key={pIdx} className="p-3 rounded-2xl bg-[#0d1220] border border-purple-500/20 text-xs text-gray-300 flex items-start gap-2 font-medium">
                                  <Code2 className="w-3.5 h-3.5 text-pink-400 shrink-0 mt-0.5" />
                                  <span>{task}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Mini Project */}
                        {stage.miniProject && (
                          <div className="p-4 rounded-2xl bg-purple-950/40 border-2 border-purple-500/30 flex items-start gap-2.5">
                            <Sparkles className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <span className="text-[10px] uppercase font-black text-pink-300 tracking-wider block">
                                Stage Checkpoint Project
                              </span>
                              <p className="text-xs font-bold text-white">{stage.miniProject}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right Column: Milestone */}
            <div className="space-y-4">
              {roadmapData.finalProject && (
                <div className="cartoon-card p-6 border-2 border-purple-500/30 space-y-3">
                  <div className="flex items-center gap-2">
                    <FolderGit2 className="w-5 h-5 text-pink-400" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">Capstone Milestone Project</h4>
                  </div>
                  <div className="space-y-2 p-4 rounded-2xl bg-[#0d1220] border-2 border-purple-500/20">
                    <h5 className="text-xs font-black text-white">
                      {roadmapData.finalProject.title}
                    </h5>
                    <p className="text-xs text-gray-300 leading-relaxed font-medium">
                      {roadmapData.finalProject.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Direct Verification Trigger */}
              <div className="cartoon-card p-6 border-2 border-emerald-500/40 bg-emerald-950/20 space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-white">Ready for Certification?</h4>
                </div>
                <p className="text-xs text-gray-300 font-medium leading-relaxed">
                  Completed the modules above? Prove your competency in <strong className="text-white font-black">{roadmapData.skillName}</strong> to earn verified badges.
                </p>
                <button
                  onClick={() => onOpenVerification && onOpenVerification(roadmapData.skillName)}
                  className="cartoon-btn cartoon-btn-mint w-full py-3 text-xs font-black gap-2"
                >
                  <Award className="w-4 h-4" /> Start Verification ›
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// agent-notes: { ctx: "Personalized Learning Roadmap component with backend-authoritative task progress, PATCH /api/skill-gap/roadmap/tasks/:taskId integration, and cross-device persistence", deps: ["react", "lucide-react", "../services/skillGapApi"], state: "active", last: "anti@2026-08-20" }
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
  Sparkles
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
        
        // Sync task completion map from backend stored tasks
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

    // Optimistically update UI
    setTaskCompletionMap(prev => ({
      ...prev,
      [taskId]: nextCompleted
    }));

    try {
      // Send to Backend Authoritative Progress API
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
      // Revert optimistic state on network error
      setTaskCompletionMap(prev => ({
        ...prev,
        [taskId]: currentCompleted
      }));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-white pb-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent-purple to-accent-pink flex items-center justify-center shadow-lg shadow-accent-purple/20">
              <Map className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white">Personalized Learning Roadmap</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-accent-purple/20 text-accent-purple text-xs font-bold border border-accent-purple/30">
                  Target: {activeTargetRole}
                </span>
              </div>
              <p className="text-xs text-gray-400">Server-calculated task completion, cross-device persistence, and capstone milestones</p>
            </div>
          </div>
        </div>

        {/* Skill Selector Tabs & Refresh */}
        <div className="flex items-center gap-2 flex-wrap">
          {availableSkills.length > 1 && (
            <div className="flex items-center gap-1.5 bg-gray-900 border border-gray-800 rounded-xl p-1">
              {availableSkills.slice(0, 5).map(skill => (
                <button
                  key={skill}
                  onClick={() => {
                    setActiveSkill(skill);
                    loadRoadmap(skill);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeSkill === skill 
                      ? 'bg-accent-purple text-white shadow-sm' 
                      : 'text-gray-400 hover:text-white'
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
              title="Regenerate from AI"
              className="p-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-400 hover:text-white transition-all flex items-center gap-1.5 text-xs font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          )}
        </div>
      </div>

      {/* 1. LOADING STATE */}
      {status === 'LOADING' && (
        <div className="glass rounded-2xl p-16 border border-gray-800 text-center space-y-4 flex flex-col items-center justify-center min-h-[340px]">
          <div className="w-12 h-12 rounded-2xl bg-accent-purple/20 border border-accent-purple/40 flex items-center justify-center text-accent-purple">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-white">Loading Roadmap for {activeSkill}...</h4>
            <p className="text-xs text-gray-400">Synchronizing persistent progress and task statuses from database...</p>
          </div>
        </div>
      )}

      {/* 2. ERROR STATE */}
      {status === 'ERROR' && (
        <div className="glass rounded-2xl p-12 border border-rose-500/30 bg-rose-950/10 text-center space-y-4 flex flex-col items-center justify-center min-h-[300px]">
          <AlertCircle className="w-10 h-10 text-rose-400" />
          <div className="space-y-1">
            <h4 className="text-base font-bold text-white">Unable to load learning roadmap.</h4>
            <p className="text-xs text-rose-300 max-w-md mx-auto">{errorMessage || "Roadmap service encountered an issue. Please retry."}</p>
          </div>
          <button
            onClick={() => loadRoadmap(activeSkill)}
            className="px-4 py-2 rounded-xl bg-accent-purple text-white text-xs font-bold shadow-md hover:bg-accent-purple/90 transition-all flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry Retrieval
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

      {/* 4. SUCCESS STATE: PERSISTENT ROADMAP CONTENT */}
      {status === 'SUCCESS' && roadmapData && (
        <>
          {/* Top Overview & Server-Calculated Progress Bar */}
          <div className="glass rounded-2xl p-5 border border-gray-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white">{roadmapData.skillName} Curriculum</h3>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] border border-emerald-500/30">
                    Est. {roadmapData.estimatedLearningHours || 20} Hours
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Target Proficiency: <span className="text-white font-bold">{roadmapData.targetLevel || "Advanced"}</span> | Priority: <span className="text-accent-pink font-bold">{roadmapData.priority || "High"}</span>
                </p>
              </div>

              {/* Authoritative Overall Progress Widget */}
              <div className="flex items-center gap-3 self-start md:self-center bg-gray-900/90 border border-gray-800 px-4 py-2.5 rounded-xl">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Verified Progress</span>
                  <span className="text-sm font-black text-white">{roadmapData.overallProgress || 0}%</span>
                </div>
                <div className="w-28 h-2.5 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-accent-purple via-accent-pink to-emerald-400 transition-all duration-500" 
                    style={{ width: `${roadmapData.overallProgress || 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Prerequisites */}
            {roadmapData.prerequisites && roadmapData.prerequisites.length > 0 && (
              <div className="pt-2 border-t border-gray-800 flex items-center gap-2 flex-wrap text-xs">
                <span className="text-gray-400 font-bold flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-accent-purple" /> Recommended Prerequisites:
                </span>
                {roadmapData.prerequisites.map((prereq, idx) => (
                  <span key={idx} className="px-2.5 py-0.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 text-[11px] font-medium">
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

                const levelBadge = stage.level === "Advanced"
                  ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                  : stage.level === "Intermediate"
                  ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                  : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";

                return (
                  <div
                    key={sIdx}
                    className={`glass rounded-2xl transition-all border overflow-hidden ${
                      isExpanded ? 'border-accent-purple/40 shadow-lg shadow-purple-500/5' : 'border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    {/* Stage Header */}
                    <button
                      onClick={() => setExpandedStage(isExpanded ? -1 : sIdx)}
                      className="w-full text-left p-4 flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1 overflow-hidden">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-extrabold text-accent-purple tracking-wider">
                            Stage {stage.stageNumber || sIdx + 1}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${levelBadge}`}>
                            {stage.level || "Beginner"}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white truncate">{stage.title}</h4>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {stageProgress === 100 ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <span className="text-xs font-bold px-2.5 py-1 rounded bg-gray-900 border border-gray-800 text-gray-300">
                            {stageProgress}%
                          </span>
                        )}
                      </div>
                    </button>

                    {/* Stage Body */}
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-2 border-t border-gray-800/60 space-y-4">
                        {/* Tasks / Topics List */}
                        <div className="space-y-2">
                          <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                            1. Theoretical Core Modules ({stage.level || "Beginner"})
                          </span>
                          {stageTasks.map((task, tIdx) => {
                            const isChecked = !!taskCompletionMap[task.taskId];

                            return (
                              <label
                                key={task.taskId || tIdx}
                                className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                                  isChecked 
                                    ? 'bg-emerald-950/20 border-emerald-500/30 text-gray-300' 
                                    : 'bg-gray-900/60 border-gray-800 text-gray-200 hover:bg-gray-900'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggleTask(task)}
                                  className="mt-0.5 w-4 h-4 rounded border-gray-700 bg-gray-950 text-accent-purple focus:ring-accent-purple"
                                />
                                <div className="space-y-0.5">
                                  <span className={`text-xs block ${isChecked ? 'line-through text-gray-400' : 'font-medium'}`}>
                                    {task.title}
                                  </span>
                                  {task.taskId && (
                                    <span className="text-[9px] text-gray-600 font-mono block">
                                      ID: {task.taskId}
                                    </span>
                                  )}
                                </div>
                              </label>
                            );
                          })}
                        </div>

                        {/* Practical Exercises */}
                        {stage.practiceTasks && stage.practiceTasks.length > 0 && (
                          <div className="space-y-2 pt-2 border-t border-gray-800/40">
                            <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                              2. Hands-on Practice Tasks
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {stage.practiceTasks.map((task, pIdx) => (
                                <div key={pIdx} className="p-3 rounded-xl bg-gray-900/80 border border-gray-800 text-[11px] text-gray-300 flex items-start gap-2">
                                  <Code2 className="w-3.5 h-3.5 text-accent-purple shrink-0 mt-0.5" />
                                  <span>{task}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Mini Project */}
                        {stage.miniProject && (
                          <div className="p-3.5 rounded-xl bg-accent-purple/10 border border-accent-purple/20 flex items-start gap-2.5">
                            <Sparkles className="w-4 h-4 text-accent-pink shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <span className="text-[10px] uppercase font-extrabold text-accent-pink tracking-wider block">
                                Stage Checkpoint Project
                              </span>
                              <p className="text-xs font-semibold text-white">{stage.miniProject}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right Column: Capstone Milestone Project & Assessment Trigger */}
            <div className="space-y-4">
              {roadmapData.finalProject && (
                <div className="glass rounded-2xl p-5 border border-gray-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <FolderGit2 className="w-4 h-4 text-accent-pink" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">Capstone Milestone Project</h4>
                  </div>
                  <div className="space-y-2 p-3.5 rounded-xl bg-gray-900/90 border border-gray-800">
                    <h5 className="text-xs font-extrabold text-white">
                      {roadmapData.finalProject.title}
                    </h5>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      {roadmapData.finalProject.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Direct Verification Trigger */}
              <div className="glass rounded-2xl p-5 border border-emerald-500/30 bg-emerald-950/10 space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">Ready for Certification?</h4>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  Completed the modules above? Prove your competency in <span className="text-white font-bold">{roadmapData.skillName}</span> to earn verified badges.
                </p>
                <button
                  onClick={() => onOpenVerification && onOpenVerification(roadmapData.skillName)}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <Award className="w-4 h-4" /> Start {roadmapData.skillName} Verification ›
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

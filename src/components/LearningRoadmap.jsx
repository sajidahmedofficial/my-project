// agent-notes: { ctx: "Playful cartoon Learning Roadmap component with backend API integration, offline aiSimulator fallback, and persistent checked progress", deps: ["lucide-react", "../services/skillGapApi", "../utils/aiSimulator"], state: "active", last: "anti@2026-08-25" }
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
import { generateRoadmap as generateAiSimulatorRoadmap } from '../utils/aiSimulator';

export default function LearningRoadmap({ profile, missingSkillsList = [], targetRole, onOpenVerification, onNavigate }) {
  const activeTargetRole = targetRole || profile?.careerGoal || "Frontend Developer";
  const userId = profile?.id || profile?.email || "guest_user";

  // State: 'LOADING' | 'SUCCESS' | 'EMPTY' | 'ERROR'
  const [status, setStatus] = useState('LOADING');
  const [activeSkill, setActiveSkill] = useState("");
  const [roadmapData, setRoadmapData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [expandedStage, setExpandedStage] = useState(0);

  // Map of taskId -> boolean completed status loaded from backend & localStorage
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

    const storageKey = `sb_roadmap_progress_${userId}_${skillToFetch}`;
    let localSavedMap = {};
    try {
      const savedRaw = localStorage.getItem(storageKey);
      if (savedRaw) {
        localSavedMap = JSON.parse(savedRaw);
      }
    } catch (e) {
      console.warn("Could not read local saved roadmap progress:", e);
    }

    try {
      // 1. Authoritative Backend Roadmap Request
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

      let loadedRoadmap = null;
      if (res && res.roadmap && res.roadmap.stages) {
        loadedRoadmap = res.roadmap;
      } else {
        // Fallback to simulated offline generator if backend response missing stages
        loadedRoadmap = formatFallbackRoadmap(skillToFetch, activeTargetRole, profile?.skills);
      }

      setRoadmapData(loadedRoadmap);

      // Hydrate task completion map merging backend + persisted localStorage
      const initialMap = {};
      (loadedRoadmap.tasks || []).forEach(t => {
        if (t.taskId) {
          initialMap[t.taskId] = localSavedMap[t.taskId] !== undefined
            ? Boolean(localSavedMap[t.taskId])
            : (t.status === 'completed' || t.completed === true);
        }
      });
      setTaskCompletionMap(initialMap);

      setStatus('SUCCESS');
      setExpandedStage(0);

    } catch (err) {
      console.warn("Backend roadmap fetch failed, using resilient offline aiSimulator generator:", err.message);
      
      // Fallback offline simulator
      const fallbackRoadmap = formatFallbackRoadmap(skillToFetch, activeTargetRole, profile?.skills);
      setRoadmapData(fallbackRoadmap);

      const initialMap = {};
      (fallbackRoadmap.tasks || []).forEach(t => {
        if (t.taskId) {
          initialMap[t.taskId] = localSavedMap[t.taskId] !== undefined
            ? Boolean(localSavedMap[t.taskId])
            : false;
        }
      });
      setTaskCompletionMap(initialMap);

      setStatus('SUCCESS');
      setExpandedStage(0);
    }
  };

  const handleToggleTask = async (task) => {
    if (!task || !task.taskId) return;
    const taskId = task.taskId;
    const currentCompleted = !!taskCompletionMap[taskId];
    const nextCompleted = !currentCompleted;
    const nextStatus = nextCompleted ? "completed" : "pending";

    const nextMap = {
      ...taskCompletionMap,
      [taskId]: nextCompleted
    };
    setTaskCompletionMap(nextMap);

    // Persist immediately to localStorage so progress survives tab switches and refreshes
    const storageKey = `sb_roadmap_progress_${userId}_${activeSkill || roadmapData?.skillName}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(nextMap));
    } catch (e) {
      console.warn("Could not persist roadmap progress to localStorage:", e);
    }

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
      console.warn("Task progress backend sync deferred, local persistence active:", err.message);
    }
  };

  function formatFallbackRoadmap(skillName, role, userSkills = []) {
    const simulatedWeeks = generateAiSimulatorRoadmap([skillName], role, userSkills);
    const stages = (simulatedWeeks || []).map((week, idx) => {
      const topicsList = week.topics && Array.isArray(week.topics)
        ? week.topics
        : [`Core ${skillName} Architecture`, `Advanced ${skillName} Optimization`];

      return {
        stageNumber: idx + 1,
        title: week.title || `${skillName} Stage ${idx + 1}`,
        level: week.level || (idx === 0 ? 'Beginner' : idx === 1 ? 'Intermediate' : 'Advanced'),
        topics: topicsList,
        practiceTasks: week.practiceTasks || [`Build modular ${skillName} exercise with automated tests`],
        miniProject: week.recommendedProject || `${skillName} Checkpoint Project`,
        stageProgress: 0
      };
    });

    const tasks = [];
    stages.forEach((stg, sIdx) => {
      stg.topics.forEach((top, tIdx) => {
        tasks.push({
          taskId: `task_${skillName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_s${sIdx + 1}_t${tIdx + 1}`,
          stageNumber: sIdx + 1,
          title: typeof top === 'string' ? top : (top.title || `Module ${tIdx + 1}`),
          status: 'pending'
        });
      });
    });

    return {
      roadmapId: `rdm_sim_${skillName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      skillName,
      targetRole: role,
      stages: stages.length > 0 ? stages : [
        {
          stageNumber: 1,
          title: `${skillName} Fundamentals & Core Patterns`,
          level: "Beginner",
          topics: [`Introduction to ${skillName}`, `Core Syntax & Conventions`],
          practiceTasks: [`Implement first ${skillName} script`],
          miniProject: `Basic ${skillName} Prototype`,
          stageProgress: 0
        }
      ],
      tasks,
      finalProject: {
        title: `${skillName} Production Capstone Architecture`,
        description: `Architect and deploy an enterprise-grade full-stack project applying all verified ${skillName} modules.`
      },
      overallProgress: 0
    };
  }

  return (
    <div className="space-y-6 animate-fade-in text-white pb-12 select-none">
      {/* Skill Tabs */}
      {availableSkills.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {availableSkills.map((sk, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveSkill(sk);
                loadRoadmap(sk);
              }}
              className={`cartoon-btn text-xs font-black py-2 px-4 shrink-0 transition-all ${
                activeSkill === sk
                  ? 'cartoon-btn-purple scale-105 shadow-lg'
                  : 'bg-[#151b2e] text-gray-400 hover:text-white border-2 border-purple-500/20'
              }`}
            >
              {sk}
            </button>
          ))}
        </div>
      )}

      {/* States */}
      {status === 'LOADING' && (
        <div className="cartoon-card p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-purple-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-sm font-black text-purple-300">Generating Personalized Learning Roadmap...</p>
        </div>
      )}

      {status === 'EMPTY' && (
        <div className="cartoon-card p-12 text-center space-y-4">
          <BookOpen className="w-12 h-12 text-gray-500 mx-auto" />
          <h3 className="text-base font-black text-white">No Skill Gaps Selected</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Analyze your resume or select target role competencies to generate your custom multi-stage roadmap.
          </p>
          {onNavigate && (
            <button onClick={() => onNavigate('dashboard')} className="cartoon-btn cartoon-btn-purple text-xs font-black mx-auto">
              Analyze Skill Gap ›
            </button>
          )}
        </div>
      )}

      {status === 'SUCCESS' && roadmapData && (
        <>
          {/* Header Card */}
          <div className="cartoon-card p-6 border-2 border-purple-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="cartoon-badge cartoon-badge-pink text-[10px]">
                  Target: {activeTargetRole}
                </span>
                <span className="cartoon-badge cartoon-badge-yellow text-[10px]">
                  {roadmapData.stages?.length || 3} Stages
                </span>
              </div>
              <h2 className="text-xl font-black text-white">{roadmapData.skillName} Roadmap</h2>
              <p className="text-xs text-gray-400">
                Action-oriented structured milestones tailored for industry placement readiness.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => loadRoadmap(activeSkill || roadmapData.skillName, true)}
                className="cartoon-btn bg-[#151b2e] hover:bg-purple-950/40 text-purple-300 border-2 border-purple-500/30 text-xs font-black py-2 px-3 flex items-center gap-1.5"
                title="Regenerate fresh roadmap"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>
          </div>

          {/* Main Content: Stages Accordion */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {(roadmapData.stages || []).map((stage, sIdx) => {
                const isExpanded = expandedStage === sIdx;
                const stageTasks = (roadmapData.tasks || []).filter(
                  t => t.stageNumber === (stage.stageNumber || sIdx + 1)
                );

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

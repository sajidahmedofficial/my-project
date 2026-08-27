// agent-notes: { ctx: "Clean minimal SaaS Learning Roadmap component with backend API integration, offline aiSimulator fallback, and persistent progress tracking", deps: ["lucide-react", "../services/skillGapApi", "../utils/aiSimulator"], state: "active", last: "anti@2026-08-27" }
import React, { useState, useEffect } from 'react';
import { 
  Map, 
  CheckCircle2, 
  Award, 
  Code2, 
  FolderGit2, 
  RefreshCw, 
  AlertCircle, 
  BookOpen, 
  ChevronDown, 
  ChevronUp,
  ShieldCheck
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
        loadedRoadmap = formatFallbackRoadmap(skillToFetch, activeTargetRole, profile?.skills);
      }

      setRoadmapData(loadedRoadmap);

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
      console.warn("Backend roadmap fetch failed, using offline fallback generator:", err.message);
      
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
      console.warn("Task progress backend sync deferred:", err.message);
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
          title: `${skillName} Fundamentals & Core Concepts`,
          level: "Beginner",
          topics: [`Introduction to ${skillName}`, `Core Architecture & Patterns`],
          practiceTasks: [`Implement first ${skillName} exercise`],
          miniProject: `Basic ${skillName} Prototype`,
          stageProgress: 0
        }
      ],
      tasks,
      finalProject: {
        title: `${skillName} Production Capstone Project`,
        description: `Design and deploy a full-stack project applying all verified ${skillName} concepts.`
      },
      overallProgress: 0
    };
  }

  return (
    <div className="space-y-6 text-slate-900 pb-12">
      {/* Skill Tabs */}
      {availableSkills.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {availableSkills.map((sk, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveSkill(sk);
                loadRoadmap(sk);
              }}
              className={`py-1.5 px-3.5 text-xs font-medium rounded-lg transition-colors shrink-0 ${
                activeSkill === sk
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {sk}
            </button>
          ))}
        </div>
      )}

      {/* States */}
      {status === 'LOADING' && (
        <div className="saas-card p-12 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs font-medium text-slate-500">Generating Personalized Roadmap...</p>
        </div>
      )}

      {status === 'EMPTY' && (
        <div className="saas-card p-12 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-900">No Skill Gaps Selected</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Analyze your resume or select target role competencies to generate your structured learning roadmap.
          </p>
          {onNavigate && (
            <button onClick={() => onNavigate('dashboard')} className="saas-btn-primary text-xs mx-auto">
              Analyze Skill Gap
            </button>
          )}
        </div>
      )}

      {status === 'SUCCESS' && roadmapData && (
        <>
          {/* Header Card */}
          <div className="saas-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="saas-badge text-[10px]">
                  Target: {activeTargetRole}
                </span>
                <span className="saas-badge text-[10px]">
                  {roadmapData.stages?.length || 3} Stages
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">{roadmapData.skillName} Roadmap</h2>
              <p className="text-xs text-slate-500">
                Action-oriented structured milestones tailored for industry placement
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => loadRoadmap(activeSkill || roadmapData.skillName, true)}
                className="saas-btn-secondary py-1.5 px-3 text-xs gap-1.5"
                title="Regenerate fresh roadmap"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" /> Refresh
              </button>
            </div>
          </div>

          {/* Main Content: Stages Accordion */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
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
                    className="saas-card overflow-hidden"
                  >
                    {/* Stage Header */}
                    <button
                      onClick={() => setExpandedStage(isExpanded ? -1 : sIdx)}
                      className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                    >
                      <div className="space-y-0.5 overflow-hidden">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
                            Stage {stage.stageNumber || sIdx + 1}
                          </span>
                          <span className="saas-badge text-[10px]">
                            {stage.level || "Beginner"}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-slate-900 truncate">{stage.title}</h4>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {stageProgress === 100 ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <span className="text-xs font-semibold text-slate-600">
                            {stageProgress}%
                          </span>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {/* Stage Body */}
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-1 border-t border-slate-100 space-y-4">
                        <div className="space-y-2 pt-2">
                          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                            Core Modules ({stage.level || "Beginner"})
                          </span>
                          <div className="space-y-1.5">
                            {stageTasks.map((task, tIdx) => {
                              const isChecked = !!taskCompletionMap[task.taskId];

                              return (
                                <label
                                  key={task.taskId || tIdx}
                                  className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-colors cursor-pointer text-xs ${
                                    isChecked 
                                      ? 'bg-slate-50/80 border-slate-200 text-slate-400' 
                                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleToggleTask(task)}
                                    className="mt-0.5 w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                  />
                                  <span className={`leading-relaxed ${isChecked ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                    {task.title}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        {/* Practical Exercises */}
                        {stage.practiceTasks && stage.practiceTasks.length > 0 && (
                          <div className="space-y-1.5 pt-2 border-t border-slate-100">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                              Hands-on Practice Tasks
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {stage.practiceTasks.map((task, pIdx) => (
                                <div key={pIdx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
                                  <Code2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                                  <span>{task}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Mini Project */}
                        {stage.miniProject && (
                          <div className="p-3.5 rounded-lg bg-indigo-50/50 border border-indigo-100 flex items-start gap-2.5">
                            <div className="space-y-0.5">
                              <span className="text-[10px] uppercase font-semibold text-indigo-700 tracking-wider block">
                                Stage Checkpoint Project
                              </span>
                              <p className="text-xs font-semibold text-slate-900">{stage.miniProject}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right Column: Milestone & Verification */}
            <div className="space-y-4">
              {roadmapData.finalProject && (
                <div className="saas-card p-5 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <FolderGit2 className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">Capstone Project</h4>
                  </div>
                  <div className="space-y-1 p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                    <h5 className="text-xs font-semibold text-slate-900">
                      {roadmapData.finalProject.title}
                    </h5>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {roadmapData.finalProject.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Direct Verification Trigger */}
              <div className="saas-card p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">Skill Certification</h4>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Ready to test your competency in <strong className="text-slate-800">{roadmapData.skillName}</strong> and earn verified credentials?
                </p>
                <button
                  onClick={() => onOpenVerification && onOpenVerification(roadmapData.skillName)}
                  className="saas-btn-primary w-full py-2 text-xs font-medium gap-1.5"
                >
                  <Award className="w-3.5 h-3.5" /> Start Verification Test
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

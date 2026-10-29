// agent-notes: { ctx: "Enhanced SaaS Learning Roadmap with YouTube tutorials, official free courses, AI study notes, and persistent learning progress", deps: ["lucide-react", "../services/skillGapApi", "../utils/aiSimulator", "../services/learningResourcesService", "./roadmap/*"], state: "active", last: "anti@2026-10-29" }
import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle2, 
  Award, 
  Code2, 
  FolderGit2, 
  RefreshCw, 
  BookOpen, 
  ChevronDown, 
  ChevronUp,
  ShieldCheck,
  Bookmark
} from 'lucide-react';
import { skillGapApi } from '../services/skillGapApi';
import { generateRoadmap as generateAiSimulatorRoadmap } from '../utils/aiSimulator';
import {
  getYoutubeResourcesForStage,
  getFreeCoursesForStage,
  getStudyMaterialsForStage,
  loadResourceProgress,
  saveResourceProgress,
  calculateStageLearningProgress,
  getResumeLearningItem,
  discoverAndRefreshCourses
} from '../services/learningResourcesService';

import YouTubeResources from './roadmap/YouTubeResources';
import FreeCourseCatalog from './roadmap/FreeCourseCatalog';
import StudyMaterials from './roadmap/StudyMaterials';
import LearningProgressSummary from './roadmap/LearningProgressSummary';

export default function LearningRoadmap({ 
  profile, 
  missingSkillsList = [], 
  targetRole, 
  initialSkill, 
  targetSkill, 
  onSelectSkill, 
  onOpenVerification, 
  onNavigate 
}) {
  const activeTargetRole = targetRole || profile?.careerGoal || "Frontend Developer";
  const userId = profile?.id || profile?.email || "guest_user";

  const requestedSkill = initialSkill || targetSkill || (() => {
    try {
      return localStorage.getItem('sb_active_roadmap_skill') || null;
    } catch {
      return null;
    }
  })();

  const rawSkills = (missingSkillsList && missingSkillsList.length > 0)
    ? missingSkillsList
    : (() => {
        try {
          const savedMissing = localStorage.getItem('sb_missing_skills');
          if (savedMissing) {
            const parsed = JSON.parse(savedMissing);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
          }
        } catch {}
        return (profile?.skills?.length ? ["React.js", "TypeScript", "Next.js", "Docker"] : []);
      })();

  const availableSkills = Array.from(new Set([
    ...(requestedSkill ? [requestedSkill] : []),
    ...rawSkills
  ])).filter(Boolean);

  const getCachedRoadmap = (skill) => {
    if (!skill) return null;
    try {
      const raw = localStorage.getItem(`sb_roadmap_${userId}_${skill}`);
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  };

  const startingSkill = requestedSkill || availableSkills[0] || "";
  const initialRoadmap = getCachedRoadmap(startingSkill);

  // State: 'LOADING' | 'SUCCESS' | 'EMPTY' | 'ERROR'
  const [status, setStatus] = useState(() => initialRoadmap ? 'SUCCESS' : (availableSkills.length > 0 ? 'LOADING' : 'EMPTY'));
  const [activeSkill, setActiveSkill] = useState(startingSkill);
  const [roadmapData, setRoadmapData] = useState(() => initialRoadmap);
  const [expandedStage, setExpandedStage] = useState(0);

  // Map of taskId -> boolean completed status loaded from backend & localStorage
  const [taskCompletionMap, setTaskCompletionMap] = useState({});

  // Dynamic Learning Resource Progress (YouTube, Courses, Notes)
  const [resourceProgress, setResourceProgress] = useState(() => loadResourceProgress(userId, startingSkill));
  const [lastCatalogRefresh, setLastCatalogRefresh] = useState(() => {
    return localStorage.getItem('sb_course_sync_last_refreshed') || new Date().toISOString();
  });

  const handleSelectSkillTab = (sk) => {
    setActiveSkill(sk);
    try {
      localStorage.setItem('sb_active_roadmap_skill', sk);
    } catch {}
    if (onSelectSkill) {
      onSelectSkill(sk);
    }
    loadRoadmap(sk);
  };

  useEffect(() => {
    const desiredSkill = initialSkill || targetSkill || (() => {
      try {
        return localStorage.getItem('sb_active_roadmap_skill');
      } catch {
        return null;
      }
    })();

    if (desiredSkill && desiredSkill !== activeSkill) {
      setActiveSkill(desiredSkill);
      setExpandedStage(0);
      loadRoadmap(desiredSkill);
    } else if (availableSkills.length > 0) {
      const skillToLoad = activeSkill || desiredSkill || availableSkills[0];
      if (!activeSkill) setActiveSkill(skillToLoad);
      setResourceProgress(loadResourceProgress(userId, skillToLoad));
      if (!roadmapData || roadmapData.skillName !== skillToLoad) {
        loadRoadmap(skillToLoad);
      } else {
        setStatus('SUCCESS');
      }
    } else {
      setStatus('EMPTY');
    }
  }, [missingSkillsList, activeTargetRole, initialSkill, targetSkill]);

  const loadRoadmap = async (skillToFetch, forceRefresh = false) => {
    if (!skillToFetch) {
      setStatus('EMPTY');
      return;
    }

    setStatus('LOADING');

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
      try {
        localStorage.setItem(`sb_roadmap_${userId}_${skillToFetch}`, JSON.stringify(loadedRoadmap));
      } catch {}

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
      try {
        localStorage.setItem(`sb_roadmap_${userId}_${skillToFetch}`, JSON.stringify(fallbackRoadmap));
      } catch {}

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

  // Resource Progress Handlers
  const handleToggleTutorial = async (videoId) => {
    const isCompleted = resourceProgress.completedTutorials.includes(videoId);
    const nextCompleted = isCompleted
      ? resourceProgress.completedTutorials.filter(id => id !== videoId)
      : [...resourceProgress.completedTutorials, videoId];

    const updated = await saveResourceProgress(userId, activeSkill || roadmapData?.skillName, {
      completedTutorials: nextCompleted
    });
    setResourceProgress(updated);
  };

  const handleToggleSave = async (resourceId) => {
    const isSaved = resourceProgress.savedForLater.includes(resourceId);
    const nextSaved = isSaved
      ? resourceProgress.savedForLater.filter(id => id !== resourceId)
      : [...resourceProgress.savedForLater, resourceId];

    const updated = await saveResourceProgress(userId, activeSkill || roadmapData?.skillName, {
      savedForLater: nextSaved
    });
    setResourceProgress(updated);
  };

  const handleCourseStatusChange = async (courseId, newStatus) => {
    const updated = await saveResourceProgress(userId, activeSkill || roadmapData?.skillName, {
      courseStatus: {
        ...resourceProgress.courseStatus,
        [courseId]: newStatus
      }
    });
    setResourceProgress(updated);
  };

  const handleToggleReadTopic = async (topicKey) => {
    const isRead = resourceProgress.readNotesTopics.includes(topicKey);
    const nextRead = isRead
      ? resourceProgress.readNotesTopics.filter(k => k !== topicKey)
      : [...resourceProgress.readNotesTopics, topicKey];

    const updated = await saveResourceProgress(userId, activeSkill || roadmapData?.skillName, {
      readNotesTopics: nextRead
    });
    setResourceProgress(updated);
  };

  const handleSavePersonalNote = async (stageNumber, noteText) => {
    const updated = await saveResourceProgress(userId, activeSkill || roadmapData?.skillName, {
      userPersonalNotes: {
        ...resourceProgress.userPersonalNotes,
        [stageNumber]: noteText
      }
    });
    setResourceProgress(updated);
  };

  const handleRefreshCoursesCatalog = async () => {
    const res = await discoverAndRefreshCourses(activeSkill || roadmapData?.skillName);
    if (res.lastRefreshed) {
      setLastCatalogRefresh(res.lastRefreshed);
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

  // Pre-calculate dimensional resource counts and resume target
  const stagesResources = useMemo(() => {
    if (!roadmapData?.stages) return [];
    return roadmapData.stages.map((stg) => {
      const youtube = getYoutubeResourcesForStage(roadmapData.skillName, stg);
      const courses = getFreeCoursesForStage(roadmapData.skillName, stg);
      const notes = getStudyMaterialsForStage(roadmapData.skillName, stg);
      return { youtube, courses, notes };
    });
  }, [roadmapData?.stages, roadmapData?.skillName]);

  const dimensionalMetrics = useMemo(() => {
    if (!roadmapData) {
      return {
        totalModules: 0,
        completedModules: 0,
        totalTutorials: 0,
        completedTutorials: 0,
        totalCourses: 0,
        completedCourses: 0,
        totalNotesTopics: 0,
        readNotesTopics: 0,
        overallPercentage: 0,
        resumeItem: null
      };
    }

    const tasks = roadmapData.tasks || [];
    const totalModules = tasks.length;
    const completedModules = tasks.filter(t => taskCompletionMap[t.taskId]).length;

    let totalTutorials = 0;
    let totalCourses = 0;
    let totalNotesTopics = 0;
    const activitiesList = [];

    stagesResources.forEach((sr, sIdx) => {
      totalTutorials += sr.youtube.length;
      totalCourses += sr.courses.length;
      totalNotesTopics += (sr.notes.keyTopics || []).length;

      // Add activities for resume search
      sr.youtube.forEach(yt => {
        activitiesList.push({
          id: yt.id,
          title: yt.title,
          type: 'tutorial',
          completed: resourceProgress.completedTutorials.includes(yt.id),
          stageIdx: sIdx
        });
      });

      sr.courses.forEach(c => {
        activitiesList.push({
          id: c.id,
          title: c.title,
          type: 'course',
          completed: resourceProgress.courseStatus[c.id] === 'completed',
          stageIdx: sIdx
        });
      });
    });

    const completedTutorials = resourceProgress.completedTutorials.length;
    const completedCourses = Object.values(resourceProgress.courseStatus).filter(s => s === 'completed').length;
    const readNotesTopics = resourceProgress.readNotesTopics.length;

    const overallPercentage = calculateStageLearningProgress({
      totalModules,
      completedModules,
      totalTutorials,
      completedTutorials,
      totalCourses,
      completedCourses,
      totalNotesTopics,
      readNotesTopics
    });

    const resumeItem = getResumeLearningItem(activitiesList);

    return {
      totalModules,
      completedModules,
      totalTutorials,
      completedTutorials,
      totalCourses,
      completedCourses,
      totalNotesTopics,
      readNotesTopics,
      overallPercentage,
      resumeItem
    };
  }, [roadmapData, taskCompletionMap, stagesResources, resourceProgress]);

  const handleResumeClick = (item) => {
    if (item && item.stageIdx !== undefined) {
      setExpandedStage(item.stageIdx);
    }
  };

  return (
    <div className="space-y-6 text-slate-900 pb-12">
      {/* Skill Tabs */}
      {availableSkills.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {availableSkills.map((sk, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectSkillTab(sk)}
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
          <p className="text-xs font-medium text-slate-500">Generating Personalized Roadmap & Discovering Courses...</p>
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
          {/* Learning Progress Summary Banner */}
          <LearningProgressSummary
            overallPercentage={dimensionalMetrics.overallPercentage}
            completedModules={dimensionalMetrics.completedModules}
            totalModules={dimensionalMetrics.totalModules}
            completedTutorials={dimensionalMetrics.completedTutorials}
            totalTutorials={dimensionalMetrics.totalTutorials}
            completedCourses={dimensionalMetrics.completedCourses}
            totalCourses={dimensionalMetrics.totalCourses}
            readNotesTopics={dimensionalMetrics.readNotesTopics}
            totalNotesTopics={dimensionalMetrics.totalNotesTopics}
            resumeItem={dimensionalMetrics.resumeItem}
            onResumeClick={handleResumeClick}
          />

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
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Google & Tech Verified Courses Active
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">{roadmapData.skillName} Roadmap</h2>
              <p className="text-xs text-slate-500">
                Action-oriented structured milestones, YouTube tutorials, verified tech certifications, and AI study notes
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => loadRoadmap(activeSkill || roadmapData.skillName, true)}
                className="saas-btn-secondary py-1.5 px-3 text-xs gap-1.5"
                title="Regenerate fresh roadmap"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" /> Refresh Roadmap
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

                const stageRes = stagesResources[sIdx] || { youtube: [], courses: [], notes: {} };

                const completedStageTasks = stageTasks.filter(t => taskCompletionMap[t.taskId]).length;
                const completedStageTutorials = stageRes.youtube.filter(r => resourceProgress.completedTutorials.includes(r.id)).length;
                const completedStageCourses = stageRes.courses.filter(c => resourceProgress.courseStatus[c.id] === 'completed').length;
                const readStageNotes = (stageRes.notes.keyTopics || []).filter((_, idx) => resourceProgress.readNotesTopics.includes(`topic_${stage.stageNumber || sIdx + 1}_${idx}`)).length;

                const stageProgress = calculateStageLearningProgress({
                  totalModules: stageTasks.length,
                  completedModules: completedStageTasks,
                  totalTutorials: stageRes.youtube.length,
                  completedTutorials: completedStageTutorials,
                  totalCourses: stageRes.courses.length,
                  completedCourses: completedStageCourses,
                  totalNotesTopics: (stageRes.notes.keyTopics || []).length,
                  readNotesTopics: readStageNotes
                });

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
                          <span className="text-[10px] text-slate-400">
                            {stageRes.youtube.length} Videos · {stageRes.courses.length} Courses
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
                        {/* 1. Core Modules (Preserved) */}
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

                        {/* 2. Practical Exercises (Preserved) */}
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

                        {/* 3. Stage Checkpoint Mini Project (Preserved) */}
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

                        {/* 4. YouTube Learning Resources */}
                        <YouTubeResources
                          resources={stageRes.youtube}
                          stageNumber={stage.stageNumber || sIdx + 1}
                          completedTutorials={resourceProgress.completedTutorials}
                          savedForLater={resourceProgress.savedForLater}
                          onToggleComplete={handleToggleTutorial}
                          onToggleSave={handleToggleSave}
                        />

                        {/* 5. Free Online Courses from Google & Technology Companies */}
                        <FreeCourseCatalog
                          courses={stageRes.courses}
                          courseStatus={resourceProgress.courseStatus}
                          savedForLater={resourceProgress.savedForLater}
                          lastRefreshed={lastCatalogRefresh}
                          onStatusChange={handleCourseStatusChange}
                          onToggleSave={handleToggleSave}
                          onRefreshCourses={handleRefreshCoursesCatalog}
                        />

                        {/* 6. AI-Generated Study Materials and Notes */}
                        <StudyMaterials
                          notes={stageRes.notes}
                          stageNumber={stage.stageNumber || sIdx + 1}
                          readTopics={resourceProgress.readNotesTopics}
                          personalNote={resourceProgress.userPersonalNotes[stage.stageNumber || sIdx + 1] || ""}
                          onToggleReadTopic={handleToggleReadTopic}
                          onSavePersonalNote={handleSavePersonalNote}
                          onRegenerateNotes={() => loadRoadmap(activeSkill || roadmapData.skillName, true)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right Column: Milestone & Verification (Preserved) */}
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

              {/* Direct Verification Trigger (Preserved) */}
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

              {/* Saved For Later Drawer / Card */}
              {resourceProgress.savedForLater.length > 0 && (
                <div className="saas-card p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-amber-500" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">Saved Resources</h4>
                  </div>
                  <p className="text-xs text-slate-500">
                    You have <strong className="text-slate-800">{resourceProgress.savedForLater.length}</strong> items bookmarked for later study.
                  </p>
                  <div className="space-y-1.5 text-xs text-slate-600">
                    {resourceProgress.savedForLater.map((id, idx) => (
                      <div key={idx} className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]">
                        <span className="truncate max-w-[180px] font-medium">{id}</span>
                        <button
                          onClick={() => handleToggleSave(id)}
                          className="text-slate-400 hover:text-rose-600 text-[10px]"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// agent-notes: { ctx: "Instant interactive skill roadmap modal displaying multi-stage curriculum, YouTube tutorials, free courses, study notes, and full workspace launch on touch", deps: ["react", "lucide-react", "../../services/skillGapApi.js", "../../services/learningResourcesService.js", "./YouTubeResources.jsx", "./FreeCourseCatalog.jsx", "./StudyMaterials.jsx"], state: "active", last: "anti@2026-10-29" }
import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Map, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  ExternalLink, 
  ShieldCheck, 
  Clock, 
  BookOpen, 
  Award, 
  Layers, 
  FolderGit2, 
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { skillGapApi } from '../../services/skillGapApi.js';
import { 
  getYoutubeResourcesForStage, 
  getFreeCoursesForStage, 
  getStudyMaterialsForStage,
  saveResourceProgress,
  loadResourceProgress
} from '../../services/learningResourcesService.js';
import YouTubeResources from './YouTubeResources.jsx';
import FreeCourseCatalog from './FreeCourseCatalog.jsx';
import StudyMaterials from './StudyMaterials.jsx';

export default function SkillRoadmapModal({
  skillName,
  targetRole = "Full Stack Developer",
  userId = "guest_user",
  onClose,
  onOpenFullWorkspace,
  onOpenVerification
}) {
  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [roadmap, setRoadmap] = useState(null);
  const [taskCompletionMap, setTaskCompletionMap] = useState({});
  const [activeTab, setActiveTab] = useState('curriculum'); // 'curriculum' | 'youtube' | 'courses' | 'notes'

  // Resource progress state (completed tutorials, saved courses, read notes)
  const [resourceProgress, setResourceProgress] = useState(() => loadResourceProgress(userId, skillName));

  // Lock background scroll while modal is mounted
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow || 'unset';
    };
  }, []);

  // Fetch or generate roadmap from API / fallback
  useEffect(() => {
    let isMounted = true;
    async function fetchRoadmapData() {
      if (!skillName) return;
      setLoading(true);
      try {
        const res = await skillGapApi.generateRoadmap({
          skill: skillName,
          skillName,
          targetRole,
          userId,
          currentLevel: "Beginner",
          targetLevel: "Advanced",
          priority: "High"
        });

        if (isMounted) {
          if (res && res.roadmap) {
            setRoadmap(res.roadmap);
            // Restore saved local task progress
            try {
              const storageKey = `sb_roadmap_progress_${userId}_${skillName}`;
              const saved = localStorage.getItem(storageKey);
              if (saved) {
                setTaskCompletionMap(JSON.parse(saved));
              }
            } catch {}
          }
          setLoading(false);
        }
      } catch (err) {
        console.warn(`Roadmap modal error for ${skillName}:`, err);
        if (isMounted) setLoading(false);
      }
    }

    fetchRoadmapData();
    return () => { isMounted = false; };
  }, [skillName, targetRole, userId]);

  const stages = roadmap?.stages || [];
  const activeStage = stages[activeStageIdx] || stages[0];

  // Stage resources (YouTube, Courses, Notes)
  const stageResources = useMemo(() => {
    if (!activeStage) return { youtube: [], courses: [], notes: null };
    return {
      youtube: getYoutubeResourcesForStage(skillName, activeStage),
      courses: getFreeCoursesForStage(skillName, activeStage),
      notes: getStudyMaterialsForStage(skillName, activeStage)
    };
  }, [skillName, activeStage]);

  // Toggle practice task completion
  const handleToggleTask = (task) => {
    if (!task) return;
    const taskId = task.taskId || `task_${activeStageIdx}_${task.title}`;
    const nextCompleted = !taskCompletionMap[taskId];
    const nextMap = {
      ...taskCompletionMap,
      [taskId]: nextCompleted
    };
    setTaskCompletionMap(nextMap);

    try {
      const storageKey = `sb_roadmap_progress_${userId}_${skillName}`;
      localStorage.setItem(storageKey, JSON.stringify(nextMap));
    } catch {}

    // Async backend update
    skillGapApi.updateRoadmapTaskProgress({
      taskId,
      roadmapId: roadmap?.roadmapId,
      userId,
      status: nextCompleted ? 'completed' : 'pending'
    }).catch(() => {});
  };

  // Resource interaction handlers
  const handleToggleTutorial = async (videoId) => {
    const isCompleted = resourceProgress.completedTutorials.includes(videoId);
    const nextCompleted = isCompleted
      ? resourceProgress.completedTutorials.filter(id => id !== videoId)
      : [...resourceProgress.completedTutorials, videoId];

    const updated = await saveResourceProgress(userId, skillName, {
      completedTutorials: nextCompleted
    });
    setResourceProgress(updated);
  };

  const handleToggleSave = async (resourceId) => {
    const isSaved = resourceProgress.savedForLater.includes(resourceId);
    const nextSaved = isSaved
      ? resourceProgress.savedForLater.filter(id => id !== resourceId)
      : [...resourceProgress.savedForLater, resourceId];

    const updated = await saveResourceProgress(userId, skillName, {
      savedForLater: nextSaved
    });
    setResourceProgress(updated);
  };

  const handleCourseStatusChange = async (courseId, newStatus) => {
    const updated = await saveResourceProgress(userId, skillName, {
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
      ? resourceProgress.readNotesTopics.filter(id => id !== topicKey)
      : [...resourceProgress.readNotesTopics, topicKey];

    const updated = await saveResourceProgress(userId, skillName, {
      readNotesTopics: nextRead
    });
    setResourceProgress(updated);
  };

  const handleSavePersonalNote = async (stgNum, text) => {
    const updated = await saveResourceProgress(userId, skillName, {
      userPersonalNotes: {
        ...resourceProgress.userPersonalNotes,
        [stgNum]: text
      }
    });
    setResourceProgress(updated);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-semibold border border-indigo-400/30 flex items-center gap-1">
                <Map className="w-3 h-3" />
                <span>Personalized Learning Roadmap</span>
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Target Role: <strong className="text-slate-200">{targetRole}</strong>
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              {skillName} Roadmap & Mastery Hub
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenFullWorkspace && (
              <button
                onClick={() => {
                  if (onClose) onClose();
                  onOpenFullWorkspace(skillName);
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-all"
                title="Open in dedicated Roadmap workspace"
              >
                <span>Full Workspace</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Roadmap"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-10 h-10 rounded-full border-3 border-indigo-600 border-t-transparent animate-spin mx-auto" />
              <h4 className="text-sm font-semibold text-slate-800">Generating Personalized Roadmap for {skillName}...</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Discovering official free courses, curated YouTube tutorials, practice tasks, and capstone blueprints.
              </p>
            </div>
          ) : !roadmap || !stages.length ? (
            <div className="py-16 text-center space-y-3">
              <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="text-sm font-semibold text-slate-800">Roadmap curriculum could not be loaded</h4>
              <p className="text-xs text-slate-500">Please try again or open the full learning workspace.</p>
            </div>
          ) : (
            <>
              {/* Stages Ribbon / Tabs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {stages.map((stg, idx) => {
                  const isSelected = activeStageIdx === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveStageIdx(idx)}
                      className={`text-left p-3.5 rounded-2xl border transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 shadow-xs ring-1 ring-indigo-600/20'
                          : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100/70 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className={`font-bold uppercase tracking-wider ${
                          isSelected ? 'text-indigo-700' : 'text-slate-500'
                        }`}>
                          Stage {stg.stageNumber || idx + 1}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-white border border-slate-200 text-slate-600">
                          {stg.level || (idx === 0 ? 'Beginner' : idx === 1 ? 'Intermediate' : 'Advanced')}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {stg.title?.replace(/^Stage \d+:\s*/i, '') || `${skillName} Milestones`}
                      </h4>
                    </button>
                  );
                })}
              </div>

              {/* Resource Sub-Navigation Pills */}
              <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('curriculum')}
                  className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 flex items-center gap-1.5 ${
                    activeTab === 'curriculum'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Curriculum & Tasks</span>
                </button>

                <button
                  onClick={() => setActiveTab('youtube')}
                  className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 flex items-center gap-1.5 ${
                    activeTab === 'youtube'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>YouTube Tutorials ({stageResources.youtube.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('courses')}
                  className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 flex items-center gap-1.5 ${
                    activeTab === 'courses'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Free Courses ({stageResources.courses.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('notes')}
                  className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 flex items-center gap-1.5 ${
                    activeTab === 'notes'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Study Notes</span>
                </button>
              </div>

              {/* Tab 1: Curriculum & Practice Tasks */}
              {activeTab === 'curriculum' && (
                <div className="space-y-5 animate-fade-in">
                  {/* Topics Grid */}
                  <div className="p-4.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-indigo-600" />
                      Key Core Competencies & Topics
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(activeStage.topics || []).map((topic, tIdx) => (
                        <div key={tIdx} className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-start gap-2 text-xs text-slate-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                          <span className="font-medium leading-snug">{topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Practice Checkpoints */}
                  <div className="space-y-2.5">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      Hands-On Practice Tasks & Checkpoints
                    </h5>
                    <div className="space-y-2">
                      {(activeStage.practiceTasks || []).map((taskTitle, pIdx) => {
                        const taskId = `stg_${activeStageIdx}_task_${pIdx}`;
                        const isDone = !!taskCompletionMap[taskId];
                        return (
                          <div
                            key={pIdx}
                            onClick={() => handleToggleTask({ taskId, title: taskTitle })}
                            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                              isDone
                                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              {isDone ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              ) : (
                                <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                              )}
                              <span className={`text-xs font-medium ${isDone ? 'line-through text-emerald-700' : ''}`}>
                                {taskTitle}
                              </span>
                            </div>
                            <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                              {isDone ? 'Completed' : 'Click to complete'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mini-Project Callout */}
                  {activeStage.miniProject && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-white shadow-xs text-indigo-600 shrink-0">
                        <FolderGit2 className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Stage Checkpoint Mini-Project</div>
                        <div className="text-xs font-bold text-slate-900">{activeStage.miniProject}</div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          Build and verify this functional project before advancing to subsequent stages.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Capstone Project */}
                  {roadmap.finalProject && (
                    <div className="p-4.5 rounded-2xl bg-slate-900 text-white space-y-1.5">
                      <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                        <Award className="w-4 h-4 text-amber-400" />
                        Final Capstone Project
                      </div>
                      <h4 className="text-sm font-bold text-white">{roadmap.finalProject.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {roadmap.finalProject.description}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: YouTube Video Tutorials */}
              {activeTab === 'youtube' && (
                <div className="animate-fade-in">
                  <YouTubeResources
                    videos={stageResources.youtube}
                    completedTutorials={resourceProgress.completedTutorials}
                    savedForLater={resourceProgress.savedForLater}
                    onToggleComplete={handleToggleTutorial}
                    onToggleSave={handleToggleSave}
                  />
                </div>
              )}

              {/* Tab 3: Free Online Courses */}
              {activeTab === 'courses' && (
                <div className="animate-fade-in">
                  <FreeCourseCatalog
                    courses={stageResources.courses}
                    courseStatus={resourceProgress.courseStatus}
                    savedForLater={resourceProgress.savedForLater}
                    onStatusChange={handleCourseStatusChange}
                    onToggleSave={handleToggleSave}
                  />
                </div>
              )}

              {/* Tab 4: Study Notes */}
              {activeTab === 'notes' && (
                <div className="animate-fade-in">
                  <StudyMaterials
                    notes={stageResources.notes}
                    stageNumber={activeStage.stageNumber || activeStageIdx + 1}
                    readTopics={resourceProgress.readNotesTopics}
                    personalNote={resourceProgress.userPersonalNotes[activeStage.stageNumber || activeStageIdx + 1] || ""}
                    onToggleReadTopic={handleToggleReadTopic}
                    onSavePersonalNote={handleSavePersonalNote}
                    onRegenerateNotes={() => {}}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            Explore stage modules, practice hands-on, and verify competency.
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onOpenVerification && (
              <button
                onClick={() => {
                  if (onClose) onClose();
                  onOpenVerification(skillName);
                }}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-emerald-600 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verify Skill</span>
              </button>
            )}

            {onOpenFullWorkspace && (
              <button
                onClick={() => {
                  if (onClose) onClose();
                  onOpenFullWorkspace(skillName);
                }}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                <Map className="w-3.5 h-3.5" />
                <span>Full Workspace</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-all"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

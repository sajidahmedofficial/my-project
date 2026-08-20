// agent-notes: { ctx: "Roadmap Task Progress management service with authoritative backend calculation and disk-backed persistent storage", deps: ["mongoose", "../models/LearningRoadmap.js", "../models/RoadmapTask.js", "../storage/persistentStore.js"], state: "active", last: "anti@2026-08-20" }
import mongoose from 'mongoose';
import LearningRoadmap from '../models/LearningRoadmap.js';
import persistentStore from '../storage/persistentStore.js';

/**
 * Hydrate roadmap object with structured task IDs and server progress
 */
export function hydrateRoadmapTasks(roadmap, userId = "guest_user") {
  if (!roadmap) return null;
  const roadmapId = roadmap.roadmapId || `rdm_${roadmap.skillName?.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${userId}`;
  const allTasks = [];

  const stages = (roadmap.stages || []).map((stage, sIdx) => {
    const stageNumber = stage.stageNumber || sIdx + 1;
    const stageTasks = [];

    (stage.topics || []).forEach((topic, tIdx) => {
      const taskId = `task_${roadmapId}_s${stageNumber}_top${tIdx}`;
      const existingTask = (roadmap.tasks || []).find(t => t.taskId === taskId) || persistentStore.findOne('roadmapTasks', { taskId, userId });
      
      const taskObj = {
        taskId,
        roadmapId,
        userId,
        title: topic,
        stageNumber,
        taskType: 'topic',
        difficulty: stage.level || 'Beginner',
        status: existingTask ? existingTask.status : 'pending',
        completed: existingTask ? (existingTask.completed || existingTask.status === 'completed') : false,
        score: existingTask ? existingTask.score : null,
        completedAt: existingTask ? existingTask.completedAt : null
      };

      stageTasks.push(taskObj);
      allTasks.push(taskObj);

      // Persist individual task record to persistent store
      persistentStore.upsert('roadmapTasks', 'taskId', taskObj);
    });

    // Calculate stage progress
    const completedStageCount = stageTasks.filter(t => t.status === 'completed' || t.completed).length;
    const stageProgress = stageTasks.length > 0 
      ? Math.round((completedStageCount / stageTasks.length) * 100) 
      : 0;

    return {
      ...stage,
      stageNumber,
      tasks: stageTasks,
      stageProgress
    };
  });

  const totalTasks = allTasks.length;
  const completedTotal = allTasks.filter(t => t.status === 'completed' || t.completed).length;
  const overallProgress = totalTasks > 0 ? Math.round((completedTotal / totalTasks) * 100) : 0;

  const hydrated = {
    ...roadmap,
    roadmapId,
    userId,
    stages,
    tasks: allTasks,
    overallProgress,
    status: overallProgress === 100 ? 'COMPLETED' : overallProgress > 0 ? 'IN_PROGRESS' : 'NOT_STARTED'
  };

  // Persist roadmap record
  persistentStore.upsert('learningRoadmaps', 'roadmapId', hydrated);

  return hydrated;
}

/**
 * Update a specific task status with server-side validation and progress computation
 */
export async function updateTaskProgress({ taskId, roadmapId, userId = "guest_user", status = "completed", score = null }) {
  if (!taskId) {
    throw new Error("taskId is required");
  }

  const isCompleted = status === "completed";
  const completedAt = isCompleted ? new Date().toISOString() : null;

  // 1. Update in Persistent Disk Storage
  const allRoadmaps = persistentStore.find('learningRoadmaps', { userId });
  let matchedRoadmap = allRoadmaps.find(r => (r.tasks || []).some(t => t.taskId === taskId));

  if (!matchedRoadmap && roadmapId) {
    matchedRoadmap = persistentStore.findOne('learningRoadmaps', { roadmapId, userId });
  }

  if (matchedRoadmap) {
    // Update top-level tasks
    matchedRoadmap.tasks = (matchedRoadmap.tasks || []).map(t => {
      if (t.taskId === taskId) {
        return {
          ...t,
          status,
          completed: isCompleted,
          score: score !== null ? score : t.score,
          completedAt
        };
      }
      return t;
    });

    // Update tasks in stages
    matchedRoadmap.stages = (matchedRoadmap.stages || []).map(stg => {
      const updatedStageTasks = (stg.tasks || []).map(st => {
        if (st.taskId === taskId) {
          return {
            ...st,
            status,
            completed: isCompleted,
            score: score !== null ? score : st.score,
            completedAt
          };
        }
        return st;
      });

      const completedCount = updatedStageTasks.filter(t => t.status === 'completed' || t.completed).length;
      const stageProgress = updatedStageTasks.length > 0 ? Math.round((completedCount / updatedStageTasks.length) * 100) : 0;

      return {
        ...stg,
        tasks: updatedStageTasks,
        stageProgress
      };
    });

    const total = matchedRoadmap.tasks.length;
    const completed = matchedRoadmap.tasks.filter(t => t.status === 'completed' || t.completed).length;
    matchedRoadmap.overallProgress = total > 0 ? Math.round((completed / total) * 100) : 0;
    matchedRoadmap.status = matchedRoadmap.overallProgress === 100 ? 'COMPLETED' : matchedRoadmap.overallProgress > 0 ? 'IN_PROGRESS' : 'NOT_STARTED';

    // Persist updated roadmap & task to disk
    persistentStore.upsert('learningRoadmaps', 'roadmapId', matchedRoadmap);
    persistentStore.upsert('roadmapTasks', 'taskId', {
      taskId,
      roadmapId: matchedRoadmap.roadmapId,
      userId,
      status,
      completed: isCompleted,
      score,
      completedAt
    });

    // 2. Persist to MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      try {
        await LearningRoadmap.findOneAndUpdate(
          { roadmapId: matchedRoadmap.roadmapId, userId },
          matchedRoadmap,
          { upsert: true }
        ).catch(() => {});
      } catch {}
    }

    return {
      success: true,
      taskId,
      roadmapId: matchedRoadmap.roadmapId,
      userId: matchedRoadmap.userId,
      status,
      completed: isCompleted,
      completedAt,
      overallProgress: matchedRoadmap.overallProgress,
      completedCount: completed,
      totalCount: total,
      stages: matchedRoadmap.stages
    };
  }

  // If roadmap not yet registered, update task standalone
  persistentStore.upsert('roadmapTasks', 'taskId', {
    taskId,
    roadmapId: roadmapId || `rdm_${userId}`,
    userId,
    status,
    completed: isCompleted,
    score,
    completedAt
  });

  return {
    success: true,
    taskId,
    roadmapId: roadmapId || `rdm_${userId}`,
    userId,
    status,
    completed: isCompleted,
    completedAt,
    overallProgress: isCompleted ? 20 : 0
  };
}

export default {
  hydrateRoadmapTasks,
  updateTaskProgress
};

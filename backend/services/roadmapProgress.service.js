// agent-notes: { ctx: "Roadmap Task Progress management service with authoritative backend calculation and MongoDB persistence", deps: ["mongoose", "../models/LearningRoadmap.js"], state: "active", last: "anti@2026-08-20" }
import mongoose from 'mongoose';
import LearningRoadmap from '../models/LearningRoadmap.js';

// In-memory store for fallback
export const roadmapMemoryStore = new Map();

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
      const existingTask = (roadmap.tasks || []).find(t => t.taskId === taskId);
      
      const taskObj = {
        taskId,
        roadmapId,
        userId,
        title: topic,
        stageNumber,
        taskType: 'topic',
        difficulty: stage.level || 'Beginner',
        status: existingTask ? existingTask.status : 'pending',
        completed: existingTask ? existingTask.completed : false,
        score: existingTask ? existingTask.score : null,
        completedAt: existingTask ? existingTask.completedAt : null
      };

      stageTasks.push(taskObj);
      allTasks.push(taskObj);
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

  return {
    ...roadmap,
    roadmapId,
    userId,
    stages,
    tasks: allTasks,
    overallProgress,
    status: overallProgress === 100 ? 'COMPLETED' : overallProgress > 0 ? 'IN_PROGRESS' : 'NOT_STARTED'
  };
}

/**
 * Update a specific task status with server-side validation and progress computation
 */
export async function updateTaskProgress({ taskId, roadmapId, userId = "guest_user", status = "completed", score = null }) {
  if (!taskId) {
    throw new Error("taskId is required");
  }

  const isCompleted = status === "completed";
  const completedAt = isCompleted ? new Date() : null;

  let matchedRoadmap = null;

  // 1. Try DB first
  if (mongoose.connection.readyState === 1) {
    try {
      let query = { "tasks.taskId": taskId };
      if (userId && userId !== "guest_user" && mongoose.Types.ObjectId.isValid(userId)) {
        query.userId = userId;
      }

      matchedRoadmap = await LearningRoadmap.findOne(query);

      if (matchedRoadmap) {
        let taskFound = false;

        // Update top-level tasks
        matchedRoadmap.tasks = (matchedRoadmap.tasks || []).map(t => {
          if (t.taskId === taskId) {
            taskFound = true;
            return {
              ...t.toObject(),
              status,
              completed: isCompleted,
              score: score !== null ? score : t.score,
              completedAt
            };
          }
          return t;
        });

        // Update tasks within stages
        matchedRoadmap.stages = (matchedRoadmap.stages || []).map(stg => {
          const updatedStageTasks = (stg.tasks || []).map(st => {
            if (st.taskId === taskId) {
              return {
                ...st.toObject(),
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
            ...stg.toObject(),
            tasks: updatedStageTasks,
            stageProgress
          };
        });

        // Calculate authoritative overall progress on backend
        const total = matchedRoadmap.tasks.length;
        const completed = matchedRoadmap.tasks.filter(t => t.status === 'completed' || t.completed).length;
        matchedRoadmap.overallProgress = total > 0 ? Math.round((completed / total) * 100) : 0;
        matchedRoadmap.status = matchedRoadmap.overallProgress === 100 ? 'COMPLETED' : matchedRoadmap.overallProgress > 0 ? 'IN_PROGRESS' : 'NOT_STARTED';

        await matchedRoadmap.save();

        return {
          success: true,
          taskId,
          roadmapId: matchedRoadmap.roadmapId || matchedRoadmap._id,
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
    } catch (dbErr) {
      console.warn("DB updateTaskProgress warning:", dbErr.message);
    }
  }

  // 2. Memory Store Fallback
  for (const [key, rdm] of roadmapMemoryStore.entries()) {
    const task = (rdm.tasks || []).find(t => t.taskId === taskId);
    if (task) {
      // Verify user if applicable
      if (userId && userId !== "guest_user" && rdm.userId && rdm.userId !== userId) {
        throw new Error("Unauthorized: Task does not belong to the authenticated user");
      }

      task.status = status;
      task.completed = isCompleted;
      task.score = score !== null ? score : task.score;
      task.completedAt = completedAt;

      // Recalculate stage progress
      rdm.stages.forEach(stg => {
        (stg.tasks || []).forEach(st => {
          if (st.taskId === taskId) {
            st.status = status;
            st.completed = isCompleted;
            st.completedAt = completedAt;
          }
        });
        const completedStg = (stg.tasks || []).filter(t => t.status === 'completed' || t.completed).length;
        stg.stageProgress = stg.tasks?.length ? Math.round((completedStg / stg.tasks.length) * 100) : 0;
      });

      // Recalculate overall progress
      const total = rdm.tasks.length;
      const completed = rdm.tasks.filter(t => t.status === 'completed' || t.completed).length;
      rdm.overallProgress = total > 0 ? Math.round((completed / total) * 100) : 0;
      rdm.status = rdm.overallProgress === 100 ? 'COMPLETED' : rdm.overallProgress > 0 ? 'IN_PROGRESS' : 'NOT_STARTED';

      roadmapMemoryStore.set(key, rdm);

      return {
        success: true,
        taskId,
        roadmapId: rdm.roadmapId,
        userId: rdm.userId,
        status,
        completed: isCompleted,
        completedAt,
        overallProgress: rdm.overallProgress,
        completedCount: completed,
        totalCount: total,
        stages: rdm.stages
      };
    }
  }

  // If task not yet in structured store, create a record
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
  updateTaskProgress,
  roadmapMemoryStore
};

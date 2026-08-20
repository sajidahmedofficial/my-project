// agent-notes: { ctx: "Skill Gap Express router providing analyze, roadmap, verify & certificate endpoints with direct MongoDB persistence", deps: ["express", "multer", "pdf-parse", "mongoose", "../models/*"], state: "active", last: "anti@2026-08-20" }
import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import mongoose from 'mongoose';

import SkillGap from '../models/SkillGap.js';
import SkillProgress from '../models/SkillProgress.js';
import SkillAssessment from '../models/SkillAssessment.js';
import LearningRoadmap from '../models/LearningRoadmap.js';
import Certificate from '../models/Certificate.js';

import { performSkillGapAnalysis } from '../services/skillGap.service.js';
import { generatePersonalizedRoadmap } from '../services/roadmapGenerator.service.js';
import { evaluateSkillVerification } from '../services/skillEvaluator.service.js';
import { generateCertificate } from '../services/certificate.service.js';
import { generateStructuredPatch } from '../services/resumeUpdater.service.js';

import { getParsedResume } from '../services/resumeStore.service.js';

const router = express.Router();
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB max

// In-memory store fallback when MongoDB is not connected
const userSkillGapStore = new Map();
const userRoadmapsStore = new Map();
const userVerifiedSkillsStore = new Map();
const userCertificatesStore = new Map();

/**
 * @desc    Analyze Skill Gap from resume and target role / JD
 * @route   POST /api/skill-gap/analyze
 */
router.post('/analyze', upload.single('resume'), async (req, res) => {
  try {
    const resumeId = req.body.resumeId;
    const userId = req.body.userId || req.user?.id || "guest_user";
    const targetRole = req.body.targetRole || "Frontend Developer";
    const jobDescription = req.body.jobDescription || "";

    let resumeText = req.body.resumeText || "";
    let userSkills = [];

    // 1. If resumeId or userId is provided, look up in central parsed resume store
    if (!resumeText && (resumeId || userId)) {
      const stored = getParsedResume(resumeId, userId);
      if (stored && stored.resumeText) {
        resumeText = stored.resumeText;
        if (stored.analysis?.skills?.detected) {
          userSkills = stored.analysis.skills.detected;
        }
      }
    }

    if (req.body.userSkills && (!userSkills || !userSkills.length)) {
      userSkills = typeof req.body.userSkills === 'string' 
        ? JSON.parse(req.body.userSkills) 
        : req.body.userSkills;
    }

    let verifiedSkills = [];
    if (req.body.verifiedSkills) {
      verifiedSkills = typeof req.body.verifiedSkills === 'string'
        ? JSON.parse(req.body.verifiedSkills)
        : req.body.verifiedSkills;
    } else {
      verifiedSkills = userVerifiedSkillsStore.get(userId) || [];
    }

    const gapReport = await performSkillGapAnalysis({
      userSkills,
      resumeText,
      targetRole,
      jobDescription,
      verifiedSkills
    });

    // Store in memory
    userSkillGapStore.set(userId, {
      ...gapReport,
      targetRole,
      userId,
      savedAt: new Date().toISOString()
    });

    // Persist to MongoDB if connected
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(userId)) {
      try {
        await SkillGap.findOneAndUpdate(
          { userId, targetRole },
          {
            userId,
            targetRole,
            overallMatchScore: gapReport.overallMatchScore,
            categoryScores: gapReport.categoryScores,
            strongSkills: gapReport.strongSkills,
            partialSkills: gapReport.partialSkills,
            missingSkills: gapReport.missingSkills,
            updatedAt: new Date()
          },
          { upsert: true, new: true }
        );
      } catch (dbErr) {
        console.warn("MongoDB SkillGap save warning:", dbErr.message);
      }
    }

    res.json({
      success: true,
      targetRole,
      report: gapReport
    });
  } catch (error) {
    console.error("Skill Gap Analysis Route Error:", error);
    res.status(500).json({ error: "Failed to analyze skill gap", message: error.message });
  }
});

/**
 * @desc    Get user's latest skill gap report
 * @route   GET /api/skill-gap/:userId
 */
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  // Try DB first
  if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(userId)) {
    try {
      const dbReport = await SkillGap.findOne({ userId }).sort({ updatedAt: -1 });
      if (dbReport) {
        return res.json({
          success: true,
          report: dbReport
        });
      }
    } catch (e) {}
  }

  const saved = userSkillGapStore.get(userId);
  if (!saved) {
    return res.json({
      success: true,
      report: null,
      message: "No skill gap analysis found for this user."
    });
  }

  res.json({
    success: true,
    report: saved
  });
});

import { hydrateRoadmapTasks, updateTaskProgress, roadmapMemoryStore } from '../services/roadmapProgress.service.js';

/**
 * @desc    Generate or Retrieve Stored Personalized Multi-Stage Learning Roadmap
 * @route   POST /api/skill-gap/roadmap
 */
router.post('/roadmap', async (req, res) => {
  try {
    const { skillGapId, skill, skillName, targetRole, currentLevel, targetLevel, priority, userId, forceRefresh } = req.body;
    const skillToLearn = skill || skillName;

    if (!skillToLearn) {
      return res.status(400).json({ error: "skill or skillName is required" });
    }

    const uId = userId || skillGapId || "guest_user";

    // 1. Check if roadmap is already stored and cached unless forceRefresh is requested
    if (!forceRefresh) {
      if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(uId)) {
        try {
          const dbRoadmap = await LearningRoadmap.findOne({ userId: uId, skillName: skillToLearn });
          if (dbRoadmap) {
            const hydrated = hydrateRoadmapTasks(dbRoadmap.toObject(), uId);
            return res.json({
              success: true,
              roadmap: hydrated,
              cached: true
            });
          }
        } catch (e) {}
      }

      const memRoadmap = roadmapMemoryStore.get(`${uId}_${skillToLearn.toLowerCase()}`) || (userRoadmapsStore.get(uId) || []).find(r => r.skillName?.toLowerCase() === skillToLearn.toLowerCase());
      if (memRoadmap) {
        const hydrated = hydrateRoadmapTasks(memRoadmap, uId);
        return res.json({
          success: true,
          roadmap: hydrated,
          cached: true
        });
      }
    }

    // 2. Generate roadmap through backend generator
    const generated = await generatePersonalizedRoadmap({
      skillName: skillToLearn,
      targetRole: targetRole || "Frontend Developer",
      currentLevel: currentLevel || "Beginner",
      targetLevel: targetLevel || "Advanced",
      priority: priority || "High"
    });

    const roadmap = hydrateRoadmapTasks(generated, uId);

    const userRoadmaps = userRoadmapsStore.get(uId) || [];
    const filtered = userRoadmaps.filter(r => r.skillName?.toLowerCase() !== skillToLearn.toLowerCase());
    userRoadmapsStore.set(uId, [...filtered, roadmap]);
    roadmapMemoryStore.set(`${uId}_${skillToLearn.toLowerCase()}`, roadmap);

    // Persist to MongoDB if connected
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(uId)) {
      try {
        await LearningRoadmap.findOneAndUpdate(
          { userId: uId, skillName: skillToLearn },
          {
            roadmapId: roadmap.roadmapId,
            userId: uId,
            targetRole: targetRole || "Frontend Developer",
            skillName: skillToLearn,
            currentLevel: currentLevel || "Beginner",
            targetLevel: targetLevel || "Advanced",
            stages: roadmap.stages,
            tasks: roadmap.tasks,
            prerequisites: roadmap.prerequisites,
            finalProject: roadmap.finalProject,
            assessmentInfo: roadmap.finalAssessment || roadmap.assessmentInfo,
            overallProgress: roadmap.overallProgress || 0,
            updatedAt: new Date()
          },
          { upsert: true, new: true }
        );
      } catch (dbErr) {
        console.warn("MongoDB LearningRoadmap save warning:", dbErr.message);
      }
    }

    res.json({
      success: true,
      roadmap,
      cached: false
    });
  } catch (error) {
    console.error("Roadmap Generation Route Error:", error);
    res.status(500).json({ error: "Failed to generate roadmap", message: error.message });
  }
});

/**
 * @desc    Get user's stored learning roadmap for a specific skill
 * @route   GET /api/skill-gap/roadmap/:userId/:skillName
 */
router.get('/roadmap/:userId/:skillName', async (req, res) => {
  const { userId, skillName } = req.params;

  if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(userId)) {
    try {
      const dbRoadmap = await LearningRoadmap.findOne({ userId, skillName });
      if (dbRoadmap) {
        const hydrated = hydrateRoadmapTasks(dbRoadmap.toObject(), userId);
        return res.json({
          success: true,
          roadmap: hydrated
        });
      }
    } catch (e) {}
  }

  const memRoadmap = roadmapMemoryStore.get(`${userId}_${skillName.toLowerCase()}`) || (userRoadmapsStore.get(userId) || []).find(r => r.skillName?.toLowerCase() === skillName.toLowerCase());
  
  if (!memRoadmap) {
    return res.status(404).json({
      success: false,
      message: `No stored roadmap found for skill ${skillName}.`
    });
  }

  const hydrated = hydrateRoadmapTasks(memRoadmap, userId);
  res.json({
    success: true,
    roadmap: hydrated
  });
});

/**
 * @desc    Update task status & authoritative progress on the roadmap
 * @route   PATCH /api/skill-gap/roadmap/tasks/:taskId
 */
router.patch('/roadmap/tasks/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status = "completed", score = null, roadmapId, userId } = req.body;
    const uId = userId || req.user?.id || "guest_user";

    const updateResult = await updateTaskProgress({
      taskId,
      roadmapId,
      userId: uId,
      status,
      score
    });

    res.json({
      success: true,
      data: updateResult
    });
  } catch (error) {
    console.error("Update Task Progress Error:", error);
    res.status(500).json({ error: "Failed to update task status", message: error.message });
  }
});

import { getSanitizedQuestionsForSkill, evaluateMcqSubmission } from '../services/skillVerification.service.js';

/**
 * @desc    Get Sanitized MCQ Questions for Skill Verification (No answers exposed to client)
 * @route   GET /api/skill-gap/assessment/questions/:skillName
 */
router.get('/assessment/questions/:skillName', (req, res) => {
  try {
    const { skillName } = req.params;
    const userId = req.query.userId || "guest_user";
    const data = getSanitizedQuestionsForSkill(skillName, userId);
    res.json({
      success: true,
      ...data
    });
  } catch (error) {
    console.error("Fetch Questions Error:", error);
    res.status(500).json({ error: "Failed to load assessment questions", message: error.message });
  }
});

/**
 * @desc    Authoritatively Evaluate MCQ Answers on Backend (Score never accepted from frontend)
 * @route   POST /api/skill-gap/assessment/submit-mcq
 */
router.post('/assessment/submit-mcq', async (req, res) => {
  try {
    const { assessmentId, skillName, userId, answers = [], passingThreshold = 75 } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: "answers array is required" });
    }

    const uId = userId || req.user?.id || "guest_user";
    const evaluation = await evaluateMcqSubmission({
      assessmentId,
      skillName,
      userId: uId,
      answers,
      passingThreshold
    });

    res.json({
      success: true,
      ...evaluation
    });
  } catch (error) {
    console.error("Evaluate MCQ Error:", error);
    res.status(500).json({ error: "Failed to evaluate assessment submission", message: error.message });
  }
});

import { getChallengeForSkill, executeInSandbox } from '../services/codeSandbox.service.js';

/**
 * @desc    Get Coding Challenge for Skill Verification
 * @route   GET /api/skill-gap/assessment/coding/:skillName
 */
router.get('/assessment/coding/:skillName', (req, res) => {
  try {
    const { skillName } = req.params;
    const challenge = getChallengeForSkill(skillName);
    res.json({
      success: true,
      challenge
    });
  } catch (error) {
    console.error("Get Challenge Error:", error);
    res.status(500).json({ error: "Failed to load coding challenge", message: error.message });
  }
});

/**
 * @desc    Execute and Evaluate User Code inside Secure VM Sandbox against Test Cases
 * @route   POST /api/skill-gap/assessment/run-code
 */
router.post('/assessment/run-code', async (req, res) => {
  try {
    const { skillName, userCode, functionName, challengeId } = req.body;

    if (!userCode || typeof userCode !== 'string') {
      return res.status(400).json({ error: "userCode string is required" });
    }

    const challenge = getChallengeForSkill(skillName);
    const targetFunctionName = functionName || challenge.functionName || "solution";
    const testCases = challenge.testCases || [];

    const executionResult = await executeInSandbox({
      userCode,
      functionName: targetFunctionName,
      testCases,
      timeoutMs: 2000
    });

    res.json({
      success: true,
      ...executionResult
    });
  } catch (error) {
    console.error("Code Sandbox Execution Error:", error);
    res.status(500).json({ 
      success: false,
      passedTests: 0,
      totalTests: 0,
      score: 0,
      status: "failed",
      error: error.message || "Failed to execute code in sandbox." 
    });
  }
});

import { verifyProjectRepository } from '../services/projectVerification.service.js';

/**
 * @desc    Verify and inspect GitHub Project Repository Evidence
 * @route   POST /api/skill-gap/assessment/verify-project
 */
router.post('/assessment/verify-project', async (req, res) => {
  try {
    const { repoUrl, skillName, targetRole } = req.body;
    const result = await verifyProjectRepository({ repoUrl, skillName, targetRole });
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error("Project Verification Route Error:", error);
    res.status(500).json({ error: "Failed to verify project repository", message: error.message });
  }
});

/**
 * @desc    Verify Skill through Multi-Modal Assessments (MCQ + Code + Project)
 * @route   POST /api/skill-gap/verify
 */
router.post('/verify', async (req, res) => {
  try {
    const {
      skillName,
      userName,
      userId,
      assessmentId,
      answers,
      mcqAnswers,
      mcqResults,
      userCode,
      code,
      codingResults,
      projectSubmission,
      targetRole
    } = req.body;

    if (!skillName) {
      return res.status(400).json({ error: "skillName is required" });
    }

    const candidateName = userName || "SkillBridge Student";
    const uId = userId || "guest_user";

    // 1. Authoritatively calculate MCQ score from answers if provided
    let calculatedMcqResults = mcqResults || { score: 0, correct: 0, total: 2 };
    const submittedAnswers = answers || mcqAnswers;

    if (submittedAnswers && Array.isArray(submittedAnswers) && submittedAnswers.length > 0) {
      const mcqEval = await evaluateMcqSubmission({
        assessmentId,
        skillName,
        userId: uId,
        answers: submittedAnswers
      });

      calculatedMcqResults = {
        score: mcqEval.score,
        correct: mcqEval.correctCount,
        total: mcqEval.totalQuestions
      };
    }

    // 2. Authoritatively calculate Coding score from sandbox execution if code is provided
    let calculatedCodingResults = codingResults || { score: 0, testsPassed: 0, testsTotal: 1 };
    const codeToTest = userCode || code || codingResults?.code;

    if (codeToTest && typeof codeToTest === 'string') {
      const challenge = getChallengeForSkill(skillName);
      const codeExec = await executeInSandbox({
        userCode: codeToTest,
        functionName: challenge.functionName,
        testCases: challenge.testCases,
        timeoutMs: 2000
      });

      calculatedCodingResults = {
        score: codeExec.score,
        testsPassed: codeExec.passedTests,
        testsTotal: codeExec.totalTests,
        code: codeToTest
      };
    }

    // Run backend evaluation
    const evalResult = await evaluateSkillVerification({
      skillName,
      mcqResults: calculatedMcqResults,
      codingResults: calculatedCodingResults,
      projectSubmission: projectSubmission || { repoUrl: "" },
      passingThreshold: 75
    });

    // Persist assessment result in MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      try {
        await SkillAssessment.create({
          userId: uId,
          skillName,
          mcqScore: evalResult.mcqScore,
          codingScore: evalResult.codingScore,
          projectScore: evalResult.projectScore,
          overallScore: evalResult.overallScore,
          projectUrl: projectSubmission?.repoUrl || "",
          repositoryInfo: evalResult.repositoryInfo,
          passingThreshold: 75,
          status: evalResult.status,
          aiFeedback: evalResult.aiFeedback,
          detailedBreakdown: evalResult.detailedBreakdown
        });
      } catch (dbErr) {
        console.warn("MongoDB SkillAssessment save error:", dbErr.message);
      }
    }

    if (!evalResult.isPassed) {
      return res.json({
        success: false,
        verified: false,
        evaluation: evalResult,
        message: evalResult.aiFeedback || "Verification score below 75% or repository evidence insufficient. Please review feedback and retry."
      });
    }

    // Passed Verification -> Generate Certificate
    const cert = await generateCertificate({
      name: candidateName,
      skill: skillName,
      score: evalResult.overallScore,
      level: "Advanced"
    });

    // Generate structured patch for automatic resume update
    const patch = generateStructuredPatch(skillName, cert.certificateId);

    // Save in verified store
    const currentVerified = userVerifiedSkillsStore.get(uId) || [];
    if (!currentVerified.some(v => v.skillName.toLowerCase() === skillName.toLowerCase())) {
      userVerifiedSkillsStore.set(uId, [
        ...currentVerified,
        {
          skillName,
          score: evalResult.overallScore,
          certificateId: cert.certificateId,
          verifiedAt: new Date().toISOString()
        }
      ]);
    }

    // Save certificate in memory
    const userCerts = userCertificatesStore.get(uId) || [];
    userCertificatesStore.set(uId, [
      ...userCerts,
      {
        skillName,
        certificateId: cert.certificateId,
        score: evalResult.overallScore,
        userName: candidateName,
        issuedAt: new Date().toISOString(),
        pdfUrl: cert.pdfUrl
      }
    ]);

    // Persist to MongoDB if connected
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(uId)) {
      try {
        await SkillAssessment.create({
          userId: uId,
          skillName,
          mcqScore: evalResult.mcqScore,
          codingScore: evalResult.codingScore,
          projectScore: evalResult.projectScore,
          overallScore: evalResult.overallScore,
          passingThreshold: 75,
          status: "PASSED",
          detailedBreakdown: evalResult.detailedBreakdown,
          certificateId: cert.certificateId
        });

        await SkillProgress.findOneAndUpdate(
          { userId: uId, skillName },
          {
            userId: uId,
            skillName,
            status: "GAINED",
            progress: 100,
            certified: true,
            updatedAt: new Date()
          },
          { upsert: true }
        );

        await Certificate.create({
          userId: uId,
          skillName,
          score: evalResult.overallScore,
          certificateId: cert.certificateId,
          verificationHash: cert.verificationHash || `hash_${Date.now()}`,
          pdfPath: cert.pdfUrl
        });
      } catch (dbErr) {
        console.warn("MongoDB Verification persistence warning:", dbErr.message);
      }
    }

    res.json({
      success: true,
      verified: true,
      evaluation: evalResult,
      certificate: cert,
      resumePatch: patch,
      message: `Congratulations! ${skillName} has been verified with a score of ${evalResult.overallScore}%. Certificate issued and resume updated.`
    });

  } catch (error) {
    console.error("Skill Verification Route Error:", error);
    res.status(500).json({ error: "Failed to verify skill", message: error.message });
  }
});

/**
 * @desc    Get user's verified skills
 * @route   GET /api/skills/verified
 */
router.get('/skills/verified', async (req, res) => {
  const userId = req.query.userId || "guest_user";

  if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(userId)) {
    try {
      const dbProgress = await SkillProgress.find({ userId, status: 'GAINED' });
      if (dbProgress && dbProgress.length) {
        return res.json({
          success: true,
          verifiedSkills: dbProgress.map(p => ({
            skillName: p.skillName,
            score: 100,
            verifiedAt: p.updatedAt
          }))
        });
      }
    } catch (e) {}
  }

  const verified = userVerifiedSkillsStore.get(userId) || [];
  res.json({
    success: true,
    verifiedSkills: verified
  });
});

export default router;

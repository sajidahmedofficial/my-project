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
import { issueVerifiedCertificate, generateCertificate } from '../services/certificate.service.js';
import { generateStructuredPatch, updateResumeWithVerifiedSkill } from '../services/resumeUpdater.service.js';

import { getParsedResume } from '../services/resumeStore.service.js';
import persistentStore from '../storage/persistentStore.js';
import UserSkill from '../models/UserSkill.js';
import RoadmapTask from '../models/RoadmapTask.js';
import SkillVerification from '../models/SkillVerification.js';
import AssessmentResult from '../models/AssessmentResult.js';

import { authenticateUser, getAuthenticatedUserId, enforceUserOwnership } from '../middleware/auth.js';
import { validateUploadedFile, sanitizePromptInput, validateGitHubUrl } from '../utils/security.js';

const router = express.Router();
router.use(authenticateUser);

const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB max

/**
 * @desc    Analyze Skill Gap from resume and target role / JD
 * @route   POST /api/skill-gap/analyze
 */
router.post('/analyze', upload.single('resume'), async (req, res) => {
  try {
    // 1. Validate File Upload Security
    if (req.file) {
      const fileValidation = validateUploadedFile(req.file);
      if (!fileValidation.valid) {
        return res.status(400).json({ error: "File validation failed", message: fileValidation.error });
      }
    }

    const resumeId = req.body.resumeId;
    const userId = getAuthenticatedUserId(req);
    const targetRole = req.body.targetRole || "Frontend Developer";
    const jobDescription = sanitizePromptInput(req.body.jobDescription || "");

    let resumeText = sanitizePromptInput(req.body.resumeText || "");
    let userSkills = [];

    // 1. If resumeId or userId is provided, look up in persistent resume store
    if (!resumeText && (resumeId || userId)) {
      const stored = getParsedResume(resumeId, userId);
      if (stored) {
        resumeText = stored.resumeText;
        if (stored.analysis?.extractedSkills?.length) {
          userSkills = stored.analysis.extractedSkills;
        } else if (stored.analysis?.skills?.detected?.length) {
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
      const storedSkills = persistentStore.find('userSkills', { userId, status: 'verified' });
      verifiedSkills = storedSkills.map(s => s.skillName);
    }

    const gapReport = await performSkillGapAnalysis({
      userSkills,
      resumeText,
      targetRole,
      jobDescription,
      verifiedSkills
    });

    const skillGapId = `sg_${userId}_${targetRole.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    // Store in persistent disk storage
    const persistentRecord = {
      skillGapId,
      userId,
      resumeId: resumeId || null,
      targetRole,
      ...gapReport,
      savedAt: new Date().toISOString()
    };
    persistentStore.upsert('skillGaps', 'skillGapId', persistentRecord);

    // Persist individual skills to userSkills collection
    (gapReport.skills || []).forEach(s => {
      persistentStore.upsert('userSkills', 'id', {
        id: `usk_${userId}_${s.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        userId,
        resumeId: resumeId || null,
        skillGapId,
        skillName: s.name,
        category: s.category,
        status: s.status,
        currentLevel: s.currentLevel,
        requiredLevel: s.requiredLevel,
        gapPercentage: s.gapPercentage,
        priority: s.priority
      });
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
  const authUserId = getAuthenticatedUserId(req);

  // Enforce user ownership
  if (authUserId !== 'guest_user' && userId !== authUserId) {
    return res.status(403).json({
      error: "Access Denied",
      message: "You cannot access another user's Skill Gap report."
    });
  }

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

  const savedReports = persistentStore.find('skillGaps', { userId });
  const saved = savedReports.length > 0 ? savedReports[savedReports.length - 1] : null;
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

import { hydrateRoadmapTasks, updateTaskProgress } from '../services/roadmapProgress.service.js';

/**
 * @desc    Generate or Retrieve Stored Personalized Multi-Stage Learning Roadmap
 * @route   POST /api/skill-gap/roadmap
 */
router.post('/roadmap', async (req, res) => {
  try {
    const { skill, skillName, targetRole, currentLevel, targetLevel, forceRefresh } = req.body;
    const skillToLearn = skill || skillName;

    if (!skillToLearn) {
      return res.status(400).json({ error: "skill or skillName is required" });
    }

    const uId = getAuthenticatedUserId(req);

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

      // Check persistent disk storage for cached roadmap for this user and skill
      const storedRoadmap = persistentStore.findOne('learningRoadmaps', { skillName: skillToLearn, userId: uId });
      if (storedRoadmap) {
        const hydrated = hydrateRoadmapTasks(storedRoadmap, uId);
        return res.json({
          success: true,
          roadmap: hydrated,
          cached: true
        });
      }
    }

    // 2. Generate new roadmap with Gemini
    const rawRoadmap = await generatePersonalizedRoadmap({
      skillName: skillToLearn,
      targetRole: targetRole || "Frontend Developer",
      currentLevel: currentLevel || "Beginner",
      targetLevel: targetLevel || "Advanced"
    });

    const roadmap = hydrateRoadmapTasks(rawRoadmap, uId);

    // Save to persistent storage
    persistentStore.upsert('learningRoadmaps', 'roadmapId', roadmap);

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
  const authUserId = getAuthenticatedUserId(req);

  // Enforce user ownership
  if (authUserId !== 'guest_user' && userId !== authUserId) {
    return res.status(403).json({
      error: "Access Denied",
      message: "You cannot access another user's Learning Roadmap."
    });
  }

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

  const storedRoadmap = persistentStore.findOne('learningRoadmaps', { skillName, userId });
  
  if (!storedRoadmap) {
    return res.status(404).json({
      success: false,
      message: `No stored roadmap found for skill ${skillName}.`
    });
  }

  const hydrated = hydrateRoadmapTasks(storedRoadmap, userId);
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
    const { status = "completed", score = null, roadmapId } = req.body;
    const uId = getAuthenticatedUserId(req);

    // Enforce task ownership
    const existingTask = persistentStore.findOne('roadmapTasks', { taskId });
    if (existingTask && existingTask.userId !== uId && uId !== 'guest_user') {
      return res.status(403).json({
        error: "Access Denied",
        message: "You cannot modify another user's roadmap task."
      });
    }

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

    const candidateName = userName || req.user?.name || "SkillBridge Student";
    const uId = getAuthenticatedUserId(req);

    // 1. Authoritatively calculate MCQ score from answers if provided
    let calculatedMcqResults = null;
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
    } else if (mcqResults && typeof mcqResults.score === 'number') {
      calculatedMcqResults = mcqResults;
    }

    // 2. Authoritatively calculate Coding score from sandbox execution if code is provided
    let calculatedCodingResults = null;
    const codeToTest = userCode || code || codingResults?.code;

    if (codeToTest && typeof codeToTest === 'string' && codeToTest.trim()) {
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
    } else if (codingResults && typeof codingResults.score === 'number') {
      calculatedCodingResults = codingResults;
    }

    // 3. Project submission validation & SSRF Defense
    let cleanProjectSubmission = null;
    const submittedRepoUrl = projectSubmission?.repoUrl || (typeof projectSubmission === 'string' ? projectSubmission : "");
    if (submittedRepoUrl && typeof submittedRepoUrl === 'string' && submittedRepoUrl.trim()) {
      const ghCheck = validateGitHubUrl(submittedRepoUrl);
      if (!ghCheck.valid) {
        return res.status(400).json({ error: "Invalid repository URL", message: ghCheck.error });
      }
      cleanProjectSubmission = { repoUrl: ghCheck.cleanUrl };
    }

    // Run backend authoritative evaluation (returns status: "pending" with exact reason if any component is missing)
    const evalResult = await evaluateSkillVerification({
      skillName,
      mcqResults: calculatedMcqResults,
      codingResults: calculatedCodingResults,
      projectSubmission: cleanProjectSubmission,
      passingThreshold: 80
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
          overallScore: evalResult.finalScore,
          projectUrl: projectSubmission?.repoUrl || "",
          repositoryInfo: evalResult.repositoryInfo,
          passingThreshold: 80,
          status: evalResult.status === 'verified' ? 'VERIFIED' : (evalResult.status === 'pending' ? 'PENDING' : 'FAILED'),
          aiFeedback: evalResult.feedback,
          detailedBreakdown: evalResult.detailedBreakdown
        });
      } catch (dbErr) {
        console.warn("MongoDB SkillAssessment save error:", dbErr.message);
      }
    }

    if (evalResult.status !== 'verified' || !evalResult.verified) {
      return res.json({
        success: false,
        verified: false,
        status: evalResult.status,
        finalScore: evalResult.finalScore,
        evaluation: evalResult,
        message: evalResult.feedback || "Verification threshold (80%) not met or component pending. Please review feedback and retry."
      });
    }

    // Passed Verification -> Generate Authentic Unique Certificate
    const cert = await issueVerifiedCertificate({
      userId: uId,
      userName: candidateName,
      skillName,
      verificationStatus: "verified",
      finalScore: evalResult.finalScore,
      passingThreshold: 80
    });

    // Generate structured patch for automatic resume update
    const patch = generateStructuredPatch(skillName, cert.certificateId, evalResult.finalScore);

    // 1. Save SkillVerification to persistent disk storage
    const verificationRecord = {
      verificationId: `ver_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      userId: uId,
      skillName,
      mcqScore: evalResult.mcqScore,
      codingScore: evalResult.codingScore,
      projectScore: evalResult.projectScore,
      finalScore: evalResult.finalScore,
      passingThreshold: 80,
      status: 'verified',
      repositoryUrl: evalResult.repositoryInfo?.repoUrl || "",
      repositoryName: evalResult.repositoryInfo?.repoName || "",
      evidence: evalResult.repositoryInfo?.evidence || [],
      certificateId: cert.certificateId,
      verifiedAt: new Date().toISOString()
    };
    persistentStore.upsert('skillVerifications', 'verificationId', verificationRecord);

    // 2. Save UserSkill to persistent disk storage
    persistentStore.upsert('userSkills', 'id', {
      id: `usk_${uId}_${skillName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      userId: uId,
      skillName,
      status: 'verified',
      currentLevel: 100,
      gapPercentage: 0,
      verified: true,
      verifiedScore: evalResult.finalScore,
      verifiedAt: new Date().toISOString(),
      certificateId: cert.certificateId
    });

    // 3. Save Certificate to persistent disk storage
    const certRecord = {
      certificateId: cert.certificateId,
      userId: uId,
      skillName,
      score: evalResult.finalScore,
      userName: candidateName,
      pdfUrl: cert.pdfUrl,
      issuedAt: new Date().toISOString()
    };
    persistentStore.upsert('certificates', 'certificateId', certRecord);

    // Persist to MongoDB if connected
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(uId)) {
      try {
        await SkillAssessment.create({
          userId: uId,
          skillName,
          mcqScore: evalResult.mcqScore,
          codingScore: evalResult.codingScore,
          projectScore: evalResult.projectScore,
          overallScore: evalResult.finalScore,
          passingThreshold: 80,
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
          score: evalResult.finalScore,
          certificateId: cert.certificateId,
          verificationHash: cert.verificationHash || `hash_${Date.now()}`,
          pdfPath: cert.pdfUrl
        });
      } catch (dbErr) {
        console.warn("MongoDB Verification persistence warning:", dbErr.message);
      }
    }

    // 4. Automatically update Resume with Verified Skill snapshot & job match recalculation
    let resumeUpdate = null;
    try {
      resumeUpdate = await updateResumeWithVerifiedSkill({
        userId: uId,
        skillName,
        score: evalResult.finalScore,
        certificateCode: cert.certificateId,
        targetRole: targetRole || "Frontend Developer"
      });
    } catch (rErr) {
      console.warn("Automatic resume update warning:", rErr.message);
    }

    res.json({
      success: true,
      verified: true,
      status: evalResult.status,
      finalScore: evalResult.finalScore,
      evaluation: evalResult,
      certificate: cert,
      resumePatch: patch,
      resumeUpdate,
      recalculatedMatch: resumeUpdate?.recalculatedMatch,
      message: `Congratulations! ${skillName} has been verified with a score of ${evalResult.finalScore}%. Certificate issued and resume updated.`
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
  const userId = getAuthenticatedUserId(req);

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

  const storedVerified = persistentStore.find('userSkills', { userId, status: 'verified' });
  res.json({
    success: true,
    verifiedSkills: storedVerified.map(s => ({
      skillName: s.skillName,
      score: s.verifiedScore || 100,
      certificateId: s.certificateId,
      verifiedAt: s.verifiedAt
    }))
  });
});

export default router;

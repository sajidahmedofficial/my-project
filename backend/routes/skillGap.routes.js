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

/**
 * @desc    Generate Personalized Multi-Stage Learning Roadmap
 * @route   POST /api/skill-gap/roadmap
 */
router.post('/roadmap', async (req, res) => {
  try {
    const { skillName, targetRole, currentLevel, targetLevel, priority, userId } = req.body;

    if (!skillName) {
      return res.status(400).json({ error: "skillName is required" });
    }

    const roadmap = await generatePersonalizedRoadmap({
      skillName,
      targetRole: targetRole || "Frontend Developer",
      currentLevel: currentLevel || "Beginner",
      targetLevel: targetLevel || "Advanced",
      priority: priority || "High"
    });

    const uId = userId || "guest_user";
    const userRoadmaps = userRoadmapsStore.get(uId) || [];
    const filtered = userRoadmaps.filter(r => r.skillName.toLowerCase() !== skillName.toLowerCase());
    userRoadmapsStore.set(uId, [...filtered, roadmap]);

    // Persist to MongoDB if connected
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(uId)) {
      try {
        await LearningRoadmap.findOneAndUpdate(
          { userId: uId, skillName },
          {
            userId: uId,
            targetRole: targetRole || "Frontend Developer",
            skillName,
            currentLevel: currentLevel || "Beginner",
            targetLevel: targetLevel || "Advanced",
            stages: roadmap.stages,
            finalProject: roadmap.finalProject,
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
      roadmap
    });
  } catch (error) {
    console.error("Roadmap Generation Route Error:", error);
    res.status(500).json({ error: "Failed to generate roadmap", message: error.message });
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
      mcqResults,
      codingResults,
      projectSubmission,
      targetRole
    } = req.body;

    if (!skillName) {
      return res.status(400).json({ error: "skillName is required" });
    }

    const candidateName = userName || "SkillBridge Student";
    const uId = userId || "guest_user";

    // Run backend evaluation
    const evalResult = await evaluateSkillVerification({
      skillName,
      mcqResults: mcqResults || { score: 0, correct: 0, total: 2 },
      codingResults: codingResults || { score: 0, testsPassed: 0, testsTotal: 1 },
      projectSubmission: projectSubmission || { repoUrl: "" },
      passingThreshold: 75
    });

    if (!evalResult.isPassed) {
      return res.json({
        success: false,
        verified: false,
        evaluation: evalResult,
        message: "Verification score below 75% or invalid project submission. Please review feedback and retry."
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

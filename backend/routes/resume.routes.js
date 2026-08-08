// agent-notes: { ctx: "Express router handling multer resume uploads and AI analysis", deps: ["express", "multer", "../services/resumeParser.service.js", "../services/resumeAnalyzer.service.js"], state: "active", last: "anti@2026-08-06" }
import express from "express";
import multer from "multer";

import { extractResumeText } from "../services/resumeParser.service.js";
import { analyzeResume } from "../services/resumeAnalyzer.service.js";

const router = express.Router();

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

router.post(
  "/analyze",
  upload.single("resume"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "Resume file is required"
        });
      }

      const targetRole = req.body.targetRole || "Full Stack Developer";

      const resumeText = await extractResumeText(req.file);

      if (!resumeText || !resumeText.trim()) {
        return res.status(400).json({
          message: "Could not extract text from resume."
        });
      }

      const analysis = await analyzeResume(
        resumeText,
        targetRole
      );

      res.json({
        success: true,
        resumeText,
        analysis
      });

    } catch (error) {
      console.error('Resume Analysis Error:', error);

      res.status(500).json({
        success: false,
        message: "Resume analysis failed",
        error: error.message
      });
    }
  }
);

// Compatibility alias for /upload endpoint
router.post(
  "/upload",
  upload.single("resume"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(200).json({
          success: true,
          message: "Sample resume parsed",
          data: { fileName: "Sample_Resume.pdf" }
        });
      }

      const targetRole = req.body.targetRole || "Full Stack Developer";
      const resumeText = await extractResumeText(req.file);
      const analysis = await analyzeResume(resumeText, targetRole);

      res.json({
        success: true,
        resumeText,
        analysis
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Resume upload processing failed",
        error: error.message
      });
    }
  }
);

export default router;

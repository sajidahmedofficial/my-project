// agent-notes: { ctx: "Express router handling resume file upload, text extraction, and structured AI evaluation", deps: ["express", "multer", "../services/resumeParser.service.js", "../services/resumeAnalyzer.service.js", "../middleware/rateLimiter.js"], state: "active", last: "anti@2026-08-29" }

import express from "express";
import multer from "multer";
import { extractResumeText } from "../services/resumeParser.service.js";
import { analyzeResume } from "../services/resumeAnalyzer.service.js";
import { resumeAnalyzeLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedExts = [".pdf", ".docx", ".doc"];
    const isAllowed = allowedExts.some(ext => file.originalname.toLowerCase().endsWith(ext)) ||
                      file.mimetype === "application/pdf" ||
                      file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
                      file.mimetype === "application/msword";

    if (isAllowed) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file format. Please upload a PDF (.pdf) or Word document (.docx)."), false);
    }
  }
});

/**
 * POST /api/resume/analyze
 * Primary endpoint for uploading resume + optional target job description.
 */
router.post(
  "/analyze",
  resumeAnalyzeLimiter,
  (req, res, next) => {
    upload.single("resume")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            error: "File size exceeds the 5MB limit. Please upload a smaller resume file."
          });
        }
        return res.status(400).json({ success: false, error: err.message });
      } else if (err) {
        return res.status(400).json({ success: false, error: err.message });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      const jobDescription = req.body.jobDescription || "";
      const targetRole = req.body.targetRole || "";
      let resumeText = req.body.resumeText || "";

      // 1. Extract text from uploaded file if present
      if (req.file) {
        resumeText = await extractResumeText(req.file);
      }

      if (!resumeText || !resumeText.trim()) {
        return res.status(400).json({
          success: false,
          error: "No resume content detected. Please upload a valid PDF/DOCX or paste resume text."
        });
      }

      // 2. Perform structured AI analysis
      const analysis = await analyzeResume(resumeText, {
        jobDescription,
        targetRole
      });

      res.json({
        success: true,
        fileName: req.file?.originalname || "Pasted Resume Text",
        fileSize: req.file?.size || resumeText.length,
        resumeText,
        jobDescription,
        analysis
      });

    } catch (error) {
      console.error("[Resume Routes] Analysis error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to analyze resume. Please try again."
      });
    }
  }
);

/**
 * POST /api/resume/upload (Legacy / Compatibility Alias)
 */
router.post(
  "/upload",
  upload.single("resume"),
  async (req, res) => {
    try {
      let resumeText = req.body.resumeText || "";
      if (req.file) {
        resumeText = await extractResumeText(req.file);
      } else if (!resumeText) {
        resumeText = "Sample developer resume with JavaScript, React, Node.js, and SQL.";
      }

      const analysis = await analyzeResume(resumeText, {
        targetRole: req.body.targetRole || "Full Stack Developer"
      });

      res.json({
        success: true,
        fileName: req.file?.originalname || "Sample_Resume.pdf",
        resumeText,
        analysis
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message || "Upload processing failed."
      });
    }
  }
);

export default router;

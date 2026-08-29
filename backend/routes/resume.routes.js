// agent-notes: { ctx: "Express router handling resume file upload, text extraction, structured AI evaluation, and scan history", deps: ["express", "multer", "../services/resumeParser.service.js", "../services/resumeAnalyzer.service.js", "../services/resumeStore.service.js", "../middleware/rateLimiter.js"], state: "active", last: "anti@2026-08-29" }

import express from "express";
import multer from "multer";
import { extractResumeText } from "../services/resumeParser.service.js";
import { analyzeResume } from "../services/resumeAnalyzer.service.js";
import { saveParsedResume, getAllResumes, getParsedResume, deleteParsedResume } from "../services/resumeStore.service.js";
import { resumeAnalyzeLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

function getUserId(req) {
  return req.user?.id || req.headers["x-user-id"] || "guest_user";
}

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
      const userId = getUserId(req);

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

      // 3. Persist record in storage
      const savedRecord = saveParsedResume({
        userId,
        fileName: req.file?.originalname || "Pasted Resume Text",
        resumeText,
        analysis,
        targetRole,
        jobDescription
      });

      res.json({
        success: true,
        id: savedRecord.id,
        fileName: savedRecord.fileName,
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
 * GET /api/resume/history
 * List past resume analyses
 */
router.get("/history", async (req, res) => {
  try {
    const userId = getUserId(req);
    const history = getAllResumes(userId);
    res.json({
      success: true,
      history: history.map(item => ({
        id: item.id || item.resumeId,
        fileName: item.fileName,
        overall_score: item.overall_score || item.analysis?.overall_score || 75,
        ats_score: item.ats_score || item.analysis?.ats_compatibility?.score || 75,
        targetRole: item.targetRole,
        createdAt: item.createdAt || item.updatedAt
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to load history." });
  }
});

/**
 * GET /api/resume/history/:id
 * Retrieve a specific past analysis
 */
router.get("/history/:id", async (req, res) => {
  try {
    const userId = getUserId(req);
    const record = getParsedResume(req.params.id, userId);
    if (!record) {
      return res.status(404).json({ success: false, error: "Resume analysis record not found." });
    }
    res.json({
      success: true,
      record
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to retrieve record." });
  }
});

/**
 * DELETE /api/resume/history/:id
 * Delete a past scan record
 */
router.delete("/history/:id", async (req, res) => {
  try {
    const userId = getUserId(req);
    const deleted = deleteParsedResume(req.params.id, userId);
    if (!deleted) {
      return res.status(404).json({ success: false, error: "Record not found or not deletable." });
    }
    res.json({ success: true, message: "Record deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to delete record." });
  }
});

export default router;

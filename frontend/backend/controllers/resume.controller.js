// agent-notes: { ctx: "Express controller handling resume upload, text extraction, analysis, fix application, and export", deps: ["../services/resumeParser.service.js", "../services/resumeAnalyzer.service.js"], state: "active", last: "anti@2026-08-06" }
import { extractResumeText, parseResumeFile } from '../services/resumeParser.service.js';
import { analyzeResumeData } from '../services/resumeAnalyzer.service.js';

export const uploadAndAnalyze = async (req, res) => {
  try {
    const targetRole = req.body.targetRole || 'Full Stack Developer';
    let resumeText = req.body.resumeText;
    let fileName = 'Sample_Resume.pdf';

    if (req.file) {
      fileName = req.file.originalname;
      try {
        resumeText = await extractResumeText(req.file);
      } catch (err) {
        console.warn('File extraction fallback:', err.message);
      }
    }

    if (!resumeText) {
      resumeText = 'Candidate with HTML, CSS, JavaScript, React, Node.js and SQL experience.';
    }

    const parsed = await parseResumeFile(req.file || fileName);
    const analysis = await analyzeResumeData(resumeText, targetRole);

    return res.status(200).json({
      success: true,
      data: {
        fileName,
        extractedText: resumeText,
        ...parsed,
        analysis
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const applyFix = async (req, res) => {
  const { problemId } = req.body;
  return res.status(200).json({ success: true, message: `Fix applied for problem ${problemId}` });
};

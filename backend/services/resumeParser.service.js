// agent-notes: { ctx: "Robust in-memory resume parser extracting plain text from PDF and DOCX buffers with graceful error handling", deps: ["pdf-parse", "mammoth", "fs"], state: "active", last: "anti@2026-08-29" }

import fs from "fs";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

/**
 * Extracts plain text from an uploaded file object or buffer.
 * Supports PDF (.pdf) and Word documents (.docx, .doc).
 * 
 * @param {Object|Buffer} file - Multer file object or raw Buffer
 * @returns {Promise<string>} Parsed plain text
 */
export async function extractResumeText(file) {
  if (!file) {
    throw new Error("No resume file was provided for parsing.");
  }

  let buffer;
  let originalName = "";
  let mimeType = "";

  if (Buffer.isBuffer(file)) {
    buffer = file;
  } else if (file.buffer && Buffer.isBuffer(file.buffer)) {
    buffer = file.buffer;
    originalName = file.originalname || "";
    mimeType = file.mimetype || "";
  } else if (file.path && fs.existsSync(file.path)) {
    buffer = fs.readFileSync(file.path);
    originalName = file.originalname || file.path;
    mimeType = file.mimetype || "";
  } else {
    throw new Error("Invalid file upload format: missing readable buffer or path.");
  }

  if (!buffer || buffer.length === 0) {
    throw new Error("Uploaded resume file is empty (0 bytes).");
  }

  const isPDF = mimeType === "application/pdf" || originalName.toLowerCase().endsWith(".pdf");
  const isDocx = mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
                mimeType === "application/msword" ||
                originalName.toLowerCase().endsWith(".docx") ||
                originalName.toLowerCase().endsWith(".doc");

  // 1. PDF Parsing
  if (isPDF) {
    try {
      const parsed = await pdfParse(buffer, {
        // Max pages limit for safety and speed
        max: 10
      });
      const text = parsed?.text?.trim();
      if (text && text.length > 20) {
        return cleanExtractedText(text);
      }
    } catch (err) {
      console.warn("[Resume Parser] pdf-parse failed, attempting UTF-8 fallback:", err.message);
    }

    // Fallback: UTF-8 scan for plain-text embedded PDFs
    const utfText = buffer.toString("utf-8").replace(/[^\x20-\x7E\n\r\t]/g, " ").trim();
    if (utfText.length > 50) {
      return cleanExtractedText(utfText);
    }
    throw new Error("Unable to parse text from the PDF file. The file may be image-only, scanned, encrypted, or corrupted.");
  }

  // 2. DOCX Parsing
  if (isDocx) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      const text = result?.value?.trim();
      if (text && text.length > 20) {
        return cleanExtractedText(text);
      }
    } catch (err) {
      console.warn("[Resume Parser] mammoth DOCX extraction failed:", err.message);
    }

    const utfText = buffer.toString("utf-8").replace(/[^\x20-\x7E\n\r\t]/g, " ").trim();
    if (utfText.length > 50) {
      return cleanExtractedText(utfText);
    }
    throw new Error("Unable to parse text from the DOCX file. The document may be password-protected or corrupted.");
  }

  // 3. Fallback for plain text or unknown document types
  const plainText = buffer.toString("utf-8").trim();
  if (plainText.length > 20) {
    return cleanExtractedText(plainText);
  }

  throw new Error(`Unsupported resume format: "${originalName || mimeType}". Please upload a valid PDF (.pdf) or Word document (.docx).`);
}

/**
 * Normalizes and cleans raw extracted resume text
 */
function cleanExtractedText(text) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, " ")
    .replace(/ +/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default {
  extractResumeText
};

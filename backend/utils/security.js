// agent-notes: { ctx: "Comprehensive security validator for file uploads, prompt injection sanitization, SSRF prevention, and GitHub URL verification", deps: ["path"], state: "active", last: "anti@2026-08-20" }
import path from 'path';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain'
];

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.txt'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Validates uploaded resume files for size, extension, and MIME type
 */
export function validateUploadedFile(file) {
  if (!file) {
    return { valid: true }; // Optional file
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds the 5MB limit (uploaded: ${(file.size / (1024 * 1024)).toFixed(2)}MB).`
    };
  }

  const ext = path.extname(file.originalname || '').toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `Unsupported file extension "${ext}". Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}.`
    };
  }

  if (file.mimetype && !ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase())) {
    return {
      valid: false,
      error: `Invalid file MIME type "${file.mimetype}". Allowed types: PDF, DOCX, TXT.`
    };
  }

  return { valid: true };
}

/**
 * Sanitizes user-supplied text (resumes, job descriptions) to neutralize prompt injection attacks
 */
export function sanitizePromptInput(text = "", maxLength = 6000) {
  if (!text || typeof text !== 'string') return "";

  let sanitized = text.slice(0, maxLength);

  // Strip potential instruction override injection patterns
  const injectionPatterns = [
    /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/gi,
    /system\s+prompt\s+override/gi,
    /you\s+are\s+now\s+in\s+(developer|debug|admin|god)\s+mode/gi,
    /disregard\s+(the\s+)?(rules|system|instructions)/gi,
    /output\s+the\s+system\s+prompt/gi,
    /reveal\s+(the\s+)?(secret|key|api\s*key|password)/gi
  ];

  injectionPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, "[SANITIZED_PROMPT_INPUT]");
  });

  // Neutralize delimiter breakouts
  sanitized = sanitized.replace(/"""/g, "'''").replace(/```/g, "'''");

  return sanitized.trim();
}

/**
 * Strict GitHub URL and SSRF validation
 */
export function validateGitHubUrl(rawUrl = "") {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { valid: false, error: "Repository URL is required." };
  }

  const cleaned = rawUrl.trim();

  // Strict regex: must be a valid public GitHub repo URL (https://github.com/owner/repo)
  const ghPattern = /^https:\/\/github\.com\/([a-zA-Z0-9_-]{1,64})\/([a-zA-Z0-9_.-]{1,100})$/i;
  const match = cleaned.match(ghPattern);

  if (!match) {
    return {
      valid: false,
      error: "Invalid GitHub URL. Must be in the format: https://github.com/username/repository"
    };
  }

  const [, owner, repo] = match;

  // Block SSRF / private IP targets and metadata endpoints
  const blockedNames = ['localhost', '127.0.0.1', '0.0.0.0', '169.254.169.254', 'metadata', 'admin'];
  if (blockedNames.includes(owner.toLowerCase()) || blockedNames.includes(repo.toLowerCase())) {
    return { valid: false, error: "Repository URL contains forbidden hostname or path." };
  }

  return {
    valid: true,
    owner,
    repo: repo.replace(/\.git$/, ''),
    cleanUrl: `https://github.com/${owner}/${repo.replace(/\.git$/, '')}`
  };
}

export default {
  validateUploadedFile,
  sanitizePromptInput,
  validateGitHubUrl,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE_BYTES
};

// agent-notes: { ctx: "Express rate limiting middleware protecting Gemini AI and analysis endpoints from quota exhaustion", deps: ["express-rate-limit"], state: "active", last: "anti@2026-08-25" }
import rateLimit from 'express-rate-limit';

/**
 * Standard AI / Gemini Rate Limiter: 60 requests per 15-minute window per IP.
 */
export const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // Limit each IP to 60 AI requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too Many Requests',
    message: 'Rate limit exceeded for AI generation and analysis. Please try again after 15 minutes.'
  }
});

/**
 * Strict Resume / File Parsing Rate Limiter: 30 requests per 15-minute window per IP.
 */
export const resumeAnalyzeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too Many Requests',
    message: 'Resume analysis rate limit reached. Please wait before submitting more files.'
  }
});

export default {
  aiRateLimiter,
  resumeAnalyzeLimiter
};

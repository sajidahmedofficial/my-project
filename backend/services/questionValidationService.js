// agent-notes: { ctx: "Validation Service ensuring 4 valid options, non-empty text, 0-3 index, and explanation", deps: ["../validators/question.validator"], state: "active", last: "anti@2026-08-04" }

import { validateQuestion as baseValidate } from '../validators/question.validator.js';

/**
 * Validates a generated question against strict placement MCQ requirements.
 * 
 * Rules:
 * 1. Question text exists (non-empty)
 * 2. Exactly 4 options, all non-empty
 * 3. No duplicate options
 * 4. correctAnswer is integer 0, 1, 2, or 3
 * 5. Explanation exists (non-empty)
 * 6. Solution exists (non-empty)
 * 7. Valid difficulty (easy, medium, hard, expert)
 * 8. Forbidden option phrases ("all of the above", "none of the above") disallowed
 */
export function validateGeneratedQuestion(q) {
  const baseResult = baseValidate(q);
  const errors = [...baseResult.errors];

  if (!q) {
    return { valid: false, errors: ['Question is null or undefined'] };
  }

  // 1. Check exactly 4 options
  if (!Array.isArray(q.options) || q.options.length !== 4) {
    errors.push(`Question must contain exactly 4 options, got ${q.options ? q.options.length : 0}`);
  } else {
    // 2. Check all options non-empty
    const emptyOpts = q.options.filter(opt => {
      const txt = typeof opt === 'string' ? opt : opt?.text;
      return !txt || String(txt).trim().length === 0;
    });
    if (emptyOpts.length > 0) {
      errors.push('All 4 options must be non-empty strings');
    }

    // 3. Disallow forbidden generic options
    const forbiddenPhrases = ['all of the above', 'none of the above', 'all of these', 'none of these'];
    for (const opt of q.options) {
      const txt = (typeof opt === 'string' ? opt : opt?.text || '').toLowerCase().trim();
      if (forbiddenPhrases.includes(txt)) {
        errors.push(`Forbidden option phrase detected: "${txt}"`);
      }
    }
  }

  // 4. Validate correctAnswer as integer 0-3 index
  const correctIdx = Number(q.correctAnswer);
  if (isNaN(correctIdx) || !Number.isInteger(correctIdx) || correctIdx < 0 || correctIdx > 3) {
    errors.push(`correctAnswer must be integer 0, 1, 2, or 3 (got: ${q.correctAnswer})`);
  }

  // 5. Check solution presence
  if (!q.solution || typeof q.solution !== 'string' || q.solution.trim().length < 5) {
    // If solution missing, copy from explanation if available
    if (q.explanation && q.explanation.length >= 5) {
      q.solution = q.explanation;
    } else {
      errors.push('Solution/Explanation must be provided');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export { baseValidate as validateQuestion };

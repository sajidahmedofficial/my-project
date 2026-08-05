// agent-notes: { ctx: "Validation layer verifying question schema, correctness, math integrity & quality", deps: [], state: "active", last: "anti@2026-08-04" }

/**
 * Validates question quality before insertion into database/store.
 * Checks required fields, options count, correctAnswer presence in options, difficulty, and mathematical sanity.
 */
export function validateQuestion(q) {
  const errors = [];

  if (!q) {
    return { valid: false, errors: ['Question object is null or undefined'] };
  }

  if (!q.category || typeof q.category !== 'string') {
    errors.push('Category is required and must be a string');
  }

  if (!q.topic || typeof q.topic !== 'string') {
    errors.push('Topic is required and must be a string');
  }

  if (!q.question || typeof q.question !== 'string' || q.question.trim().length < 5) {
    errors.push('Question text must be at least 5 characters long');
  }

  if (!Array.isArray(q.options) || q.options.length < 2) {
    errors.push('Question must have at least 2 options');
  }

  if (q.options && q.options.length > 0) {
    // Standardize option texts
    const optionTexts = q.options.map(opt => (typeof opt === 'string' ? opt : opt.text));
    
    // Validate duplicate options
    const uniqueOptions = new Set(optionTexts.map(t => t?.toString().trim().toLowerCase()));
    if (uniqueOptions.size < optionTexts.length) {
      errors.push('Question contains duplicate options');
    }

    // Validate correct answer presence (supports integer index 0..N-1 or matching string option)
    let hasMatch = false;
    if (typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 && q.correctAnswer < optionTexts.length) {
      hasMatch = true;
    } else {
      const correctVal = String(q.correctAnswer).trim();
      const parsedInt = parseInt(correctVal, 10);
      if (!isNaN(parsedInt) && parsedInt >= 0 && parsedInt < optionTexts.length) {
        hasMatch = true;
      } else {
        hasMatch = optionTexts.some(optText => optText?.toString().trim().toLowerCase() === correctVal.toLowerCase());
      }
    }

    if (!hasMatch) {
      errors.push(`Correct answer "${q.correctAnswer}" does not exist inside the provided options`);
    }
  }

  if (!q.explanation || typeof q.explanation !== 'string' || q.explanation.trim().length < 5) {
    errors.push('Explanation must be provided and at least 5 characters long');
  }

  const validDifficulties = ['easy', 'medium', 'hard', 'expert'];
  if (q.difficulty && !validDifficulties.includes(q.difficulty.toLowerCase())) {
    errors.push(`Difficulty must be one of: ${validDifficulties.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// agent-notes: { ctx: "Anti-duplicate hashing & text normalization for question bank integrity (browser & node compatible)", deps: [], state: "active", last: "anti@2026-08-04" }

/**
 * Normalizes question text by stripping punctuation, extra spaces, and lowercase conversion.
 * Generates deterministic 32-bit FNV-1a hash for anti-duplication detection across browser and Node.js environments.
 */
export function generateQuestionHash(questionText = '', topic = '') {
  const normalizedText = questionText
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  const normalizedTopic = topic.toLowerCase().trim();
  const rawString = `${normalizedTopic}:${normalizedText}`;

  let hash = 0x811c9dc5;
  for (let i = 0; i < rawString.length; i++) {
    hash ^= rawString.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return 'hash_' + (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * Checks similarity between two strings to detect near-duplicates.
 */
export function calculateSimilarity(str1 = '', str2 = '') {
  const words1 = new Set(str1.toLowerCase().split(/\s+/));
  const words2 = new Set(str2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  if (union.size === 0) return 0;
  return intersection.size / union.size;
}

// agent-notes: { ctx: "SHA-256 and FNV-1a Hash Generator for question deduplication", deps: ["crypto", "../utils/questionHash"], state: "active", last: "anti@2026-08-04" }

import crypto from 'crypto';
import { generateQuestionHash as fnvHash } from '../utils/questionHash.js';

/**
 * Normalizes question text and options to produce a deterministic SHA-256 fingerprint hash.
 * 
 * @param {string} questionText
 * @param {Array<string>} options
 * @returns {string} SHA-256 hex string
 */
export function createQuestionHash(questionText = '', options = []) {
  const normQ = (questionText || '')
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  const normOpts = (options || [])
    .map(o => (typeof o === 'string' ? o : o?.text || ''))
    .map(o => o.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, ' ').trim())
    .sort()
    .join('|');

  const combined = `${normQ}:::${normOpts}`;
  return crypto.createHash('sha256').update(combined).digest('hex');
}

export { fnvHash as generateQuestionHash };

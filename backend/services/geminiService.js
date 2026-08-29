// agent-notes: { ctx: "Unified Gemini AI client module with exponential backoff, model fallback chains, and structured JSON parsing", deps: ["@google/generative-ai", "./promptBuilder.service", "./questionHashService", "./questionValidationService"], state: "active", last: "anti@2026-08-25" }

import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildQuestionGenerationPrompt } from './promptBuilder.service.js';
import { createQuestionHash } from './questionHashService.js';
import { validateGeneratedQuestion } from './questionValidationService.js';

let cachedGenAI = null;

/**
 * Gets or initializes the GoogleGenerativeAI client instance.
 * @returns {GoogleGenerativeAI | null}
 */
export function getGenAIClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
  if (!apiKey) {
    console.warn('[GEMINI CLIENT] WARNING: GEMINI_API_KEY is not configured in backend environment.');
    return null;
  }
  if (!cachedGenAI) {
    cachedGenAI = new GoogleGenerativeAI(apiKey);
  }
  return cachedGenAI;
}

// Default model fallback chain
export const DEFAULT_MODEL_NAMES = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];

/**
 * Executes a Gemini prompt with automatic model fallback chain and exponential backoff retry.
 * 
 * @param {string} prompt - Prompt to send to Gemini
 * @param {Object} options
 * @param {boolean} [options.jsonMode=false] - Whether to request JSON output
 * @param {number} [options.temperature=0.7] - Model temperature
 * @param {string[]} [options.modelChain=DEFAULT_MODEL_NAMES] - Model names to attempt in sequence
 * @param {number} [options.maxAttempts=3] - Max attempts per model
 * @returns {Promise<string>} Raw text output from Gemini
 */
export async function analyzeWithGemini(prompt, {
  jsonMode = false,
  temperature = 0.7,
  modelChain = DEFAULT_MODEL_NAMES,
  maxAttempts = 2,
  timeoutMs = 18000
} = {}) {
  const ai = getGenAIClient();
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured in backend environment variables.');
  }

  for (const modelName of modelChain) {
    let attempts = 0;
    let backoffMs = 1000;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        const model = ai.getGenerativeModel({ model: modelName });
        const config = {
          temperature
        };
        if (jsonMode) {
          config.responseMimeType = 'application/json';
        }

        const callPromise = (async () => {
          const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: config
          });
          const response = await result.response;
          return response.text();
        })();

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error(`Gemini API request timed out after ${timeoutMs}ms`)), timeoutMs);
        });

        const text = await Promise.race([callPromise, timeoutPromise]);
        if (text) {
          return text;
        }
      } catch (err) {
        console.warn(`[GEMINI CLIENT] Model ${modelName} attempt ${attempts}/${maxAttempts} failed: ${err.message}`);

        if (err.message.includes('404') || err.message.includes('not found') || err.message.includes('timed out')) {
          break;
        }

        if (attempts >= maxAttempts) {
          break;
        }

        await new Promise(resolve => setTimeout(resolve, backoffMs));
        backoffMs *= 2;
      }
    }
  }

  throw new Error('Gemini API call failed across all fallback models.');
}

/**
 * Executes a Gemini prompt and parses the result strictly as JSON.
 * 
 * @param {string} prompt - Prompt to send to Gemini
 * @param {Object} options - Options passed to analyzeWithGemini
 * @returns {Promise<any>} Parsed JSON object
 */
export async function analyzeJSON(prompt, options = {}) {
  const enhancedPrompt = `
Return ONLY valid JSON.
Do not use markdown formatting.
Do not use code fences.

${prompt}
`;

  try {
    const text = await analyzeWithGemini(enhancedPrompt, {
      ...options,
      jsonMode: true
    });

    if (!text) return null;

    try {
      return JSON.parse(text);
    } catch (err) {
      const cleaned = text
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();
      try {
        return JSON.parse(cleaned);
      } catch (err2) {
        // Extract substring between first { and last }
        const firstBrace = cleaned.indexOf('{');
        const lastBrace = cleaned.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          return JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
        }
        throw err2;
      }
    }
  } catch (initialErr) {
    // Retry once with a stricter instruction if not an auth error
    if (initialErr.message && (initialErr.message.includes('API_KEY') || initialErr.message.includes('timed out'))) {
      throw initialErr;
    }

    console.warn('[GEMINI CLIENT] Retrying JSON generation with stricter prompt...');
    const retryPrompt = `
CRITICAL: Return ONLY a raw RFC8259 valid JSON object. No explanation, no intro, no markdown.

${prompt}
`;
    const retryText = await analyzeWithGemini(retryPrompt, {
      ...options,
      jsonMode: true,
      maxAttempts: 1
    });

    if (!retryText) return null;
    const cleaned = retryText
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
    }
    return JSON.parse(cleaned);
  }
}

/**
 * Generates MCQs using Gemini API with validation and deduplication hashing.
 * 
 * @param {Object} params
 * @param {string} params.topicId - e.g., 'percentage'
 * @param {string} params.topic - e.g., 'Percentage'
 * @param {string} params.category - e.g., 'Quantitative Aptitude'
 * @param {string} params.difficulty - 'easy' | 'medium' | 'hard' | 'expert'
 * @param {number} params.count - Number of questions to generate (default: 20)
 * @returns {Promise<Array<Object>>} Array of validated question objects
 */
export async function generateGeminiQuestions({
  topicId = 'percentage',
  topic = 'Percentage',
  category = 'Quantitative Aptitude',
  difficulty = 'medium',
  count = 20
} = {}) {
  const prompt = buildQuestionGenerationPrompt({
    topic,
    topicId,
    category,
    difficulty,
    count
  });

  const parsedData = await analyzeJSON(prompt, {
    temperature: 0.7,
    jsonMode: true
  });

  const rawQuestions = Array.isArray(parsedData)
    ? parsedData
    : (parsedData.questions || parsedData.data || []);

  const validQuestions = [];

  for (let i = 0; i < rawQuestions.length; i++) {
    const item = rawQuestions[i];

    let optionsList = [];
    if (Array.isArray(item.options)) {
      optionsList = item.options.map(opt => (typeof opt === 'string' ? opt.trim() : opt?.text || ''));
    } else if (item.optionA && item.optionB && item.optionC && item.optionD) {
      optionsList = [item.optionA, item.optionB, item.optionC, item.optionD].map(o => String(o).trim());
    }

    let correctIdx = 0;
    if (typeof item.correctAnswer === 'number' && item.correctAnswer >= 0 && item.correctAnswer <= 3) {
      correctIdx = Math.floor(item.correctAnswer);
    } else if (typeof item.correctAnswer === 'string') {
      const matchIdx = optionsList.findIndex(opt => opt.toLowerCase() === item.correctAnswer.toLowerCase());
      if (matchIdx !== -1) {
        correctIdx = matchIdx;
      } else {
        const parsedInt = parseInt(item.correctAnswer, 10);
        if (!isNaN(parsedInt) && parsedInt >= 0 && parsedInt <= 3) {
          correctIdx = parsedInt;
        }
      }
    }

    const questionHash = createQuestionHash(item.question || '', optionsList);

    const formattedQ = {
      id: `gemini-${topicId}-${Date.now()}-${i + 1}-${Math.random().toString(36).substr(2, 4)}`,
      topicId: topicId,
      topic: topic,
      category: category,
      difficulty: (item.difficulty || difficulty).toLowerCase(),
      question: (item.question || '').trim(),
      options: optionsList,
      correctAnswer: correctIdx,
      explanation: item.explanation || item.solution || 'Clear step-by-step logic provided.',
      solution: item.solution || item.explanation || 'Step-by-step calculation provided.',
      tags: item.tags || [topicId, difficulty],
      source: 'Gemini AI Generator',
      isActive: true,
      questionHash
    };

    const validation = validateGeneratedQuestion(formattedQ);

    if (validation.valid) {
      validQuestions.push(formattedQ);
    } else {
      console.warn(`[GEMINI SERVICE] Skipping invalid question [${item.question?.substring(0, 30)}...]: ${validation.errors.join(', ')}`);
    }
  }

  console.log(`[GEMINI SERVICE] Successfully generated ${validQuestions.length}/${rawQuestions.length} valid questions for "${topic}".`);
  return validQuestions;
}

export default {
  getGenAIClient,
  analyzeWithGemini,
  analyzeJSON,
  generateGeminiQuestions,
  DEFAULT_MODEL_NAMES
};

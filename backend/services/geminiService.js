// agent-notes: { ctx: "Gemini API service using official Google GenAI SDK with structured output JSON mode & exponential backoff", deps: ["@google/generative-ai", "./promptBuilder.service", "./questionHashService", "./questionValidationService"], state: "active", last: "anti@2026-08-04" }

import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildQuestionGenerationPrompt } from './promptBuilder.service.js';
import { createQuestionHash } from './questionHashService.js';
import { validateGeneratedQuestion } from './questionValidationService.js';

/**
 * Gets GenAI client instance using GEMINI_API_KEY environment variable.
 */
function getGenAIClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('[GEMINI SERVICE] WARNING: GEMINI_API_KEY environment variable is missing.');
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Generates MCQs using Gemini API.
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
  const ai = getGenAIClient();
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured in backend environment variables.');
  }

  // Model fallback chain: gemini-1.5-flash, gemini-2.0-flash, gemini-1.5-pro
  const modelNames = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];
  const prompt = buildQuestionGenerationPrompt({
    topic,
    topicId,
    category,
    difficulty,
    count
  });

  let attempts = 0;
  const maxAttempts = 3;

  for (const modelName of modelNames) {
    attempts = 0;
    let backoffMs = 1000;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        console.log(`[GEMINI SERVICE] Requesting ${count} ${difficulty} Qs for topic "${topic}" using ${modelName} (Attempt ${attempts}/${maxAttempts})...`);

        const model = ai.getGenerativeModel({ model: modelName });
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.7,
          }
        });

        const responseText = result.response.text();
        let parsedData;

        try {
          parsedData = JSON.parse(responseText);
        } catch (jsonErr) {
          const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
          parsedData = JSON.parse(cleaned);
        }

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

        console.log(`[GEMINI SERVICE] Successfully generated ${validQuestions.length}/${rawQuestions.length} valid questions for "${topic}" via ${modelName}.`);
        return validQuestions;

      } catch (err) {
        console.error(`[GEMINI SERVICE] Model ${modelName} attempt ${attempts} failed: ${err.message}`);

        if (err.message.includes('404') || err.message.includes('not found')) {
          console.warn(`[GEMINI SERVICE] Model ${modelName} not available, switching to next model in chain...`);
          break; // Switch model immediately
        }

        if (attempts >= maxAttempts) {
          console.warn(`[GEMINI SERVICE] ${modelName} max attempts reached. Trying next model...`);
          break;
        }

        await new Promise(resolve => setTimeout(resolve, backoffMs));
        backoffMs *= 2;
      }
    }
  }

  throw new Error('Gemini API question generation failed across all model fallbacks.');
}

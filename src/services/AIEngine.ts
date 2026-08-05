// agent-notes: { ctx: "Gemini AI engine for generating practice and interview questions", deps: ["@google/generative-ai"], state: "active", last: "anti@2026-08-04" }

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GenerateQuestionsOptions {
  topic: string;
  difficulty?: 'easy' | 'medium' | 'hard' | string;
  questionType?: 'mcq' | 'coding' | 'interview' | string;
  numberOfQuestions?: number;
}

export interface QuestionItem {
  id: number;
  question: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  starterCode?: string;
  sampleSolution?: string;
  sampleAnswer?: string;
  keyConcepts?: string[];
}

/**
 * Reusable function to generate questions using Google Gemini API (@google/generative-ai).
 * Reads API key from VITE_GEMINI_API_KEY.
 *
 * @param topicOrOptions Topic string OR options object { topic, difficulty, questionType, numberOfQuestions }
 * @param difficulty Difficulty level ('easy' | 'medium' | 'hard')
 * @param questionType Type of question ('mcq' | 'coding' | 'interview')
 * @param numberOfQuestions Total questions count
 * @returns Clean JSON array of generated questions
 */
export async function generateQuestions(
  topicOrOptions: string | GenerateQuestionsOptions,
  difficulty: 'easy' | 'medium' | 'hard' | string = 'medium',
  questionType: 'mcq' | 'coding' | 'interview' | string = 'mcq',
  numberOfQuestions: number = 5
): Promise<QuestionItem[]> {
  let topic: string;
  let diff: string;
  let qType: string;
  let count: number;

  if (typeof topicOrOptions === 'object' && topicOrOptions !== null) {
    topic = topicOrOptions.topic;
    diff = topicOrOptions.difficulty || difficulty;
    qType = topicOrOptions.questionType || questionType;
    count = topicOrOptions.numberOfQuestions || numberOfQuestions;
  } else {
    topic = topicOrOptions;
    diff = difficulty;
    qType = questionType;
    count = numberOfQuestions;
  }

  // Read API key from environment variable VITE_GEMINI_API_KEY
  const apiKey =
    (import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) ||
    (typeof process !== 'undefined' && process.env && process.env.VITE_GEMINI_API_KEY) ||
    '';

  if (!apiKey) {
    throw new Error(
      'VITE_GEMINI_API_KEY is missing. Please define VITE_GEMINI_API_KEY in your environment variables (.env).'
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      responseMimeType: 'application/json'
    }
  });

  const prompt = `You are an expert AI technical examiner. Generate exactly ${count} practice questions based on the following specs:
- Topic: ${topic}
- Difficulty: ${diff}
- Question Type: ${qType}

Output requirements:
Return a clean JSON array of ${count} question objects.
Structure per question object depending on questionType (${qType}):
- If "mcq": { "id": number, "question": string, "options": Array<string> (4 items), "correctAnswer": string, "explanation": string }
- If "coding": { "id": number, "question": string, "starterCode": string, "sampleSolution": string, "explanation": string }
- If "interview": { "id": number, "question": string, "sampleAnswer": string, "keyConcepts": Array<string> }

Return strictly valid JSON only. Do not include markdown code fences or conversational text.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Sanitize output in case markdown fences are included
    const cleanedJson = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
    const questions: QuestionItem[] = JSON.parse(cleanedJson);

    return questions;
  } catch (error: any) {
    console.error('generateQuestions execution failed:', error.message || error);
    throw error;
  }
}

export default {
  generateQuestions
};

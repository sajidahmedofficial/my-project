// agent-notes: { ctx: "Gemini AI service with raw text and JSON parsing helpers", deps: ["@google/generative-ai"], state: "active", last: "anti@2026-08-06" }
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export async function analyzeWithGemini(prompt) {
  if (!apiKey) {
    console.warn('Gemini API key not found in environment (GEMINI_API_KEY or VITE_GEMINI_API_KEY)');
    return null;
  }

  const modelNames = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];
  
  for (const modelName of modelNames) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      if (text) return text;
    } catch (error) {
      console.warn(`Gemini Model (${modelName}) warning:`, error.message);
    }
  }
  return null;
}

export async function analyzeJSON(prompt) {
  const text = await analyzeWithGemini(`
You are an expert AI resume analyzer.

Return ONLY valid JSON.

Do not use markdown.
Do not use code fences.

${prompt}
`);

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (error) {
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  }
}

export default {
  analyzeWithGemini,
  analyzeJSON
};

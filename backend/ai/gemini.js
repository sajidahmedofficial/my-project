// agent-notes: { ctx: "Gemini AI service with raw text and JSON parsing helpers", deps: ["@google/generative-ai"], state: "active", last: "anti@2026-08-06" }
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || ''
);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash"
});

export async function analyzeWithGemini(prompt) {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini Analysis Error:', error);
    return null;
  }
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

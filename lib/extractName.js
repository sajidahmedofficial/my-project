// agent-notes: { ctx: "Anthropic Claude & Gemini powered contact and candidate name extraction from resume text", deps: ["@anthropic-ai/sdk", "dotenv"], state: "active", last: "anti@2026-09-30" }
import dotenv from "dotenv";
dotenv.config();

import Anthropic from "@anthropic-ai/sdk";

let client = null;
function getAnthropicClient() {
  const apiKey = (process.env.ANTHROPIC_API_KEY || "").trim();
  if (apiKey) {
    if (!client) {
      client = new Anthropic({ apiKey });
    }
    return client;
  }
  return null;
}

export const SYSTEM_PROMPT = `You extract contact details from resume text.

Return ONLY a JSON object, no explanation, no markdown:
{"firstName": string|null, "lastName": string|null, "email": string|null, "phone": string|null}

Rules for the name:
- It is the candidate's personal name (usually near the top, often in larger text or ALL CAPS).
- It is NEVER a URL, domain, email, username, company, job title, section heading, or city.
  Examples of things that are NOT names: "task-diary.vercel.app", "github.com/john", "Software Engineer", "Curriculum Vitae".
- Ignore lines like "Resume", "CV", links, and contact info when looking for the name.
- If the resume has only one name word, put it in firstName and set lastName to null.
- Use proper capitalization ("JOHN SMITH" -> "John", "Smith").
- If you cannot find a real person's name, return null for both. Do not guess.`;

// Reject anything that doesn't look like a human name
export function isValidName(s) {
  if (!s) return false;
  const v = s.trim();
  if (v.length < 2 || v.length > 40) return false;
  if (/[@\/\\:]|https?|www\.|\.(com|app|io|net|org|dev)\b/i.test(v)) return false;
  if (/\d/.test(v)) return false;
  // Reject common resume headings, job titles, or keywords that are not human names
  if (/^(?:curriculum\s+vitae|curriculum|vitae|resume|cv|profile|contact|summary|skills|education|experience|projects|objective|software\s+engineer|full\s+stack\s+developer|frontend\s+developer|backend\s+developer|developer|engineer)$/i.test(v)) return false;
  return /^[\p{L}][\p{L}'’.\- ]*$/u.test(v); // letters, spaces, ' . - only
}

export async function extractContact(resumeText) {
  if (!resumeText || typeof resumeText !== 'string' || !resumeText.trim()) {
    return { firstName: null, lastName: null, email: null, phone: null };
  }

  const anthropicClient = getAnthropicClient();
  let text = "";

  if (anthropicClient) {
    try {
      const res = await anthropicClient.messages.create({
        model: "claude-sonnet-5-5", // claude-haiku-4-5-20251001 also works and is cheaper
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `<resume>\n${resumeText.slice(0, 6000)}\n</resume>`,
          },
        ],
      });

      text = res.content
        .map((b) => (b.type === "text" ? b.text : ""))
        .join("");
    } catch (err) {
      console.warn("[Anthropic Contact Extraction] Error, falling back to Gemini:", err.message);
    }
  }

  // Resilient fallback: If Anthropic client not configured or errored, try Gemini
  if (!text) {
    try {
      const { analyzeWithGemini } = await import("../backend/services/geminiService.js");
      const geminiPrompt = `${SYSTEM_PROMPT}\n\n<resume>\n${resumeText.slice(0, 6000)}\n</resume>`;
      text = await analyzeWithGemini(geminiPrompt, { jsonMode: true, temperature: 0.1 });
    } catch {
      /* fall through to text regex fallback */
    }
  }

  let parsed = { firstName: null, lastName: null, email: null, phone: null };
  try {
    const json = text.match(/\{[\s\S]*\}/)?.[0] ?? "{}";
    parsed = { ...parsed, ...JSON.parse(json) };
  } catch {
    /* fall through to fallback */
  }

  // Regex fallback for email and phone if LLM missed them
  if (!parsed.email && resumeText) {
    const emailMatch = resumeText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) parsed.email = emailMatch[0];
  }
  if (!parsed.phone && resumeText) {
    const phoneMatch = resumeText.match(/(?:\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
    if (phoneMatch) parsed.phone = phoneMatch[0];
  }

  // Fallback: search resume top lines for candidate human name if LLM didn't find one
  if (!isValidName(parsed.firstName) && !isValidName(parsed.lastName) && resumeText) {
    const lines = resumeText.split('\n').map(l => l.trim()).filter(Boolean);
    for (let i = 0; i < Math.min(8, lines.length); i++) {
      const line = lines[i].replace(/^[#*•\-\s]+|[#*•\-\s]+$/g, '');
      if (isValidName(line)) {
        const parts = line.split(/\s+/).filter(Boolean);
        if (parts.length === 1) {
          parsed.firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
          parsed.lastName = null;
        } else if (parts.length >= 2) {
          parsed.firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
          parsed.lastName = parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
        }
        break;
      }
    }
  }

  // Validation layer: never trust the output blindly
  if (!isValidName(parsed.firstName)) parsed.firstName = null;
  if (!isValidName(parsed.lastName)) parsed.lastName = null;

  // Fallback: guess from email (john.smith@x.com -> John Smith)
  if (!parsed.firstName && parsed.email) {
    const local = parsed.email.split("@")[0].replace(/\d+/g, "");
    const [f, l] = local.split(/[._-]/).filter(Boolean);
    if (isValidName(f ?? null)) parsed.firstName = f[0].toUpperCase() + f.slice(1).toLowerCase();
    if (isValidName(l ?? null)) parsed.lastName = l[0].toUpperCase() + l.slice(1).toLowerCase();
  }

  return parsed;
}

export default {
  SYSTEM_PROMPT,
  isValidName,
  extractContact
};

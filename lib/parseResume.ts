// agent-notes: { ctx: "Full resume parser extracting structured education, experience, projects, and skills with strict separation and Anthropic/Gemini fallback", deps: ["@anthropic-ai/sdk", "dotenv"], state: "active", last: "anti@2026-10-01" }
import dotenv from "dotenv";
dotenv.config();

import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;
function getAnthropicClient(): Anthropic | null {
  const apiKey = (process.env.ANTHROPIC_API_KEY || "").trim();
  if (apiKey) {
    if (!client) {
      client = new Anthropic({ apiKey });
    }
    return client;
  }
  return null;
}

export const SYSTEM_PROMPT = `You convert resume text into structured JSON.

Return ONLY a JSON object, no explanation, no markdown fences, matching exactly:
{
  "firstName": string|null,
  "lastName": string|null,
  "email": string|null,
  "phone": string|null,
  "education": [
    {"degree": string, "institution": string|null, "startDate": string|null, "endDate": string|null, "details": string|null}
  ],
  "experience": [
    {"title": string, "company": string, "startDate": string|null, "endDate": string|null, "bullets": string[]}
  ],
  "projects": [
    {"name": string, "description": string|null, "technologies": string[]}
  ],
  "skills": string[]
}

CRITICAL RULES:
- "experience" is ONLY paid or unpaid work: jobs, internships, freelance, volunteering with an employer/organization.
- Degrees, schools, colleges, diplomas, CGPA, "Higher Secondary", "B.E.", "B.Tech", "MBA", "Expected 2027" belong ONLY in "education", NEVER in "experience".
- Personal or academic projects belong in "projects", NOT in "experience", unless they were done for a company.
- If the resume has no real work experience (common for students and freshers), return "experience": [].
  An empty array is correct and expected. Do NOT move education or projects into it to fill it.
- Never invent data. If a field is not in the resume, use null (or [] for lists).
- "endDate": use "Present" if the resume says present/current/ongoing; for "Expected 2027" in education, set endDate to "2027".
- "company" must be an organization name, never a date, degree, or location.
- "bullets" must be the candidate's real accomplishments copied or lightly cleaned from the resume. Never output template or instructional text such as "Action + Metric + Impact".
- Name: the candidate's personal name only, never a URL, email, job title, or heading.`;

export type ParsedResume = {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  education: { degree: string; institution: string | null; startDate: string | null; endDate: string | null; details: string | null }[];
  experience: { title: string; company: string; startDate: string | null; endDate: string | null; bullets: string[] }[];
  projects: { name: string; description: string | null; technologies: string[] }[];
  skills: string[];
};

export const EDU_WORDS =
  /\b(b\.?e\.?|b\.?tech|m\.?tech|b\.?sc|m\.?sc|b\.?a|m\.?a|mba|bachelor|master|diploma|higher secondary|hsc|sslc|school|college|university|cgpa|gpa|expected)\b/i;
export const DATE_ONLY = /^(expected\s*)?(\d{4}|\w{3,9}\.?\s*\d{4})(\s*[-–]\s*(\d{4}|present))?$/i;
export const TEMPLATE_TEXT = /action\s*\+\s*metric\s*\+\s*impact/i;

export function cleanExperience(list: ParsedResume["experience"]): ParsedResume["experience"] {
  return (list ?? [])
    .filter((e: any) => {
      const title = (e.title || e.role || e.position_title || '').trim();
      const company = (e.company || e.organization || e.employer || '').trim();
      if (!title || !company) return false;
      if (EDU_WORDS.test(title)) return false; // degree sitting in the title
      if (DATE_ONLY.test(company)) return false; // date sitting in the company
      if (EDU_WORDS.test(company)) return false; // school or edu sitting in company
      return true;
    })
    .map((e: any) => ({
      ...e,
      title: e.title || e.role || '',
      role: e.role || e.title || '',
      bullets: (e.bullets ?? [])
        .map((b: any) => (typeof b === 'string' ? b.replace(/^action\s*\+\s*metric\s*\+\s*impact\s*:\s*/i, '').trim() : ''))
        .filter((b: string) => b && !TEMPLATE_TEXT.test(b)),
    }));
}

/**
 * Heuristic fallback parser when AI API keys are not available
 */
function heuristicFallbackParse(resumeText: string): ParsedResume {
  const empty: ParsedResume = {
    firstName: null,
    lastName: null,
    email: null,
    phone: null,
    education: [],
    experience: [],
    projects: [],
    skills: [],
  };

  if (!resumeText || !resumeText.trim()) return empty;

  const lines = resumeText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // Extract contact
  const emailMatch = resumeText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) empty.email = emailMatch[0];

  const phoneMatch = resumeText.match(/(?:\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
  if (phoneMatch) empty.phone = phoneMatch[0];

  // Extract candidate name from top lines
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const l = lines[i].replace(/^[#*•\-\s]+|[#*•\-\s]+$/g, '');
    if (
      l.length >= 2 &&
      l.length <= 40 &&
      !/[@\/\\:]|https?|www\.|\.(com|app|io|net|org|dev)\b/i.test(l) &&
      !/\d/.test(l) &&
      !/^(?:curriculum\s+vitae|curriculum|vitae|resume|cv|profile|contact|summary|skills|education|experience|projects)/i.test(l)
    ) {
      const parts = l.split(/\s+/).filter(Boolean);
      if (parts.length === 1) {
        empty.firstName = parts[0];
      } else if (parts.length >= 2) {
        empty.firstName = parts[0];
        empty.lastName = parts.slice(1).join(" ");
      }
      break;
    }
  }

  // Section splitting
  let currentSection = "header";
  const sectionContent: Record<string, string[]> = {
    education: [],
    experience: [],
    projects: [],
    skills: [],
  };

  for (const line of lines) {
    if (/^(?:education|academic|qualifications)/i.test(line)) {
      currentSection = "education";
      continue;
    } else if (/^(?:work\s+experience|professional\s+experience|employment\s+history|experience|internships|internship)/i.test(line)) {
      currentSection = "experience";
      continue;
    } else if (/^(?:projects|academic\s+projects|key\s+projects)/i.test(line)) {
      currentSection = "projects";
      continue;
    } else if (/^(?:skills|technical\s+skills|core\s+competencies)/i.test(line)) {
      currentSection = "skills";
      continue;
    }

    if (sectionContent[currentSection]) {
      sectionContent[currentSection].push(line);
    }
  }

  // Extract skills
  if (sectionContent.skills.length > 0) {
    const rawSkills = sectionContent.skills.join(", ");
    empty.skills = rawSkills
      .split(/[,|•\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length >= 2 && s.length <= 35 && !/skills|competencies/i.test(s));
  }

  // Extract education
  if (sectionContent.education.length > 0) {
    const eduLines = sectionContent.education;
    let degree = "";
    let institution = "";
    let endDate: string | null = null;
    let details: string | null = null;

    for (const l of eduLines) {
      if (EDU_WORDS.test(l) && !degree) {
        const parts = l.split(/[|–-]/).map((p) => p.trim());
        degree = parts[0] || l;
      } else if (!institution && /(?:university|institute|college|school|academy)/i.test(l)) {
        const parts = l.split(/[|–-]/).map((p) => p.trim());
        institution = parts[0] || l;
      }
      const dateMatch = l.match(/(?:expected\s*)?(\d{4})/i);
      if (dateMatch && !endDate) {
        endDate = dateMatch[1];
      }
      if (/higher secondary|board|cgpa|gpa|%/i.test(l) && !details) {
        details = l.replace(/^[•\-\*]\s*/, '').trim();
      }
    }

    if (degree || institution) {
      empty.education.push({
        degree: degree || "Bachelor of Technology",
        institution: institution || null,
        startDate: null,
        endDate: endDate || null,
        details: details || null,
      });
    }
  }

  // Extract experience - ONLY if real work experience exists
  if (sectionContent.experience.length > 0) {
    const expLines = sectionContent.experience;
    let title = "";
    let company = "";
    let startDate: string | null = null;
    let endDate: string | null = null;
    const bullets: string[] = [];

    for (const l of expLines) {
      if (/^[•\-\*]/.test(l)) {
        const cleanB = l.replace(/^[•\-\*]\s*/, '').replace(/^action\s*\+\s*metric\s*\+\s*impact\s*:\s*/i, '').trim();
        if (cleanB && !TEMPLATE_TEXT.test(cleanB)) bullets.push(cleanB);
      } else if (!title && /(?:developer|engineer|intern|manager|architect|lead|analyst)/i.test(l)) {
        title = l;
      } else if (title && !company && !DATE_ONLY.test(l) && !EDU_WORDS.test(l) && l.length < 50) {
        company = l;
      } else {
        const dateMatch = l.match(/(\w+\s*\d{4}|\d{4})\s*[-–]\s*(\w+\s*\d{4}|\d{4}|present)/i);
        if (dateMatch) {
          startDate = dateMatch[1];
          endDate = /present/i.test(dateMatch[2]) ? "Present" : dateMatch[2];
        }
      }
    }

    if (title && company) {
      empty.experience.push({
        title,
        company,
        startDate,
        endDate,
        bullets,
      });
    }
  }

  empty.experience = cleanExperience(empty.experience);
  return empty;
}

export async function parseResume(resumeText: string): Promise<ParsedResume> {
  const empty: ParsedResume = {
    firstName: null,
    lastName: null,
    email: null,
    phone: null,
    education: [],
    experience: [],
    projects: [],
    skills: [],
  };

  if (!resumeText || typeof resumeText !== "string" || !resumeText.trim()) {
    return empty;
  }

  const anthropicClient = getAnthropicClient();
  let text = "";

  if (anthropicClient) {
    try {
      const res = await anthropicClient.messages.create({
        model: "claude-sonnet-5-5", // claude-haiku-4-5-20251001 is cheaper
        max_tokens: 3000,
        system: SYSTEM_PROMPT,
        messages: [
          { role: "user", content: `<resume>\n${resumeText.slice(0, 12000)}\n</resume>` },
        ],
      });

      text = res.content
        .map((b) => (b.type === "text" ? b.text : ""))
        .join("");
    } catch (err: any) {
      console.warn("[Anthropic Resume Parse] Error, falling back to Gemini:", err.message);
    }
  }

  // Resilient fallback: Gemini
  if (!text) {
    try {
      const { analyzeWithGemini } = await import("../backend/services/geminiService.js");
      const geminiPrompt = `${SYSTEM_PROMPT}\n\n<resume>\n${resumeText.slice(0, 12000)}\n</resume>`;
      text = await analyzeWithGemini(geminiPrompt, { jsonMode: true, temperature: 0.1 });
    } catch (err: any) {
      console.warn("[Gemini Resume Parse] Fallback notice:", err.message);
    }
  }

  let parsed: ParsedResume = empty;
  if (text) {
    try {
      const json = text.match(/\{[\s\S]*\}/)?.[0] ?? "{}";
      parsed = { ...empty, ...JSON.parse(json) };
    } catch {
      parsed = empty;
    }
  }

  // If both LLMs unconfigured or failed, use heuristic fallback
  if (!parsed.email && !parsed.firstName && parsed.education.length === 0 && parsed.experience.length === 0) {
    parsed = heuristicFallbackParse(resumeText);
  }

  // Strict cleaning pass
  parsed.experience = cleanExperience(parsed.experience ?? []);

  // Ensure education dates map Expected 2027 to 2027
  if (Array.isArray(parsed.education)) {
    parsed.education = parsed.education.map((edu) => ({
      ...edu,
      endDate: edu.endDate ? edu.endDate.replace(/^expected\s*/i, '').trim() : null,
    }));
  }

  return parsed;
}

export default {
  SYSTEM_PROMPT,
  EDU_WORDS,
  DATE_ONLY,
  TEMPLATE_TEXT,
  cleanExperience,
  parseResume,
};

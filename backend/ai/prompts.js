// agent-notes: { ctx: "AI prompt templates for resume analysis, contact extraction, ATS scoring, and grammar checks", deps: [], state: "active", last: "anti@2026-09-30" }
export const PROMPTS = {
  RESUME_ANALYSIS: `Analyze the provided resume content. Extract skills, identify weak action verbs, grammar errors, formatting problems, and calculate ATS readiness score.`,
  SKILL_GAP: `Compare the user's current skills against the target role requirements and identify missing competencies and learning paths.`,
  ATS_CHECK: `Check the resume format against industrial ATS standards and suggest fixes for missing contact headers or uncategorized skills.`,
  CONTACT_EXTRACTION: `You extract contact details from resume text.

Return ONLY a JSON object, no explanation, no markdown:
{"firstName": string|null, "lastName": string|null, "email": string|null, "phone": string|null}

Rules for the name:
- It is the candidate's personal name (usually near the top, often in larger text or ALL CAPS).
- It is NEVER a URL, domain, email, username, company, job title, section heading, or city.
  Examples of things that are NOT names: "task-diary.vercel.app", "github.com/john", "Software Engineer", "Curriculum Vitae".
- Ignore lines like "Resume", "CV", links, and contact info when looking for the name.
- If the resume has only one name word, put it in firstName and set lastName to null.
- Use proper capitalization ("JOHN SMITH" -> "John", "Smith").
- If you cannot find a real person's name, return null for both. Do not guess.`
};


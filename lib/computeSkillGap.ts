// agent-notes: { ctx: "Skill Gap computing module with Anthropic, Gemini, and robust role-curriculum fallback", deps: ["@anthropic-ai/sdk", "dotenv"], state: "active", last: "anti@2026-10-01" }
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

export const ROLE_SKILL_CURRICULUM: Record<string, string[]> = {
  "full stack": [
    "TypeScript", "Docker", "PostgreSQL", "Redis", "CI/CD Pipelines", "AWS", "REST APIs", "System Design", "GraphQL", "Tailwind CSS"
  ],
  "frontend": [
    "TypeScript", "Next.js", "Tailwind CSS", "Redux", "Jest / Unit Testing", "Web Performance", "REST APIs", "GraphQL", "Web Accessibility"
  ],
  "backend": [
    "PostgreSQL", "Docker", "Redis", "Microservices", "Kubernetes", "Message Queues", "REST APIs", "gRPC", "CI/CD Pipelines", "System Design"
  ],
  "ai": [
    "PyTorch", "TensorFlow", "Vector Databases", "LangChain", "LLM Fine-Tuning", "Docker", "Python", "MLOps", "NumPy"
  ],
  "data": [
    "Python", "SQL", "Pandas", "Scikit-Learn", "Data Warehousing", "Tableau", "Statistical Modeling", "ETL Pipelines", "Docker"
  ],
  "devops": [
    "Docker", "Kubernetes", "Terraform", "AWS", "CI/CD Pipelines", "Prometheus", "Grafana", "Linux Administration", "Ansible", "GitOps"
  ]
};

export function getCurriculumFallback(role = "", candidateSkills: string[] = []): string[] {
  const roleLower = (role || "").toLowerCase();
  let baseSkills = ROLE_SKILL_CURRICULUM["full stack"];

  for (const [key, list] of Object.entries(ROLE_SKILL_CURRICULUM)) {
    if (roleLower.includes(key)) {
      baseSkills = list;
      break;
    }
  }

  const normCandidate = (candidateSkills || []).map((s) => s.toLowerCase().trim());
  const missing = baseSkills.filter(
    (skill) => !normCandidate.some((c) => c === skill.toLowerCase() || c.includes(skill.toLowerCase()) || skill.toLowerCase().includes(c))
  );

  return missing.slice(0, 8);
}

export async function computeSkillGap(role = "Full Stack Developer", skills: string[] = []): Promise<string[]> {
  const candidateSkills = Array.isArray(skills) ? skills : [];
  const anthropicClient = getAnthropicClient();
  let text = "";

  const systemPrompt = `Return ONLY JSON: {"missing": string[]}.
List the 6 to 8 most important skills for the given role that the candidate does NOT have.
Short skill names only, no explanations, nothing the candidate already has.`;

  // 1. Try Anthropic
  if (anthropicClient) {
    try {
      const res = await anthropicClient.messages.create({
        model: "claude-sonnet-5-5",
        max_tokens: 400,
        system: systemPrompt,
        messages: [{ role: "user", content: `Role: ${role}\nCandidate has: ${candidateSkills.join(", ")}` }],
      });
      text = res.content.map((b) => (b.type === "text" ? b.text : "")).join("");
    } catch (err: any) {
      console.warn("[Anthropic Skill Gap] Error, falling back to Gemini:", err?.message || err);
    }
  }

  // 2. Try Gemini
  if (!text) {
    try {
      const { analyzeWithGemini } = await import("../backend/services/geminiService.js");
      const prompt = `${systemPrompt}\n\nRole: ${role}\nCandidate has: ${candidateSkills.join(", ")}`;
      text = await analyzeWithGemini(prompt, { jsonMode: true, temperature: 0.2 });
    } catch (err: any) {
      console.warn("[Gemini Skill Gap] Error, using curriculum fallback:", err?.message || err);
    }
  }

  // 3. Parse JSON or Fallback
  if (text) {
    try {
      const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? "{}");
      if (Array.isArray(parsed.missing) && parsed.missing.length > 0) {
        return parsed.missing.slice(0, 8);
      }
    } catch {}
  }

  // 4. Guaranteed Role-Curriculum Fallback
  return getCurriculumFallback(role, candidateSkills);
}

export default {
  computeSkillGap,
  getCurriculumFallback,
  ROLE_SKILL_CURRICULUM,
};

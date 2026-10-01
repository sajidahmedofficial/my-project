// agent-notes: { ctx: "API route handler for skill gap analysis returning top 6-8 missing skills", deps: ["@/lib/computeSkillGap"], state: "active", last: "anti@2026-10-01" }
import { computeSkillGap } from "@/lib/computeSkillGap";

export async function POST(req: Request) {
  try {
    const { role, skills } = await req.json();
    const missing = await computeSkillGap(role || "Full Stack Developer", skills || []);
    return Response.json({ missing: Array.isArray(missing) ? missing.slice(0, 8) : [] });
  } catch (error) {
    return Response.json(
      { missing: [], error: (error as Error).message || "Failed to compute skill gap" },
      { status: 500 }
    );
  }
}

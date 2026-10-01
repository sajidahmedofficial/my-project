// agent-notes: { ctx: "API route handler for full structured resume parsing with education and experience separation", deps: ["@/lib/parseResume"], state: "active", last: "anti@2026-10-01" }
import { parseResume } from "@/lib/parseResume";

export async function POST(req: Request) {
  try {
    const { resumeText } = await req.json();
    const data = await parseResume(resumeText || "");
    return Response.json(data);
  } catch (error) {
    return Response.json(
      { error: (error as Error).message || "Failed to parse resume" },
      { status: 500 }
    );
  }
}

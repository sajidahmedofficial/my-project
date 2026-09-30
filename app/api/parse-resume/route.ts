// agent-notes: { ctx: "API route handler for resume contact and name extraction", deps: ["@/lib/extractName"], state: "active", last: "anti@2026-09-30" }
import { extractContact } from "@/lib/extractName";

export async function POST(req: Request) {
  try {
    const { resumeText } = await req.json();
    const contact = await extractContact(resumeText || "");
    return Response.json(contact);
  } catch (error) {
    return Response.json(
      { error: (error as Error).message || "Failed to extract contact information" },
      { status: 500 }
    );
  }
}

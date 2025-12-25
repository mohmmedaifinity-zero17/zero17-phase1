import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ClarifySchema = z.object({
  idea: z.string().min(10, "Idea too short"),
});

function extractPersona(idea: string): string | null {
  const m = idea.match(/for\s+([^.,]+?)(?:\s+who|\s+that|\s+with|[.,])/i);
  return m ? m[1].trim() : null;
}

function extractOutcome(idea: string): string | null {
  const m =
    idea.match(/so that\s+([^.,]+)[.,]?/i) || idea.match(/to\s+([^.,]+)[.,]?/i);
  return m ? m[1].trim() : null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ClarifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const idea: string = parsed.data.idea.trim();

    // crude “summary”: first sentence or first 220 chars
    const firstSentence = idea.split(/[.!?]/)[0] || idea.slice(0, 220);
    const summary =
      firstSentence.length > 220
        ? firstSentence.slice(0, 217) + "…"
        : firstSentence;

    const persona = extractPersona(idea);
    const outcome = extractOutcome(idea);

    // simple bullets: split by "and", commas, etc.
    const rawParts = idea
      .split(/,| and /i)
      .map((s) => s.trim())
      .filter(Boolean);
    const bullets = rawParts.slice(0, 5);

    return NextResponse.json(
      {
        summary,
        persona,
        outcome,
        bullets,
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Clarify failed" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";

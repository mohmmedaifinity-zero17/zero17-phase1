import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { computeScores } from "@/lib/slm"; // FIX: This import likely causes an error; adjust or check "@/lib/slm" for correct export
import type { ScoreResponse } from "@/types/slm";

const ScoreRequestSchema = z.object({
  idea: z.string().min(10, "Idea too short").max(2000),
  persona: z.string().optional(),
  goal: z.string().optional(),
  mustHaves: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ScoreRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const payload = parsed.data;

    const result: ScoreResponse = computeScores({
      idea: payload.idea,
      persona: payload.persona,
      goal: payload.goal,
      mustHaves: payload.mustHaves ?? [],
    });

    return NextResponse.json(result, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: "SLM scoring failed", detail: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";

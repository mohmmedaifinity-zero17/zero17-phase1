// src/app/api/research/memory/lookup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { openai } from "@/lib/openai";
import { ResearchIdea } from "@/lib/research/types";

interface MemoryRow {
  id: string;
  created_at: string;
  idea_title: string | null;
  idea_json: any;
  scores_json: any;
  blueprint_json: any;
  decision_note: string | null;
}

interface MemoryMatch {
  id: string;
  createdAt: string;
  title: string;
  similarity: number;
  summary: string;
  buildabilityIndex: number | null;
  signalPulse: number | null;
  decisionNote: string | null;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const idea = body.idea as ResearchIdea | null;

    if (!idea) {
      return NextResponse.json({ error: "Missing idea" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("zero17_research_memory")
      .select(
        "id, created_at, idea_title, idea_json, scores_json, blueprint_json, decision_note"
      )
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) {
      console.error("[Zero17] ValidationMemory lookup DB error:", error);
      return NextResponse.json(
        { error: "DB query failed", details: error.message },
        { status: 500 }
      );
    }

    const rows = (data ?? []) as MemoryRow[];

    if (!rows.length) {
      return NextResponse.json({ matches: [] });
    }

    const helper = `
CURRENT IDEA:
${JSON.stringify(idea, null, 2)}

CANDIDATES:
${rows
  .map(
    (r, idx) =>
      `#${idx + 1} (id=${r.id})
TITLE: ${r.idea_title || "Untitled"}
IDEA: ${JSON.stringify(r.idea_json).slice(0, 800)}
SCORES: ${JSON.stringify(r.scores_json || {}).slice(0, 400)}
BLUEPRINT: ${
        r.blueprint_json?.summary
          ? String(r.blueprint_json.summary).slice(0, 400)
          : "none"
      }
DECISION: ${r.decision_note || "none"}`
  )
  .join("\n\n")}
`;

    const userPrompt = `
You are the VALIDATION MEMORY engine for Zero17.

Goal:
- From the candidate past ideas, pick the 3–5 that are most similar in structure to the CURRENT IDEA.

Return JSON ONLY:

{
  "matches": [
    {
      "id": string,
      "createdAt": string,
      "title": string,
      "similarity": number,
      "summary": string,
      "buildabilityIndex": number | null,
      "signalPulse": number | null,
      "decisionNote": string | null
    }
  ]
}
`;

    const completion = await openai.responses.create({
      model: "gpt-4.1-mini",
      response_format: { type: "json_object" },
      input: [
        {
          role: "system",
          content: [
            {
              type: "text",
              text: "You are Zero17's Validation Memory engine. Output ONLY JSON.",
            },
          ],
        },
        {
          role: "user",
          content: [{ type: "text", text: helper + "\n\n" + userPrompt }],
        },
      ],
    });

    const raw =
      completion.output[0]?.content[0]?.type === "output_text"
        ? completion.output[0].content[0].text
        : "{}";

    const parsed = JSON.parse(raw) as { matches: MemoryMatch[] };

    parsed.matches = (parsed.matches || []).map((m) => ({
      ...m,
      similarity: clamp(m.similarity ?? 0, 0, 100),
      buildabilityIndex:
        m.buildabilityIndex != null ? clamp(m.buildabilityIndex, 0, 100) : null,
      signalPulse: m.signalPulse != null ? clamp(m.signalPulse, 0, 100) : null,
    }));

    return NextResponse.json({ matches: parsed.matches });
  } catch (err: any) {
    console.error("[Zero17] ValidationMemory lookup route error:", err);
    return NextResponse.json(
      {
        error: "Failed to lookup validation memory",
        details: String(err?.message || err),
      },
      { status: 500 }
    );
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

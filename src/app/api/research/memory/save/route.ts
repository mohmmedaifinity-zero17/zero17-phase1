// src/app/api/research/memory/save/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import {
  EvidenceBundle,
  ResearchIdea,
  SynthesisState,
  ScoreBundle,
  RiskProfile,
  Blueprint,
} from "@/lib/research/types";

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
    const evidence = (body.evidence as EvidenceBundle | null) ?? null;
    const synthesis = (body.synthesis as SynthesisState | null) ?? null;
    const scores = (body.scores as ScoreBundle | null) ?? null;
    const risks = (body.risks as RiskProfile | null) ?? null;
    const blueprint = (body.blueprint as Blueprint | null) ?? null;

    if (!idea) {
      return NextResponse.json({ error: "Missing idea" }, { status: 400 });
    }

    const ideaTitle =
      (idea as any).title ||
      idea.problem ||
      idea.description ||
      "Untitled idea";

    const { error } = await supabase.from("zero17_research_memory").insert({
      user_id: user.id,
      idea_title: ideaTitle,
      idea_json: idea,
      evidence_json: evidence,
      synthesis_json: synthesis,
      scores_json: scores,
      risks_json: risks,
      blueprint_json: blueprint,
      scenario_key: body.scenarioKey ?? null,
      decision_note: blueprint?.decisionNote ?? null,
    });

    if (error) {
      console.error("[Zero17] ValidationMemory save error:", error);
      return NextResponse.json(
        { error: "DB insert failed", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[Zero17] ValidationMemory save route error:", err);
    return NextResponse.json(
      {
        error: "Failed to save validation memory",
        details: String(err?.message || err),
      },
      { status: 500 }
    );
  }
}

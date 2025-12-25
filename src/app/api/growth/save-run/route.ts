// src/app/api/growth/save-run/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// Types kept light so this route accepts your existing shapes
type SaveGrowthRunBody = {
  label?: string;
  masterbrainInput: any;
  masterbrainOutput?: any;
  dnaPlan?: any;
  sprintPlan?: any;
  pulseEvents?: any;
  monetizationPlan?: any;
  loopsPlan?: any;
  objectionsPlaybook?: any;
  metricsSnapshot?: any;
  decision?: string | null;

  // Optional link to research memory row if this came from a Research idea
  researchMemoryId?: string | null;

  // Optional growth outcome info (after sprint ends)
  growthOutcome?: {
    summary: string;
    keyLearnings: string[];
    nextMove: string;
  } | null;
};

export async function POST(req: Request) {
  const supabase = createServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: SaveGrowthRunBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const insertPayload: any = {
      user_id: user.id,
      label: body.label ?? null,
      masterbrain_input: body.masterbrainInput,
      masterbrain_output: body.masterbrainOutput ?? null,
      dna_plan: body.dnaPlan ?? null,
      sprint_plan: body.sprintPlan ?? null,
      pulse_events: body.pulseEvents ?? null,
      monetization_plan: body.monetizationPlan ?? null,
      loops_plan: body.loopsPlan ?? null,
      objections_playbook: body.objectionsPlaybook ?? null,
      metrics_snapshot: body.metricsSnapshot ?? null,
      decision: body.decision ?? null,
      research_memory_id: body.researchMemoryId ?? null,
      growth_outcome: body.growthOutcome ?? null,
    };

    const { data, error } = await supabase
      .from("zero17_growth_memory")
      .insert(insertPayload)
      .select("id, created_at")
      .single();

    if (error) {
      console.error("Error inserting growth memory:", error);
      return NextResponse.json(
        { error: "Failed to save growth run" },
        { status: 500 }
      );
    }

    // OPTIONAL: write back growth_outcome into Research memory if linked
    if (body.researchMemoryId && body.growthOutcome) {
      const { error: updateError } = await supabase
        .from("zero17_research_memory")
        .update({
          growth_outcome: body.growthOutcome,
        })
        .eq("id", body.researchMemoryId)
        .eq("user_id", user.id);

      if (updateError) {
        console.warn(
          "Failed to write growth_outcome into research memory:",
          updateError
        );
      }
    }

    return NextResponse.json({ id: data.id, createdAt: data.created_at });
  } catch (err) {
    console.error("Unexpected error in /growth/save-run:", err);
    return NextResponse.json(
      { error: "Unexpected error while saving growth run" },
      { status: 500 }
    );
  }
}

// src/app/api/growth/sprint/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import type { GrowthSprintPlan } from "@/lib/growth/types";

export async function GET() {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("zero17_growth_sprints")
      .select("*")
      .eq("user_id", user.id)
      .order("week_of", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Get sprint error:", error);
      return NextResponse.json(
        { error: "Failed to load sprint" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(null);
    }

    const plan: GrowthSprintPlan = {
      id: data.id,
      userId: data.user_id,
      weekOf: data.week_of,
      focusSummary: data.focus_summary,
      primaryEngine: data.primary_engine,
      secondaryEngine: data.secondary_engine,
      northStarMetric: data.north_star_metric,
      targetValue: data.target_value,
      tasks: data.tasks ?? [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return NextResponse.json(plan);
  } catch (error) {
    console.error("GET sprint error:", error);
    return NextResponse.json(
      { error: "Failed to load sprint" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const plan = (await req.json()) as GrowthSprintPlan;

    const upsertPayload = {
      id: plan.id,
      user_id: user.id,
      week_of: plan.weekOf,
      focus_summary: plan.focusSummary,
      primary_engine: plan.primaryEngine,
      secondary_engine: plan.secondaryEngine ?? null,
      north_star_metric: plan.northStarMetric,
      target_value: plan.targetValue,
      tasks: plan.tasks,
    };

    const { data, error } = await supabase
      .from("zero17_growth_sprints")
      .upsert(upsertPayload, { onConflict: "id" })
      .select("*")
      .single();

    if (error) {
      console.error("Save sprint error:", error);
      return NextResponse.json(
        { error: "Failed to save sprint" },
        { status: 500 }
      );
    }

    const saved: GrowthSprintPlan = {
      id: data.id,
      userId: data.user_id,
      weekOf: data.week_of,
      focusSummary: data.focus_summary,
      primaryEngine: data.primary_engine,
      secondaryEngine: data.secondary_engine,
      northStarMetric: data.north_star_metric,
      targetValue: data.target_value,
      tasks: data.tasks ?? [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return NextResponse.json(saved);
  } catch (error) {
    console.error("POST sprint error:", error);
    return NextResponse.json(
      { error: "Failed to save sprint" },
      { status: 500 }
    );
  }
}

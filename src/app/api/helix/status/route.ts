// src/app/api/helix/status/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  let userId: string | null = null;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch (err) {
    console.error("[Helix] status auth error", err);
  }

  if (!userId) {
    return NextResponse.json({
      isSignedIn: false,
      lastResearch: null,
      lastGrowthRun: null,
      helixEvents: [],
    });
  }

  let lastResearch: any = null;
  let lastGrowthRun: any = null;
  let helixEvents: any[] = [];

  try {
    const { data, error } = await supabase
      .from("research_runs")
      .select("id, label, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (!error && data && data.length > 0) {
      lastResearch = data[0];
    }
  } catch (err) {
    console.error("[Helix] status research error", err);
  }

  try {
    const { data, error } = await supabase
      .from("growth_runs")
      .select("id, label, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (!error && data && data.length > 0) {
      lastGrowthRun = data[0];
    }
  } catch (err) {
    console.error("[Helix] status growth error", err);
  }

  try {
    const { data, error } = await supabase
      .from("helix_events")
      .select("id, source, kind, title, summary, next_move_summary, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(8);

    if (!error && data) {
      helixEvents = data;
    }
  } catch (err) {
    console.error("[Helix] status helix_events error", err);
  }

  return NextResponse.json({
    isSignedIn: true,
    lastResearch,
    lastGrowthRun,
    helixEvents,
  });
}

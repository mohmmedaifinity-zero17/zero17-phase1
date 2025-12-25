// src/app/api/builder/import-from-research/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(_req: NextRequest) {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("zero17_research_exports")
      .select("id, created_at, idea_json, blueprint_json")
      .eq("target", "builder")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("[Zero17] builder import DB error:", error);
      return NextResponse.json(
        { error: "DB query failed", details: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ export: null });
    }

    return NextResponse.json({ export: data });
  } catch (err: any) {
    console.error("[Zero17] builder import route error:", err);
    return NextResponse.json(
      {
        error: "Failed to import from research",
        details: String(err?.message || err),
      },
      { status: 500 }
    );
  }
}

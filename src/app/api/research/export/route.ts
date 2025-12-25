// src/app/api/research/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { ResearchIdea, Blueprint } from "@/lib/research/types";

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
    const blueprint = body.blueprint as Blueprint | null;
    const target = body.target as "builder" | "growth" | undefined;

    if (!idea || !blueprint || !target) {
      return NextResponse.json(
        { error: "Missing idea, blueprint, or target" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("zero17_research_exports")
      .insert({
        user_id: user.id,
        target,
        idea_json: idea,
        blueprint_json: blueprint,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[Zero17] research export error:", error);
      return NextResponse.json(
        { error: "DB insert failed", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: data.id });
  } catch (err: any) {
    console.error("[Zero17] research export route error:", err);
    return NextResponse.json(
      {
        error: "Failed to export blueprint",
        details: String(err?.message || err),
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { requireCtx } from "@/app/api/builder/_shared";

export const dynamic = "force-dynamic";

/**
 * GET /api/builder/projects
 * Returns user's projects (DEMO uses DEMO_USER_ID).
 */
export async function GET() {
  const ctx = await requireCtx();
  if (ctx.res) return ctx.res;

  const { supabase, userId } = ctx;

  const { data, error } = await supabase
    .from("builder_projects")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[GET /api/builder/projects] error:", error);
    return NextResponse.json(
      { error: "Failed to load projects", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ projects: data ?? [] }, { status: 200 });
}

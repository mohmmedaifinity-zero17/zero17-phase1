// src/app/api/growth/import-from-research/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
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
    .select("id, created_at, target, payload")
    .eq("user_id", user.id)
    .eq("target", "growth")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error("Error loading research export for growth:", error);
    return NextResponse.json(
      { error: "No recent Research export for Growth found" },
      { status: 404 }
    );
  }

  return NextResponse.json(data.payload ?? {});
}

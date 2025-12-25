// src/app/api/z17/projects/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

type ProjectRow = {
  id: string;
  name: string;
  kind: string;
  status: string;
  created_at: string;
  last_step: string | null;
};

// GET /api/z17/projects  → list projects
export async function GET() {
  const { data, error } = await supabaseServer
    .from("z17_projects")
    .select("id, name, kind, status, created_at, last_step")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { ok: true, projects: (data ?? []) as ProjectRow[] },
    { status: 200 }
  );
}

// POST /api/z17/projects  → create project
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const name = (body.name as string)?.trim() || "Untitled Zero17 Project";
  const kind = (body.kind as string)?.trim() || "mvp";
  const ideaSummary = (body.ideaSummary as string)?.trim() || null;

  const { data, error } = await supabaseServer
    .from("z17_projects")
    .insert({
      name,
      kind,
      idea_summary: ideaSummary,
      status: "draft",
      last_step: "idea",
    })
    .select("id, name, kind, status, created_at, last_step")
    .single();

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, project: data }, { status: 201 });
}

// src/app/api/z17/projects/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

// GET /api/z17/projects  → list projects (id, name, kind, status)
export async function GET() {
  const { data, error } = await supabaseServer
    .from("z17_projects")
    .select("id, name, kind, status, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, projects: data ?? [] }, { status: 200 });
}

// POST /api/z17/projects  → create a new project
// body: { name: string, kind?: 'mvp'|'agent'|'internal', ideaSummary?: string }
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const name = (body.name as string)?.trim();
  const kind = (body.kind as string)?.trim() || "mvp";
  const ideaSummary = (body.ideaSummary as string)?.trim() || null;

  if (!name) {
    return NextResponse.json(
      { ok: false, error: "name is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseServer
    .from("z17_projects")
    .insert({
      name,
      kind,
      idea_summary: ideaSummary,
      status: "draft",
    })
    .select("id, name, kind, status, created_at")
    .single();

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, project: data }, { status: 201 });
}

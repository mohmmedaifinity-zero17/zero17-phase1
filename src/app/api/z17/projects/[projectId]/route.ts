// src/app/api/z17/projects/[projectId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

type Params = { params: { projectId: string } };

type ProjectRow = {
  id: string;
  name: string;
  kind: string;
  status: string;
  created_at: string;
  last_step: string | null;
};

// GET /api/z17/projects/:projectId
export async function GET(_req: NextRequest, { params }: Params) {
  const projectId = params.projectId;

  if (!projectId || projectId.length < 10) {
    return NextResponse.json(
      { ok: false, error: "Invalid projectId" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseServer
    .from("z17_projects")
    .select("id, name, kind, status, created_at, last_step")
    .eq("id", projectId)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Project not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(
    { ok: true, project: data as ProjectRow },
    { status: 200 }
  );
}

// PATCH /api/z17/projects/:projectId  → rename / status / last_step
// body: { name?: string, status?: string, lastStep?: string }
export async function PATCH(req: NextRequest, { params }: Params) {
  const projectId = params.projectId;

  if (!projectId || projectId.length < 10) {
    return NextResponse.json(
      { ok: false, error: "Invalid projectId" },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => ({}));

  const update: Record<string, any> = {};
  if (typeof body.name === "string") {
    update.name = body.name.trim() || "Untitled Zero17 Project";
  }
  if (typeof body.status === "string") {
    update.status = body.status.trim().toLowerCase();
  }
  if (typeof body.lastStep === "string") {
    update.last_step = body.lastStep.trim().toLowerCase();
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json(
      { ok: false, error: "Nothing to update" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseServer
    .from("z17_projects")
    .update(update)
    .eq("id", projectId)
    .select("id, name, kind, status, created_at, last_step")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Update failed" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { ok: true, project: data as ProjectRow },
    { status: 200 }
  );
}

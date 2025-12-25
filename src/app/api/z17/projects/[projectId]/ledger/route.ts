// src/app/api/z17/projects/[projectId]/ledger/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

type Params = { params: { projectId: string } };

// GET → list ledger entries for project
export async function GET(_req: NextRequest, { params }: Params) {
  const { projectId } = params;

  if (!projectId || projectId.length < 10) {
    return NextResponse.json(
      { ok: false, error: "Invalid projectId" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseServer
    .from("z17_truth_ledger")
    .select("id, entry_type, hash, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, entries: data || [] }, { status: 200 });
}

// POST → create a simple ledger entry (stub)
export async function POST(req: NextRequest, { params }: Params) {
  const { projectId } = params;

  if (!projectId || projectId.length < 10) {
    return NextResponse.json(
      { ok: false, error: "Invalid projectId" },
      { status: 400 }
    );
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    // use defaults
  }

  const entryType =
    typeof body.entryType === "string" && body.entryType.trim()
      ? body.entryType.trim()
      : "qa";

  const payload = body.payload ?? {
    note: "Ledger entry created (stubbed)",
  };

  const hash =
    typeof body.hash === "string" && body.hash.trim()
      ? body.hash.trim()
      : "stub-" + Math.random().toString(36).slice(2, 10);

  const { data, error } = await supabaseServer
    .from("z17_truth_ledger")
    .insert({
      project_id: projectId,
      entry_type: entryType,
      payload,
      hash,
    })
    .select("id, entry_type, hash, created_at")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to create ledger entry" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, entry: data }, { status: 201 });
}

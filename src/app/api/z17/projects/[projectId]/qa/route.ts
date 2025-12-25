// src/app/api/z17/projects/[projectId]/qa/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

type Params = { params: { projectId: string } };

// GET → list QA runs for this project
export async function GET(_req: NextRequest, { params }: Params) {
  const { projectId } = params;

  if (!projectId || projectId.length < 10) {
    return NextResponse.json(
      { ok: false, error: "Invalid projectId" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseServer
    .from("z17_qa_runs")
    .select("id, label, status, score, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, qaRuns: data || [] }, { status: 200 });
}

// POST → create a QA run (stub, good enough for wiring)
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
    // default stub
  }

  const label =
    typeof body.label === "string" && body.label.trim()
      ? body.label.trim()
      : "Build Factory QA";

  const score =
    typeof body.score === "number" && !Number.isNaN(body.score)
      ? body.score
      : null;

  const report = body.report ?? {
    summary: "QA run created (stubbed)",
  };

  const { data, error } = await supabaseServer
    .from("z17_qa_runs")
    .insert({
      project_id: projectId,
      label,
      status: "passed",
      score,
      report,
    })
    .select("id, label, status, score, created_at")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to create QA run" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, qaRun: data }, { status: 201 });
}

import { NextResponse } from "next/server";
import type { BuilderProject } from "@/lib/builder/types";
import {
  requireUserOrDemo,
  getProjectOrThrow,
} from "@/app/api/builder/_shared";

type PostBody = { projectId: string };

function buildScan(project: BuilderProject) {
  const issues: any[] = [];
  let score = 95;

  if (!project.architecture_json) {
    score -= 15;
    issues.push({
      id: "no_arch",
      category: "reliability",
      severity: "high",
      description: "Architecture missing.",
      recommendation: "Complete Phase 2.",
    });
  }
  if (!project.test_plan_json) {
    score -= 10;
    issues.push({
      id: "no_tests",
      category: "reliability",
      severity: "medium",
      description: "Virtual tests not run.",
      recommendation: "Run Phase 5.",
    });
  }

  return { summary: `Smart Scan scored ${score}/100.`, score, issues };
}

export async function POST(req: Request) {
  const { supabase, userId } = await requireUserOrDemo();

  let body: PostBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.projectId)
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });

  const loaded = await getProjectOrThrow({
    supabase,
    projectId: body.projectId,
    userId,
    caller: "POST /api/builder/scan",
  });
  if (loaded.res) return loaded.res;

  const report = buildScan(loaded.project as BuilderProject);

  const { data: updated, error: updateErr } = await supabase
    .from("builder_projects")
    .update({ scan_report_json: report, status: "scanned" })
    .eq("id", body.projectId)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (updateErr) {
    console.error("[POST /api/builder/scan] update error:", updateErr);
    return NextResponse.json(
      { error: "Failed to save scan report" },
      { status: 500 }
    );
  }

  return NextResponse.json({ project: updated }, { status: 200 });
}

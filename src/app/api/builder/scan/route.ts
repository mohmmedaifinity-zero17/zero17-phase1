import { NextResponse } from "next/server";
import type { BuilderProject } from "@/lib/builder/types";
import {
  loadProjectOrRes,
  updateProjectOrRes,
} from "@/app/api/builder/_project";

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
      recommendation: "Complete Phase 2 and Save Architecture.",
    });
  }

  if (!project.test_plan_json) {
    score -= 10;
    issues.push({
      id: "no_tests",
      category: "reliability",
      severity: "medium",
      description: "Virtual tests not run.",
      recommendation: "Run Phase 5 Virtual Tests.",
    });
  }

  return { summary: `Smart Scan scored ${score}/100.`, score, issues };
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as PostBody | null;
  if (!body?.projectId)
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });

  const loaded = await loadProjectOrRes({
    projectId: body.projectId,
    caller: "POST /api/builder/scan",
  });
  if (loaded.res) return loaded.res;

  const { project, userId, supabase } = loaded;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const report = buildScan(project);

  const res = await updateProjectOrRes({
    projectId: project.id,
    userId,
    supabase,
    patch: { scan_report_json: report, status: "scanned" },
    caller: "POST /api/builder/scan",
  });

  return (
    res.res ?? NextResponse.json({ project: res.project }, { status: 200 })
  );
}

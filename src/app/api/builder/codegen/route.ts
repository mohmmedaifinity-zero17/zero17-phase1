import { NextResponse } from "next/server";
import type { BuilderProject, ExportPlan } from "@/lib/builder/types";
import {
  loadProjectOrRes,
  updateProjectOrRes,
} from "@/app/api/builder/_project";

type PostBody = { projectId: string };

function buildExportPlan(project: BuilderProject): ExportPlan {
  const buildType = project.kind ?? "app";

  const fileTree: any[] = [
    { path: "src/app/(app)/layout.tsx", purpose: "App shell + global styling" },
    { path: "src/app/(app)/page.tsx", purpose: "Landing / dashboard entry" },
    { path: "src/app/api/health/route.ts", purpose: "Health check endpoint" },
    {
      path: "README.md",
      purpose: "Run instructions + env + architecture notes",
    },
  ];

  if (buildType === "agent" || buildType === "workflow") {
    fileTree.push(
      {
        path: "src/lib/agents/registry.ts",
        purpose: "Agent employee registry",
      },
      { path: "src/lib/agents/tools.ts", purpose: "Tool contracts" },
      { path: "src/app/api/agent/run/route.ts", purpose: "Run agent session" }
    );
  }

  if (buildType === "dashboard") {
    fileTree.push(
      { path: "src/app/(app)/dashboard/page.tsx", purpose: "Dashboard route" },
      { path: "src/lib/metrics/compute.ts", purpose: "KPI compute layer" }
    );
  }

  return {
    summary: `Codegen Plan created for “${project.title}”.`,
    fileTree,
    commands: ["npm i", "npm run dev"],
    notes: [
      "Planner-first: deterministic scaffold plan stored in export_plan_json.",
    ],
  } as any;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as PostBody | null;
  if (!body?.projectId)
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });

  const loaded = await loadProjectOrRes({
    projectId: body.projectId,
    caller: "POST /api/builder/codegen",
  });
  if (loaded.res) return loaded.res;

  const { project, userId, supabase } = loaded;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const exportPlan = buildExportPlan(project);

  const res = await updateProjectOrRes({
    projectId: project.id,
    userId,
    supabase,
    patch: { export_plan_json: exportPlan, status: "codegen_planned" },
    caller: "POST /api/builder/codegen",
  });

  return (
    res.res ?? NextResponse.json({ project: res.project }, { status: 200 })
  );
}

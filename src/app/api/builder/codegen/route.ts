import { NextResponse } from "next/server";
import type { BuilderProject, ExportPlan } from "@/lib/builder/types";
import {
  requireUserOrDemo,
  getProjectOrThrow,
} from "@/app/api/builder/_shared";

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
      "Next: Refine → Virtual tests → Deploy blueprint.",
    ],
  } as any;
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
    caller: "POST /api/builder/codegen",
  });
  if (loaded.res) return loaded.res;

  const project = loaded.project as BuilderProject;
  const exportPlan = buildExportPlan(project);

  const { data: updated, error: updateErr } = await supabase
    .from("builder_projects")
    .update({ export_plan_json: exportPlan, status: "codegen_planned" })
    .eq("id", project.id)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (updateErr) {
    console.error("[POST /api/builder/codegen] update error:", updateErr);
    return NextResponse.json(
      { error: "Failed to save codegen plan" },
      { status: 500 }
    );
  }

  return NextResponse.json({ project: updated }, { status: 200 });
}

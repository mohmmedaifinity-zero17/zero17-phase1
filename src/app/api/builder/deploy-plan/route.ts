import { NextResponse } from "next/server";
import type { BuilderProject, DeploymentPlan } from "@/lib/builder/types";
import {
  requireUserOrDemo,
  getProjectOrThrow,
} from "@/app/api/builder/_shared";

type PostBody = { projectId: string };

function buildDeploymentPlan(project: BuilderProject): DeploymentPlan {
  return {
    target: "vercel",
    envVars: [
      {
        key: "NEXT_PUBLIC_SUPABASE_URL",
        required: true,
        hint: "Supabase project URL",
      },
      {
        key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        required: true,
        hint: "Supabase anon key",
      },
    ],
    steps: [
      {
        id: "repo",
        title: "Connect repo",
        detail: "Push to GitHub. Ensure main branch is deployable.",
      },
      {
        id: "env",
        title: "Configure env vars",
        detail: "Vercel → Settings → Environment Variables.",
      },
      {
        id: "db",
        title: "DB readiness",
        detail: "Verify tables + RLS policies.",
      },
      {
        id: "deploy",
        title: "Deploy",
        detail: "Deploy to Vercel and verify routing.",
      },
    ],
    smokeChecks: [
      "Open landing route and verify layout loads.",
      "Create a builder project and ensure it persists.",
      "Run Virtual tests + Scan once in production.",
    ],
    rollback: ["Rollback Vercel deployment", "Revert commit if needed"],
    summary: `Deploy blueprint for “${project.title}”.`,
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
    caller: "POST /api/builder/deploy-plan",
  });
  if (loaded.res) return loaded.res;

  const plan = buildDeploymentPlan(loaded.project as BuilderProject);

  const { data: updated, error: updateErr } = await supabase
    .from("builder_projects")
    .update({ deployment_plan_json: plan, status: "deploy_planned" })
    .eq("id", body.projectId)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (updateErr) {
    console.error("[POST /api/builder/deploy-plan] update error:", updateErr);
    return NextResponse.json(
      { error: "Failed to save deploy plan" },
      { status: 500 }
    );
  }

  return NextResponse.json({ project: updated }, { status: 200 });
}

import { NextResponse } from "next/server";
import type { BuilderProject, DeploymentPlan } from "@/lib/builder/types";
import {
  loadProjectOrRes,
  updateProjectOrRes,
} from "@/app/api/builder/_project";

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
      {
        key: "SUPABASE_SERVICE_ROLE_KEY",
        required: false,
        hint: "Server-only (needed in DEMO mode)",
      },
      {
        key: "ZERO17_DEMO_MODE",
        required: false,
        hint: "Set to 1 for Builder Lab without auth",
      },
      {
        key: "ZERO17_DEMO_USER_ID",
        required: false,
        hint: "UUID demo user id (matches rows)",
      },
    ],
    steps: [
      {
        id: "repo",
        title: "Connect repo",
        detail: "Push to GitHub. Ensure main deploys.",
      },
      {
        id: "env",
        title: "Configure env vars",
        detail: "Vercel → Settings → Environment Variables.",
      },
      {
        id: "db",
        title: "Database readiness",
        detail: "Tables + RLS ok; migrations applied if used.",
      },
      {
        id: "deploy",
        title: "Deploy",
        detail: "Deploy to Vercel, verify routing + API.",
      },
    ],
    smokeChecks: [
      "Open /builder and verify it loads.",
      "Create project and confirm it appears in list.",
      "Run Tests then Scan.",
      "Generate Docs then Diagnostics.",
    ],
    rollback: [
      "Rollback previous Vercel deployment",
      "Revert last commit",
      "If migration applied, rollback migration (if defined)",
    ],
    summary: `Deploy blueprint for “${project.title}”.`,
  } as any;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as PostBody | null;
  if (!body?.projectId)
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });

  const loaded = await loadProjectOrRes({
    projectId: body.projectId,
    caller: "POST /api/builder/deploy-plan",
  });
  if (loaded.res) return loaded.res;

  const { project, userId, supabase } = loaded;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plan = buildDeploymentPlan(project);

  const res = await updateProjectOrRes({
    projectId: project.id,
    userId,
    supabase,
    patch: { deployment_plan_json: plan, status: "deploy_planned" },
    caller: "POST /api/builder/deploy-plan",
  });

  return (
    res.res ?? NextResponse.json({ project: res.project }, { status: 200 })
  );
}

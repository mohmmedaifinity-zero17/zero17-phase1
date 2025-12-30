// src/app/api/builder/deployment/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type {
  BuilderProject,
  DeploymentPlan,
  DeploymentStep,
} from "@/lib/builder/types";

type PostBody = {
  projectId: string;
};

function buildDeploymentPlan(project: BuilderProject): DeploymentPlan {
  const arch = project.architecture_json;

  const steps: DeploymentStep[] = [];

  // 1) Infra
  steps.push({
    id: "infra_target",
    category: "infra",
    title: "Confirm hosting target & region",
    description:
      "Pick a concrete hosting target (e.g., Vercel / Fly.io) and region close to your primary users.",
  });

  // 2) Auth
  steps.push({
    id: "auth_wiring",
    category: "auth",
    title: "Wire authentication provider",
    description:
      "Connect the app to your chosen auth provider (Supabase Auth / Auth0 / Clerk). Lock every write behind auth.",
  });

  // 3) DB
  steps.push({
    id: "db_migrations",
    category: "database",
    title: "Run DB migrations from schema",
    description:
      "Apply the entity schema to your managed database, enable backups and enforce row-level security if supported.",
  });

  // 4) ENV
  steps.push(
    {
      id: "env_local",
      category: "env",
      title: "Fill `.env.local` for dev",
      description:
        "Copy `.env.example` to `.env.local` and fill values for Supabase URL / KEY, auth secrets and any third-party APIs.",
    },
    {
      id: "env_prod",
      category: "env",
      title: "Fill production env vars in hosting dashboard",
      description:
        "Mirror the same env variables in Vercel / hosting provider with production credentials.",
    }
  );

  // 5) CI/CD
  steps.push(
    {
      id: "ci_setup",
      category: "ci_cd",
      title: "Configure CI pipeline",
      description:
        "Set up GitHub Actions / other CI to run tests (acceptance + API health) on every push to main.",
    },
    {
      id: "ci_block",
      category: "ci_cd",
      title: "Block deploys on failing tests",
      description:
        "Ensure your CI/CD pipeline prevents production deploys when any test suite fails.",
    }
  );

  // 6) Monitoring
  steps.push(
    {
      id: "monitoring_logs",
      category: "monitoring",
      title: "Hook logs & error tracking",
      description:
        "Attach logging and error tracking (e.g., Sentry / Axiom) to catch runtime failures and edge cases.",
    },
    {
      id: "monitoring_uptime",
      category: "monitoring",
      title: "Add uptime & latency checks",
      description:
        "Configure uptime checks for core endpoints and track response time / error rate baselines.",
    }
  );

  // 7) Launch
  steps.push(
    {
      id: "launch_sanity",
      category: "launch",
      title: "Run final QA against acceptance tests",
      description:
        "Manually walk through QA Lens acceptance tests and confirm they pass in the staging or preview environment.",
    },
    {
      id: "launch_announce",
      category: "launch",
      title: "Prepare launch assets",
      description:
        "Write the one-line pitch, a short narrative, and a simple screenshot / loom to announce the product.",
    }
  );

  const summary = `Deployment plan for “${project.title}” targeting a production environment. Follow these steps in order to go from Builder Lab output to a safe launch.`;

  return {
    summary,
    target: "production",
    steps,
  };
}

export async function POST(req: Request) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: PostBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  const { projectId } = body;

  const { data: projectData, error: projectError } = await supabase
    .from("builder_projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (projectError) {
    console.error(
      "[POST /api/builder/deployment] project fetch error:",
      projectError
    );
    return NextResponse.json(
      { error: "Failed to load project" },
      { status: 500 }
    );
  }

  if (!projectData) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const project = projectData as BuilderProject;

  const plan = buildDeploymentPlan(project);

  const { error: updateError } = await supabase
    .from("builder_projects")
    .update({ deployment_plan_json: plan })
    .eq("id", project.id);

  if (updateError) {
    console.error("[POST /api/builder/deployment] update error:", updateError);
    return NextResponse.json(
      { error: "Failed to save deployment plan" },
      { status: 500 }
    );
  }

  await supabase.from("builder_runs").insert({
    project_id: project.id,
    phase: "deployment_plan",
    status: "success",
    meta_json: {
      steps: plan.steps?.length ?? 0,
    },
  });

  return NextResponse.json(plan, { status: 200 });
}

import { NextResponse } from "next/server";
import {
  loadProjectOrRes,
  updateProjectOrRes,
} from "@/app/api/builder/_project";
import type { BuilderProject } from "@/lib/builder/types";

type PostBody = { projectId: string; refineId?: string };

function iso() {
  return new Date().toISOString();
}
function mkId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function minimalSpec(buildType: string) {
  return {
    productLens: {
      oneLiner: "Auto-generated spec skeleton (Patch Engine v1).",
      targetUsers: ["early adopters"],
      coreValue: "Turn intent into a structured build plan and execution rail.",
      mustHaveFeatures: ["Project persistence", "Core flows"],
    },
    qaLens: {
      acceptanceTests: [
        "Create project persists",
        "Save spec persists",
        "Save architecture persists",
      ],
    },
    agentLens:
      buildType === "agent" || buildType === "workflow"
        ? {
            agents: [
              {
                name: "Supervisor",
                mission: "Coordinate sub-agents.",
                tools: ["planner"],
                handoffs: ["QA"],
              },
            ],
          }
        : { agents: [] },
  };
}

function minimalArchitecture(buildType: string) {
  return {
    infra: {
      authProvider: "supabase",
      database: "supabase-postgres",
      hosting: "vercel",
    },
    entities: [
      {
        id: "builder_project",
        name: "BuilderProject",
        description: "builder_projects row",
        kind: "data",
      },
    ],
    screens: [
      { id: "builder_home", name: "Builder", purpose: "Execute phases" },
    ],
  };
}

function selectRefinePlan(project: BuilderProject, refineId?: string) {
  const ep: any = project.export_plan_json ?? {};
  const refinements: any[] = ep?.refinements ?? [];
  if (!refinements.length) return null;
  if (!refineId) return refinements[0];
  return refinements.find((r) => r.id === refineId) ?? null;
}

function computePatch(project: BuilderProject, refine: any) {
  const prompt: string = (refine?.prompt ?? "").toString().toLowerCase();
  const source: string = (refine?.source ?? "user_prompt").toString();
  const allow = source === "autofix";

  if (!allow) {
    return {
      ok: false,
      error:
        "Latest refine plan is not an autofix plan. Create Autofix Plan from Phase 10 first.",
    };
  }

  const changes: any = {};
  const actions: string[] = [];

  if (!project.spec_json) {
    changes.spec_json = minimalSpec(project.kind ?? "app");
    actions.push("Filled spec_json (safe default).");
  }
  if (!project.architecture_json) {
    changes.architecture_json = minimalArchitecture(project.kind ?? "app");
    actions.push("Filled architecture_json (safe default).");
  }

  const patchLog = {
    id: mkId("patch"),
    createdAt: iso(),
    refineId: refine?.id ?? null,
    source: "patch_engine_v1",
    actions,
  };

  return { ok: true, changes, patchLog };
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (!body.projectId)
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });

  const loaded = await loadProjectOrRes({
    projectId: body.projectId,
    caller: "POST /api/builder/apply-patch",
  });
  if (loaded.res) return loaded.res;

  const { project, userId, supabase } = loaded;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const refine = selectRefinePlan(project, body.refineId);
  if (!refine)
    return NextResponse.json(
      { error: "No refine plans found. Create Autofix Plan first." },
      { status: 400 }
    );

  const computed = computePatch(project, refine);
  if (!computed.ok)
    return NextResponse.json({ error: computed.error }, { status: 400 });

  const existingPatches = (project.patches as any[]) ?? [];
  const nextPatches = [computed.patchLog, ...existingPatches].slice(0, 50);

  // Status progression
  const hasSpec = !!(computed.changes.spec_json ?? project.spec_json);
  const hasArch = !!(
    computed.changes.architecture_json ?? project.architecture_json
  );

  let nextStatus = project.status;
  if (hasSpec && !hasArch) nextStatus = "structured";
  if (hasSpec && hasArch) nextStatus = "architected";

  const res = await updateProjectOrRes({
    projectId: project.id,
    userId,
    supabase,
    patch: {
      ...computed.changes,
      patches: nextPatches,
      status: nextStatus,
    },
    caller: "POST /api/builder/apply-patch",
  });

  return (
    res.res ??
    NextResponse.json(
      { project: res.project, patch: computed.patchLog },
      { status: 200 }
    )
  );
}

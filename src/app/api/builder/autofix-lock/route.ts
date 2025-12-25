import { NextResponse } from "next/server";
import {
  requireUserOrDemo,
  getProjectOrThrow,
} from "@/app/api/builder/_shared";
import type { BuilderProject } from "@/lib/builder/types";

/**
 * This endpoint orchestrates:
 * - Create Autofix plan (from diagnostics)
 * - Apply Patch (JSON-only)
 * - Run Tests (Phase 6)
 * - Run Diagnostics (Phase 10)
 * - Lock fix into export_plan_json.locked_fixes[]
 *
 * No filesystem edits. Deterministic and safe.
 */

type PostBody = {
  projectId: string;
};

function iso() {
  return new Date().toISOString();
}

function mkId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function getTopDiag(project: any) {
  const diags = project?.diagnostics_json ?? null;
  const items = diags?.items ?? [];
  return items.length > 0 ? items[0] : null;
}

function getTestScore(project: any) {
  const cases = project?.test_plan_json?.cases ?? [];
  const fails = cases.filter((c: any) => c.status === "virtual_fail").length;
  const total = cases.length || 0;
  let score = 100;
  score -= fails * 10;
  score = Math.max(40, Math.min(99, Math.round(score)));
  return { fails, total, score };
}

/** create refine prompt from top diagnostic item (same logic as refine route) */
function buildAutofixPromptFromTop(top: any) {
  return (
    `AUTOFIX TARGET:\n` +
    `Area: ${top.area}\n` +
    `Symptom: ${top.symptom}\n` +
    `Likely cause: ${top.likelyCause}\n\n` +
    `Goal:\nFix this issue with minimal edits. Keep APIs returning {project}. ` +
    `Update types first if JSON shape changes. After fix, rerun Phase 6 + Phase 10 and ensure priority drops.\n\n` +
    `Suggested fix:\n${top.suggestedFix}\n`
  );
}

function minimalSpec(buildType: string) {
  return {
    productLens: {
      oneLiner: "Auto-generated spec skeleton (Autofix Lock v1).",
      targetUsers: ["early adopters"],
      coreValue: "Turn intent into a structured build plan and execution rail.",
      mustHaveFeatures: [
        "Project persistence",
        "Core flows",
        "Docs/Diagnostics",
      ],
    },
    uxLens: {
      tone: "premium, clean, high-contrast",
      layout: "cards + rails",
      accessibility: "AA target",
    },
    qaLens: {
      acceptanceTests: [
        "Create project persists",
        "Save spec persists",
        "Save architecture persists",
        "Run tests stores test_plan_json",
        "Run diagnostics stores diagnostics_json",
      ],
    },
    agentLens:
      buildType === "agent" || buildType === "workflow"
        ? {
            agents: [
              {
                name: "Supervisor",
                mission: "Coordinate sub-agents and enforce guardrails.",
                tools: ["db", "fetch", "planner"],
                handoffs: ["Builder", "QA"],
              },
              {
                name: "Builder",
                mission: "Translate spec+arch into build actions.",
                tools: ["planner", "diff"],
                handoffs: ["QA"],
              },
              {
                name: "QA",
                mission: "Run checks and propose fixes.",
                tools: ["tests", "scan"],
                handoffs: ["Supervisor"],
              },
            ],
          }
        : { agents: [] },
  };
}

function minimalArchitecture(buildType: string) {
  const entities: any[] = [
    {
      id: "user",
      name: "User",
      description: "Authenticated user (Supabase auth.users)",
      kind: "data",
      notes: "Owned by Supabase Auth",
    },
    {
      id: "builder_project",
      name: "BuilderProject",
      description: "builder_projects row (core artifact store)",
      kind: "data",
      notes: "JSON columns store spec/arch/tests/docs/diagnostics",
    },
  ];

  if (buildType === "agent" || buildType === "workflow") {
    entities.push({
      id: "agent_run",
      name: "AgentRun",
      description: "Execution trace for agent sessions",
      kind: "data",
      notes: "Optional table later; v1 can store traces in JSON",
    });
  }

  return {
    infra: {
      authProvider: "supabase",
      database: "supabase-postgres",
      hosting: "vercel",
      logging: "console (v1) → structured logs (v2)",
    },
    entities,
    screens: [
      {
        id: "builder_home",
        name: "Builder",
        purpose: "Execute phases end-to-end",
      },
    ],
  };
}

function minimalDeploymentPlan(project: any) {
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
        title: "Push to GitHub",
        detail: "Commit and push main branch.",
      },
      {
        id: "env",
        title: "Set env vars",
        detail: "Vercel → Settings → Env Vars.",
      },
      {
        id: "db",
        title: "Verify RLS",
        detail: "Confirm owner-only access policies.",
      },
      { id: "deploy", title: "Deploy", detail: "Deploy and verify routes." },
    ],
    smokeChecks: [
      "Open /builder",
      "Create project persists",
      "Run Phase 6 tests + Phase 10 diagnostics",
    ],
    rollback: ["Rollback Vercel deployment", "Revert commit if needed"],
    summary: `Deploy blueprint generated by Autofix Lock v1 for “${project.title}”.`,
  };
}

/** Patch computation (same philosophy as apply-patch route) */
function computeSafePatch(project: any, promptLower: string) {
  const changes: any = {};
  const actions: string[] = [];

  const needsSpec = !project.spec_json;
  const needsArch = !project.architecture_json;
  const needsDeploy = !project.deployment_plan_json;

  if (needsSpec) {
    changes.spec_json = minimalSpec(project.build_type);
    actions.push("Filled spec_json with minimal safe skeleton.");
  }
  if (needsArch) {
    changes.architecture_json = minimalArchitecture(project.build_type);
    actions.push("Filled architecture_json with minimal safe skeleton.");
  }
  if (
    needsDeploy &&
    (promptLower.includes("deploy") || promptLower.includes("vercel"))
  ) {
    changes.deployment_plan_json = minimalDeploymentPlan(project);
    actions.push(
      "Generated minimal deployment_plan_json (prompt indicated deploy)."
    );
  }

  return { changes, actions };
}

/** Deterministic Virtual Tests v2 (same pass/fail logic as your test route) */
function runVirtualTests(project: any) {
  const hasSpec = !!project.spec_json;
  const hasArch = !!project.architecture_json;

  const baseCases = [
    { title: "Create Builder project persists", key: "create" },
    { title: "Phase 1 Save Spec persists (spec_json)", key: "spec" },
    {
      title: "Phase 2 Save Architecture persists (architecture_json)",
      key: "arch",
    },
    { title: "APIs always return { project }", key: "shape" },
  ];

  const cases = baseCases.map((c) => {
    let status: any = "virtual_pass";
    let notes = "";

    if (c.key === "spec" && !hasSpec) {
      status = "virtual_fail";
      notes = "WHY: Spec missing.\nFIX NOW: Complete Phase 1 and Save.";
    }
    if (c.key === "arch" && !hasArch) {
      status = "virtual_fail";
      notes = "WHY: Architecture missing.\nFIX NOW: Complete Phase 2 and Save.";
    }
    if (!hasSpec && !hasArch && (c.key === "create" || c.key === "shape")) {
      status = "virtual_fail";
      notes =
        "WHY: Structural definition missing.\nFIX NOW: Complete Phase 1 + Phase 2 first.";
    }

    return {
      id: mkId("tc"),
      title: c.title,
      description: "Virtual test (deterministic).",
      area: "happy_path",
      risk: "high",
      status,
      lastRunAt: iso(),
      notes,
    };
  });

  const fail = cases.filter((x: any) => x.status === "virtual_fail").length;
  const pass = cases.length - fail;

  let score = 100;
  if (!hasSpec) score -= 20;
  if (!hasArch) score -= 25;
  score -= fail * 8;
  score = Math.max(40, Math.min(99, Math.round(score)));

  return {
    test_plan_json: {
      summary: `Virtual Tests (Autofix Lock v1) for “${project.title}”. Pass ${pass}/${cases.length}.`,
      coverageAreas: ["Persistence", "Definition-of-done rails"],
      cases,
    },
    testSummary: { total: cases.length, pass, fail, score },
  };
}

/** Deterministic Diagnostics v2 (ROI ranking) */
function runDiagnostics(project: any) {
  const items: any[] = [];

  const add = (x: any) => items.push({ id: mkId("diag"), ...x });

  if (!project.spec_json) {
    add({
      area: "Spec",
      severity: "error",
      symptom: "spec_json missing",
      likelyCause: "Phase 1 not completed.",
      suggestedFix: "Complete Phase 1 lenses and Save.",
      minutes: 8,
      phase: "Phase 1",
    });
  }
  if (!project.architecture_json) {
    add({
      area: "Architecture",
      severity: "error",
      symptom: "architecture_json missing",
      likelyCause: "Phase 2 not completed.",
      suggestedFix: "Define entities + infra and Save.",
      minutes: 12,
      phase: "Phase 2",
    });
  }

  const tcases = project?.test_plan_json?.cases ?? [];
  const fails = tcases.filter((c: any) => c.status === "virtual_fail");

  for (const f of fails.slice(0, 6)) {
    add({
      area: "Tests",
      severity: "warning",
      symptom: `Virtual test failing: ${f.title}`,
      likelyCause: "Prerequisite artifact missing or inconsistent.",
      suggestedFix: f.notes || "Follow Fix Now from the failing test.",
      minutes: 10,
      phase: /spec_json/i.test(f.title)
        ? "Phase 1"
        : /architecture_json/i.test(f.title)
          ? "Phase 2"
          : "Phase 4",
    });
  }

  // ROI
  const roi = (sev: string, minutes: number) => {
    const s = sev === "error" ? 3 : sev === "warning" ? 2 : 1;
    const t = Math.max(5, minutes);
    return Math.round(((s * 120) / t) * 10) / 10;
  };

  const ranked = items
    .map((it, idx) => ({
      ...it,
      roi: roi(it.severity, it.minutes),
      priority: idx + 1,
    }))
    .sort((a, b) => b.roi - a.roi)
    .map((it, idx) => ({ ...it, priority: idx + 1 }));

  const report = {
    summary: `Diagnostics ranked ${ranked.length} fix(es) by ROI (severity ÷ time).`,
    items: ranked.map((it) => ({
      id: it.id,
      area: it.area,
      severity: it.severity,
      symptom: it.symptom,
      likelyCause: it.likelyCause,
      suggestedFix: `${it.suggestedFix}\n\n— META: Priority #${it.priority} • Phase: ${it.phase} • ETA: ${it.minutes}m • ROI: ${it.roi}`,
    })),
  };

  return { diagnostics_json: report };
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
    caller: "POST /api/builder/autofix-lock",
  });
  if (loaded.res) return loaded.res;

  const project = loaded.project as any;

  // Snapshot before (capture original state)
  const originalProject = project;
  let projectState: any = { ...project };

  // Snapshot before
  const beforeTop = getTopDiag(projectState);
  const beforeTest = getTestScore(projectState);

  // Ensure diagnostics exist
  if (!projectState.diagnostics_json) {
    const d = runDiagnostics(projectState);
    projectState = { ...projectState, ...d };
  }

  const top = getTopDiag(projectState);
  if (!top) {
    return NextResponse.json(
      { error: "No diagnostic items to fix. You are already clean." },
      { status: 400 }
    );
  }

  // Create autofix refine plan entry
  const refine = {
    id: mkId("ref"),
    createdAt: iso(),
    source: "autofix",
    mode: "safe",
    tags: ["autofix"],
    prompt: buildAutofixPromptFromTop(top),
    goal: `Autofix Plan generated from top diagnostic for “${projectState.title}”.`,
    assumptions: [
      "Supabase rail",
      "Deterministic patch engine",
      "JSON-only safe edits",
    ],
    filesTouched: [
      {
        path: "builder_projects.spec_json",
        reason: "May be filled if missing",
      },
      {
        path: "builder_projects.architecture_json",
        reason: "May be filled if missing",
      },
      {
        path: "builder_projects.deployment_plan_json",
        reason: "May be filled if missing",
      },
    ],
    steps: [
      {
        id: "patch",
        title: "Apply patch",
        detail: "Fill missing artifacts safely.",
      },
      { id: "tests", title: "Verify tests", detail: "Run virtual tests." },
      {
        id: "diags",
        title: "Verify diagnostics",
        detail: "Re-rank issues and confirm improvement.",
      },
      {
        id: "lock",
        title: "Lock",
        detail: "Write Truth Ledger entry to prevent regressions.",
      },
    ],
    riskChecks: [
      "No filesystem edits",
      "No DB migrations",
      "Owner-only updates",
    ],
    rollback: ["Revert JSON fields to previous snapshot"],
  };

  // Apply patch
  const promptLower = refine.prompt.toLowerCase();
  const { changes, actions } = computeSafePatch(projectState, promptLower);

  // Merge export_plan_json
  const ep: any = projectState.export_plan_json ?? {};
  const nextExport = {
    ...ep,
    refinements: [refine, ...(ep.refinements ?? [])].slice(0, 20),
  };

  // Update project in-memory
  projectState = {
    ...projectState,
    ...changes,
    export_plan_json: nextExport,
    status: "patched",
    updated_at: iso(),
  };

  // Run tests
  const tests = runVirtualTests(projectState);
  projectState = {
    ...projectState,
    ...tests,
    status: "tested",
    updated_at: iso(),
  };

  // Run diagnostics
  const diags = runDiagnostics(projectState);
  projectState = {
    ...projectState,
    ...diags,
    status: "diagnosed",
    updated_at: iso(),
  };

  // Snapshot after
  const afterTop = getTopDiag(projectState);
  const afterTest = getTestScore(projectState);

  // Lock entry (Truth Ledger)
  const locked = {
    id: mkId("lock"),
    createdAt: iso(),
    title: `Locked autofix for top diagnostic: ${top.area}`,
    proof: {
      beforeTop: beforeTop
        ? { area: beforeTop.area, symptom: beforeTop.symptom }
        : null,
      afterTop: afterTop
        ? { area: afterTop.area, symptom: afterTop.symptom }
        : null,
      beforeTest,
      afterTest,
      actions,
    },
    rule: "If top diagnostic resurfaces, rerun autofix-lock and convert into a permanent guardrail test.",
  };

  const finalExport = {
    ...(originalProject.export_plan_json ?? {}),
    patches: [
      {
        id: mkId("patch"),
        createdAt: iso(),
        refineId: refine.id,
        source: "autofix_lock_v1",
        actions,
        before: {
          hasSpec: !!originalProject.spec_json,
          hasArch: !!originalProject.architecture_json,
          hasDeploy: !!originalProject.deployment_plan_json,
        },
        after: {
          hasSpec: !!projectState.spec_json,
          hasArch: !!projectState.architecture_json,
          hasDeploy: !!projectState.deployment_plan_json,
        },
      },
      ...((projectState.export_plan_json?.patches ?? []) as any[]),
    ].slice(0, 30),
    locked_fixes: [
      locked,
      ...((projectState.export_plan_json?.locked_fixes ?? []) as any[]),
    ].slice(0, 50),
  };

  // Persist to DB
  const { data: updated, error: updateErr } = await supabase
    .from("builder_projects")
    .update({
      spec_json: projectState.spec_json ?? null,
      architecture_json: projectState.architecture_json ?? null,
      deployment_plan_json: projectState.deployment_plan_json ?? null,
      test_plan_json: projectState.test_plan_json ?? null,
      diagnostics_json: projectState.diagnostics_json ?? null,
      export_plan_json: finalExport,
      status: "locked",
      updated_at: new Date().toISOString(),
    })
    .eq("id", body.projectId)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (updateErr) {
    console.error("[POST /api/builder/autofix-lock] update error:", updateErr);
    return NextResponse.json(
      { error: "Failed to save autofix lock result" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      project: updated,
      locked,
      before: { beforeTop, beforeTest },
      after: { afterTop, afterTest },
    },
    { status: 200 }
  );
}

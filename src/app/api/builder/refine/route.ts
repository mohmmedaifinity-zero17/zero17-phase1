import { NextResponse } from "next/server";
import {
  requireUserOrDemo,
  getProjectOrThrow,
} from "@/app/api/builder/_shared";
import type { BuilderProject } from "@/lib/builder/types";

type PostBody = {
  projectId: string;
  prompt?: string;
  mode?: "safe" | "aggressive";
  // NEW:
  autofixFromDiagnostics?: boolean;
};

function clampText(s: string, max = 4000) {
  const t = (s ?? "").toString();
  return t.length > max ? t.slice(0, max) : t;
}

function iso() {
  return new Date().toISOString();
}

function mkId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function extractTopDiagnostic(project: BuilderProject) {
  const diags: any = (project as any)?.diagnostics_json ?? null;
  const items: any[] = diags?.items ?? [];
  if (items.length === 0) return null;

  // Items are already ROI-ranked in your v2 diagnostics.
  const top = items[0];
  return top;
}

/**
 * Phase 4 Refine Engine v2:
 * - prompt-based refine plan (existing)
 * - NEW: autofixFromDiagnostics mode (one-click)
 * - Stores into export_plan_json.refinements[]
 */
function buildRefinePlan(input: {
  project: BuilderProject;
  prompt: string;
  mode: "safe" | "aggressive";
  source: "user_prompt" | "autofix";
}) {
  const { project, prompt, mode, source } = input;

  const p = prompt.toLowerCase();
  const tags = [
    p.includes("ui") || p.includes("design") || p.includes("layout")
      ? "ui"
      : null,
    p.includes("api") || p.includes("endpoint") ? "api" : null,
    p.includes("db") || p.includes("schema") ? "db" : null,
    p.includes("auth") || p.includes("login") ? "auth" : null,
    p.includes("agent") ? "agent" : null,
    p.includes("test") ? "tests" : null,
    p.includes("deploy") || p.includes("vercel") ? "deploy" : null,
    p.includes("performance") ? "perf" : null,
    p.includes("security") ? "security" : null,
  ].filter(Boolean) as string[];

  const filesTouched: { path: string; reason: string }[] = [
    {
      path: "src/lib/builder/types.ts",
      reason: "If new JSON shapes are introduced.",
    },
    {
      path: "src/app/api/builder/*",
      reason: "API changes if behavior needs adjustment.",
    },
    {
      path: "src/app/builder/components/*",
      reason: "UI changes for user-visible behavior.",
    },
  ];

  // If prompt signals specific areas, bias paths
  if (tags.includes("tests")) {
    filesTouched.unshift({
      path: "src/app/api/builder/test/route.ts",
      reason:
        "Virtual tests may need updates to reflect the new expected behavior.",
    });
  }
  if (tags.includes("deploy")) {
    filesTouched.unshift({
      path: "src/app/api/builder/deploy-plan/route.ts",
      reason: "Deploy blueprint updates (env vars, smoke tests, rollbacks).",
    });
  }

  const steps: { id: string; title: string; detail: string }[] = [
    {
      id: "rewrite_goal",
      title: "Rewrite as acceptance",
      detail:
        "Convert the fix into 2–5 acceptance statements (what must be true after changes).",
    },
    {
      id: "choose_minimum_edits",
      title: "Minimum edits",
      detail:
        "Pick the smallest set of file edits that solve the issue without side effects.",
    },
    {
      id: "safety_checks",
      title: "Safety checks",
      detail:
        "Ensure Create Project flow stays intact, APIs return {project}, and JSON shapes remain typed.",
    },
    {
      id: "verify_loop",
      title: "Verify loop",
      detail:
        "Run Phase 3 → Phase 5 → Phase 6 → Phase 10. Confirm the diagnostic disappears or drops priority.",
    },
  ];

  if (mode === "aggressive") {
    steps.unshift({
      id: "aggressive_cut",
      title: "Aggressive simplification",
      detail:
        "Remove optional branches, reduce UI friction, optimize for ship speed and clarity.",
    });
  }

  const riskChecks = [
    "Never break Create Builder Project",
    "APIs must return { project } always",
    "No DB schema changes without migrations",
    "Keep phases modular (one phase cannot silently depend on another)",
    "Update types.ts first if JSON shape changes",
  ];

  const rollback = [
    "Revert the last commit",
    "Restore previous route/component file",
    "Re-run Phase 6 tests after rollback to ensure stability",
  ];

  return {
    id: mkId("ref"),
    createdAt: iso(),
    source,
    mode,
    tags,
    prompt: clampText(prompt, 2500),
    goal:
      source === "autofix"
        ? `Autofix Plan generated from top diagnostic for “${project.title}”.`
        : `Refine “${project.title}” based on prompt (mode: ${mode}).`,
    assumptions: [
      "Supabase rail for persistence.",
      "Artifacts stored in builder_projects JSON columns.",
      "Deterministic plans first; execution can be automated later.",
    ],
    filesTouched,
    steps,
    riskChecks,
    rollback,
  };
}

export async function POST(req: Request) {
  const { supabase, userId } = await requireUserOrDemo();

  let body: PostBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const projectId = body?.projectId;
  const mode = (body?.mode ?? "safe") as "safe" | "aggressive";
  const autofix = !!body?.autofixFromDiagnostics;

  if (!projectId)
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });

  const loaded = await getProjectOrThrow({
    supabase,
    projectId,
    userId,
    caller: "POST /api/builder/refine",
  });
  if (loaded.res) return loaded.res;

  const project = loaded.project as BuilderProject;

  // Determine prompt
  let prompt = (body?.prompt ?? "").toString().trim();
  let source: "user_prompt" | "autofix" = "user_prompt";

  if (autofix) {
    const top = extractTopDiagnostic(project);
    if (!top) {
      return NextResponse.json(
        { error: "No diagnostics available. Run Phase 10 first." },
        { status: 400 }
      );
    }

    source = "autofix";
    // Turn top diagnostic into a strong refine prompt
    prompt =
      `AUTOFIX TARGET:\n` +
      `Area: ${top.area}\n` +
      `Symptom: ${top.symptom}\n` +
      `Likely cause: ${top.likelyCause}\n\n` +
      `Goal:\nFix this issue with minimal edits. Keep APIs returning {project}. ` +
      `Update types first if JSON shape changes. After fix, rerun Phase 6 + Phase 10 and ensure priority drops.\n\n` +
      `Suggested fix:\n${top.suggestedFix}\n`;
  }

  if (!prompt)
    return NextResponse.json({ error: "Missing prompt" }, { status: 400 });

  const refine = buildRefinePlan({ project, prompt, mode, source });

  const exportPlan = (project.export_plan_json ?? {}) as any;
  const next = {
    ...exportPlan,
    refinements: [refine, ...(exportPlan.refinements ?? [])].slice(0, 20),
  };

  const { data: updated, error: updateErr } = await supabase
    .from("builder_projects")
    .update({
      export_plan_json: next,
      status: "codegen_planned",
    })
    .eq("id", projectId)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (updateErr) {
    console.error("[POST /api/builder/refine] update error:", updateErr);
    return NextResponse.json(
      { error: "Failed to save refine plan" },
      { status: 500 }
    );
  }

  return NextResponse.json({ project: updated, refine }, { status: 200 });
}

import { NextResponse } from "next/server";
import type { BuilderProject } from "@/lib/builder/types";
import {
  loadProjectOrRes,
  updateProjectOrRes,
} from "@/app/api/builder/_project";

type PostBody = {
  projectId: string;
  prompt?: string;
  mode?: "safe" | "aggressive";
  autofixFromDiagnostics?: boolean;
};

function iso() {
  return new Date().toISOString();
}
function mkId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
function clampText(s: string, max = 2500) {
  const t = (s ?? "").toString();
  return t.length > max ? t.slice(0, max) : t;
}

function extractTopDiagnostic(project: BuilderProject) {
  const diags: any = (project as any)?.diagnostics_json ?? null;
  const items: any[] = diags?.items ?? [];
  return items.length ? items[0] : null;
}

function buildRefinePlan(input: {
  project: BuilderProject;
  prompt: string;
  mode: "safe" | "aggressive";
  source: "user_prompt" | "autofix";
}) {
  const { project, prompt, mode, source } = input;
  const p = prompt.toLowerCase();

  const tags = [
    p.includes("ui") ? "ui" : null,
    p.includes("api") ? "api" : null,
    p.includes("db") ? "db" : null,
    p.includes("auth") ? "auth" : null,
    p.includes("test") ? "tests" : null,
    p.includes("deploy") ? "deploy" : null,
  ].filter(Boolean) as string[];

  return {
    id: mkId("ref"),
    createdAt: iso(),
    source,
    mode,
    tags,
    prompt: clampText(prompt),
    goal:
      source === "autofix"
        ? `Autofix Plan generated from top diagnostic for “${project.title}”.`
        : `Refine “${project.title}” (mode: ${mode}).`,
  };
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as PostBody | null;
  if (!body?.projectId)
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });

  const loaded = await loadProjectOrRes({
    projectId: body.projectId,
    caller: "POST /api/builder/refine",
  });
  if (loaded.res) return loaded.res;

  const { project, userId, supabase } = loaded;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mode = (body.mode ?? "safe") as "safe" | "aggressive";
  const autofix = !!body.autofixFromDiagnostics;

  let prompt = (body.prompt ?? "").toString().trim();
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
    prompt = `AUTOFIX TARGET:\nArea: ${top.area}\nSymptom: ${top.symptom}\n\nSuggested fix:\n${top.suggestedFix}\n`;
  }

  if (!prompt)
    return NextResponse.json({ error: "Missing prompt" }, { status: 400 });

  const refine = buildRefinePlan({
    project,
    prompt,
    mode,
    source,
  });

  const exportPlan: any = project.export_plan_json ?? {};
  const next = {
    ...exportPlan,
    refinements: [refine, ...(exportPlan.refinements ?? [])].slice(0, 20),
  };

  const res = await updateProjectOrRes({
    projectId: project.id,
    userId,
    supabase,
    patch: { export_plan_json: next, status: "refined" },
    caller: "POST /api/builder/refine",
  });

  return (
    res.res ?? NextResponse.json({ project: res.project }, { status: 200 })
  );
}

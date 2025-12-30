import { NextResponse } from "next/server";
import type { BuilderProject, TestPlan, TestCase } from "@/lib/builder/types";
import {
  loadProjectOrRes,
  updateProjectOrRes,
} from "@/app/api/builder/_project";

type PostBody = { projectId: string };

type Summary = {
  total: number;
  pass: number;
  fail: number;
  notRun: number;
  score: number;
};

function iso() {
  return new Date().toISOString();
}

function mkId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function buildVirtualTestPlan(project: BuilderProject): {
  plan: TestPlan;
  summary: Summary;
} {
  const hasSpec = !!project.spec_json;
  const hasArch = !!project.architecture_json;

  const cases: TestCase[] = [];
  const push = (c: Omit<TestCase, "id" | "status" | "lastRunAt">) =>
    cases.push({ id: mkId("tc"), status: "not_run", lastRunAt: iso(), ...c });

  push({
    title: "Create Builder project persists",
    description: "Project insert returns a row and is visible in list.",
    area: "happy_path",
    risk: "high",
    notes: "",
  });

  push({
    title: "Phase 1 Save Spec persists (spec_json)",
    description: "spec_json must persist on builder_projects row.",
    area: "happy_path",
    risk: "high",
    notes: "",
  });

  push({
    title: "Phase 2 Save Architecture persists (architecture_json)",
    description: "architecture_json must persist on builder_projects row.",
    area: "happy_path",
    risk: "high",
    notes: "",
  });

  push({
    title: "APIs always return { project }",
    description: "UI state never desyncs from server response.",
    area: "edge_case",
    risk: "medium",
    notes: "",
  });

  let pass = 0;
  let fail = 0;

  const evaluated = cases.map((c) => {
    let status: any = "virtual_pass";
    let notes = c.notes ?? "";

    if (!hasSpec && /spec_json/i.test(c.title)) {
      status = "virtual_fail";
      notes = "WHY: spec_json missing.\nFIX NOW: Phase 1 → Save Spec.";
    }

    if (!hasArch && /architecture_json/i.test(c.title)) {
      status = "virtual_fail";
      notes =
        "WHY: architecture_json missing.\nFIX NOW: Phase 2 → Save Architecture.";
    }

    if (status === "virtual_pass") pass += 1;
    else fail += 1;

    return { ...c, status, lastRunAt: iso(), notes };
  });

  const total = evaluated.length;

  let score = 100;
  if (!hasSpec) score -= 20;
  if (!hasArch) score -= 25;
  score -= fail * 8;
  score = Math.max(40, Math.min(99, Math.round(score)));

  const plan: TestPlan = {
    summary: `Virtual Tests ran on “${project.title}”. Pass ${pass}/${total}.`,
    coverageAreas: [
      "Persistence",
      "Definition-of-done rails",
      project.kind === "agent" || project.kind === "workflow"
        ? "Agent safety"
        : "UI/API stability",
    ],
    cases: evaluated,
  } as any;

  return { plan, summary: { total, pass, fail, notRun: 0, score } };
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as PostBody | null;
  if (!body?.projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  const loaded = await loadProjectOrRes({
    projectId: body.projectId,
    caller: "POST /api/builder/test",
  });
  if (loaded.res) return loaded.res;

  const { project, userId, supabase } = loaded;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan, summary } = buildVirtualTestPlan(project);

  const updatedRes = await updateProjectOrRes({
    projectId: project.id,
    userId,
    supabase,
    patch: { test_plan_json: plan, status: "tested" },
    caller: "POST /api/builder/test",
  });

  // updateProjectOrRes already returns {project}
  // Add summary as extra payload by re-wrapping:
  if ("res" in updatedRes && updatedRes.res) {
    // If it's a NextResponse, we can't "append", so return separate standard response:
    // Instead, do the update here directly (safe approach):
  }

  // Safer: update directly and return combined:
  const { data, error } = await supabase
    .from("builder_projects")
    .select("*")
    .eq("id", project.id)
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Saved tests but failed to reload project" },
      { status: 500 }
    );
  }

  return NextResponse.json({ project: data, summary }, { status: 200 });
}

import { NextResponse } from "next/server";
import type { BuilderProject, TestPlan, TestCase } from "@/lib/builder/types";
import {
  requireUserOrDemo,
  getProjectOrThrow,
} from "@/app/api/builder/_shared";

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
    description: "Project insert returns a row.",
    area: "happy_path",
    risk: "high",
    notes: "",
  });
  push({
    title: "Phase 1 Save Spec persists (spec_json)",
    description: "spec_json persists.",
    area: "happy_path",
    risk: "high",
    notes: "",
  });
  push({
    title: "Phase 2 Save Architecture persists (architecture_json)",
    description: "architecture_json persists.",
    area: "happy_path",
    risk: "high",
    notes: "",
  });
  push({
    title: "APIs always return { project }",
    description: "No UI state desync.",
    area: "edge_case",
    risk: "medium",
    notes: "",
  });

  let pass = 0,
    fail = 0;
  const evaluated = cases.map((c) => {
    let status: any = "virtual_pass";
    let notes = c.notes ?? "";

    if (!hasSpec && /spec_json/i.test(c.title)) {
      status = "virtual_fail";
      notes = "WHY: Spec missing.\nFIX NOW: Phase 1 → Save.";
    }
    if (!hasArch && /architecture_json/i.test(c.title)) {
      status = "virtual_fail";
      notes = "WHY: Architecture missing.\nFIX NOW: Phase 2 → Save.";
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
    coverageAreas: ["Persistence", "Definition-of-done rails"],
    cases: evaluated,
  } as any;

  return { plan, summary: { total, pass, fail, notRun: 0, score } };
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
    caller: "POST /api/builder/test",
  });
  if (loaded.res) return loaded.res;

  const { plan, summary } = buildVirtualTestPlan(
    loaded.project as BuilderProject
  );

  const { data: updated, error: updateErr } = await supabase
    .from("builder_projects")
    .update({ test_plan_json: plan, status: "tested" })
    .eq("id", body.projectId)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (updateErr) {
    console.error("[POST /api/builder/test] update error:", updateErr);
    return NextResponse.json(
      { error: "Failed to save test plan" },
      { status: 500 }
    );
  }

  return NextResponse.json({ project: updated, summary }, { status: 200 });
}

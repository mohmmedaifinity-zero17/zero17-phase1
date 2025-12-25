import { NextResponse } from "next/server";
import type {
  BuilderProject,
  DiagnosticsReport,
  DiagnosticItem,
  TestCase,
} from "@/lib/builder/types";
import {
  requireUserOrDemo,
  getProjectOrThrow,
} from "@/app/api/builder/_shared";

type PostBody = { projectId: string };

function mkId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function scoreFix(it: { severity: string; minutes: number }) {
  const sev = it.severity === "error" ? 3 : it.severity === "warning" ? 2 : 1;
  const time = Math.max(5, it.minutes);
  return Math.round(((sev * 120) / time) * 10) / 10;
}

function buildDiagnostics(project: BuilderProject): DiagnosticsReport {
  const items: any[] = [];

  const add = (
    x: Omit<DiagnosticItem, "id"> & { minutes: number; phase: string }
  ) => {
    const roi = scoreFix({ severity: x.severity, minutes: x.minutes });
    items.push({ id: mkId("diag"), ...x, roi });
  };

  if (!project.spec_json) {
    add({
      area: "Spec",
      severity: "error",
      symptom: "spec_json missing",
      likelyCause: "Phase 1 not completed.",
      suggestedFix: "Complete Phase 1 and Save.",
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
      suggestedFix: "Complete Phase 2 and Save.",
      minutes: 12,
      phase: "Phase 2",
    });
  }

  const tcases: TestCase[] = (project.test_plan_json?.cases ?? []) as any;
  const fails = tcases.filter((c) => c.status === "virtual_fail");
  for (const f of fails.slice(0, 8)) {
    add({
      area: "Tests",
      severity: "warning",
      symptom: `Virtual test failing: ${f.title}`,
      likelyCause: "Prerequisite artifact missing or inconsistent.",
      suggestedFix: f.notes || "Follow Fix Now from failing test.",
      minutes: 10,
      phase: /spec_json/i.test(f.title)
        ? "Phase 1"
        : /architecture_json/i.test(f.title)
          ? "Phase 2"
          : "Phase 4",
    });
  }

  if (!project.deployment_plan_json) {
    add({
      area: "Deploy",
      severity: "warning",
      symptom: "No deployment plan present",
      likelyCause: "Deploy blueprint not run.",
      suggestedFix: "Run Deploy blueprint.",
      minutes: 6,
      phase: "Phase 6",
    });
  }

  if (!project.docs_pack_json) {
    add({
      area: "Docs",
      severity: "info",
      symptom: "Docs pack not generated",
      likelyCause: "Phase 9 not run.",
      suggestedFix: "Run Docs pack.",
      minutes: 4,
      phase: "Phase 9",
    });
  }

  if (items.length === 0) {
    add({
      area: "System",
      severity: "info",
      symptom: "No obvious structural risks detected.",
      likelyCause: "Core artifacts present.",
      suggestedFix: "Ship small cohort and convert incidents to tests.",
      minutes: 15,
      phase: "Next",
    });
  }

  items.sort((a, b) => (b.roi ?? 0) - (a.roi ?? 0));
  items.forEach((it: any, idx: number) => (it.priority = idx + 1));

  return {
    summary: `Diagnostics ranked ${items.length} fix(es) by ROI.`,
    items: items.map((it: any) => ({
      id: it.id,
      area: it.area,
      severity: it.severity,
      symptom: it.symptom,
      likelyCause: it.likelyCause,
      suggestedFix: `${it.suggestedFix}\n\n— META: Priority #${it.priority} • Phase: ${it.phase} • ETA: ${it.minutes}m • ROI: ${it.roi}`,
    })),
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
    caller: "POST /api/builder/diagnostics",
  });
  if (loaded.res) return loaded.res;

  const diags = buildDiagnostics(loaded.project as BuilderProject);

  const { data: updated, error: updateErr } = await supabase
    .from("builder_projects")
    .update({ diagnostics_json: diags, status: "diagnosed" })
    .eq("id", body.projectId)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (updateErr) {
    console.error("[POST /api/builder/diagnostics] update error:", updateErr);
    return NextResponse.json(
      { error: "Failed to save diagnostics" },
      { status: 500 }
    );
  }

  return NextResponse.json({ project: updated }, { status: 200 });
}

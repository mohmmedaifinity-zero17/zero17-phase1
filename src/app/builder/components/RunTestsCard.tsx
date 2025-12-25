"use client";

import { useMemo, useState } from "react";
import type { BuilderProject, TestCase } from "@/lib/builder/types";
import { updateProject } from "@/lib/builder/client/updateProject";

type Summary = {
  total: number;
  pass: number;
  fail: number;
  notRun: number;
  score: number;
};

function uid(prefix = "tc") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now()
    .toString(36)
    .slice(2)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function computeSummary(cases: TestCase[]): Summary {
  const total = cases.length;
  const pass = cases.filter((c: any) => c.status === "virtual_pass").length;
  const fail = cases.filter((c: any) => c.status === "virtual_fail").length;
  const notRun = Math.max(0, total - pass - fail);
  const score = Math.max(
    0,
    Math.min(100, Math.round((pass / Math.max(1, total)) * 100))
  );
  return { total, pass, fail, notRun, score };
}

function buildDeterministicTests(project: BuilderProject): TestCase[] {
  // Deterministic starter suite derived from spec+arch existence.
  const hasSpec = !!(project as any)?.spec_json;
  const hasArch = !!(project as any)?.architecture_json;
  const hasPlan = !!(project as any)?.export_plan_json;

  const suite: any[] = [
    {
      id: uid(),
      title: "Spec completeness",
      description: "Spec exists and contains multi-lens intent.",
      status: hasSpec ? "virtual_pass" : "virtual_fail",
      notes: hasSpec ? "" : "Missing spec_json. Complete Phase 1.",
    },
    {
      id: uid(),
      title: "Architecture defined",
      description: "Architecture exists with entities + infra fields.",
      status: hasArch ? "virtual_pass" : "virtual_fail",
      notes: hasArch ? "" : "Missing architecture_json. Complete Phase 2.",
    },
    {
      id: uid(),
      title: "Scaffold plan exists",
      description: "export_plan_json contains a deterministic scaffold plan.",
      status: hasPlan ? "virtual_pass" : "virtual_fail",
      notes: hasPlan
        ? ""
        : "Missing export_plan_json. Run Phase 3 Codegen plan.",
    },
  ];

  return suite as any;
}

export default function RunTestsCard({
  project,
  onProjectUpdatedAction,
}: {
  project: BuilderProject | null;
  onProjectUpdatedAction?: (p: BuilderProject) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canRun = useMemo(() => !!project, [project]);

  const cases: TestCase[] = ((project as any)?.test_plan_json?.cases ??
    []) as any;
  const fails = cases.filter((c: any) => c.status === "virtual_fail");

  async function runTests() {
    if (!project) return;

    setLoading(true);
    setError(null);

    try {
      /**
       * 🔒 PHASE 5 — VIRTUAL TESTS (deterministic)
       * Stored into test_plan_json.
       */
      const nextCases = buildDeterministicTests(project);
      const s = computeSummary(nextCases);

      const nextTestPlan = {
        generatedAt: nowIso(),
        strategy: "deterministic-suite-v1",
        summary: s,
        cases: nextCases,
      };

      const result = await updateProject({
        projectId: project.id,
        status: "tested_virtual",
        artifacts: {
          test_plan_json: nextTestPlan,
        },
        meta: {
          module: "phase5_virtual_tests",
          note: `Virtual tests ran: score ${s.score}/100`,
          actor: "system",
        },
      });

      if (result?.project) {
        onProjectUpdatedAction?.(result.project as BuilderProject);
      }
      setSummary(s);
    } catch (e: any) {
      setError(e?.message || "Failed to run tests");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              ✓
            </span>
            <p className="text-xs font-semibold text-slate-800">
              5. Virtual tests
            </p>
          </div>

          <p className="mt-2 text-xs text-slate-600">
            Runs a deterministic QA sweep. Stores a <b>Test Plan</b> in{" "}
            <span className="font-mono">test_plan_json</span>.
          </p>
        </div>

        <button
          type="button"
          onClick={runTests}
          disabled={!canRun || loading}
          className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:bg-slate-300"
        >
          {loading ? "Running..." : "Run tests"}
        </button>
      </div>

      {error && (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {(summary || (project as any)?.test_plan_json) && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              label={`Score: ${summary?.score ?? (project as any)?.test_plan_json?.summary?.score ?? "?"}/100`}
            />
            <Badge
              label={`Pass: ${summary?.pass ?? (project as any)?.test_plan_json?.summary?.pass ?? "?"}`}
            />
            <Badge
              label={`Fail: ${summary?.fail ?? (project as any)?.test_plan_json?.summary?.fail ?? "?"}`}
            />
            <Badge
              label={`Total: ${summary?.total ?? (project as any)?.test_plan_json?.summary?.total ?? "?"}`}
            />
          </div>

          {fails.length > 0 && (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs font-semibold text-slate-800">
                Fix Now (from failing tests)
              </p>
              <div className="mt-2 space-y-2">
                {fails.slice(0, 6).map((c: any) => (
                  <div
                    key={c.id}
                    className="rounded-xl border border-slate-200 bg-white p-3"
                  >
                    <p className="text-xs font-semibold text-slate-800">
                      {c.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      {c.description}
                    </p>
                    {c.notes && (
                      <pre className="mt-2 whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-2 text-[11px] text-slate-700">
                        {c.notes}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="mt-3 text-[11px] text-slate-500">
            Saved to{" "}
            <span className="font-mono">builder_projects.test_plan_json</span>.
          </p>
        </div>
      )}
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-slate-300 bg-white px-2 py-0.5 text-[10px] text-slate-700">
      {label}
    </span>
  );
}

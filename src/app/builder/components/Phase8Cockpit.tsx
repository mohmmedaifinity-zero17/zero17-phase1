"use client";

import type { BuilderProject } from "@/lib/builder/types";

function metric(label: string, ok: boolean, hint: string) {
  return { label, ok, hint };
}

export default function Phase8Cockpit({
  activeProject,
}: {
  activeProject: BuilderProject | null;
}) {
  const p: any = activeProject;

  // Canonical-only signals
  const hasSpec = !!p?.spec_json;
  const hasArch = !!p?.architecture_json;
  const hasPlan = !!p?.export_plan_json;
  const hasRefinePlan = !!p?.export_plan_json?.refinements?.length;
  const hasTests = !!p?.test_plan_json;
  const hasScan = !!p?.diagnostics_json?.scan;
  const hasDocs = !!p?.docs_json; // canonical
  const hasDiag = !!p?.diagnostics_json; // canonical

  // Readiness score (simple, deterministic)
  const score =
    (hasSpec ? 15 : 0) +
    (hasArch ? 20 : 0) +
    (hasPlan ? 10 : 0) +
    (hasRefinePlan ? 5 : 0) +
    (hasTests ? 20 : 0) +
    (hasScan ? 20 : 0) +
    (hasDocs ? 10 : 0);

  const rows = [
    metric("Spec complete", hasSpec, "Phase 1"),
    metric("Architecture ready", hasArch, "Phase 2"),
    metric("Codegen plan created", hasPlan, "Phase 3"),
    metric("Refine plan exists", hasRefinePlan, "Phase 4"),
    metric("Virtual tests run", hasTests, "Phase 5"),
    metric("Quality scan run", hasScan, "Phase 7"),
    metric("Docs generated", hasDocs, "Phase 9"),
    metric("Diagnostics ready", hasDiag, "Phase 10"),
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-800">
            8. Cockpit (live readiness)
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Single glance: what’s missing before “ship”.
          </p>
        </div>

        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
          {score}/100
        </span>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-2">
        {rows.map((r) => (
          <div
            key={r.label}
            className={`rounded-xl border p-3 ${
              r.ok
                ? "border-emerald-200 bg-emerald-50"
                : "border-amber-200 bg-amber-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-800">{r.label}</p>
              <span className="text-[11px] text-slate-500">{r.hint}</span>
            </div>
            <p className="mt-1 text-xs text-slate-700">
              {r.ok ? "OK" : "Missing"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

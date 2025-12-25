"use client";

import { useState } from "react";
import type { BuilderProject } from "@/lib/builder/types";
import { updateProject } from "@/lib/builder/client/updateProject";

function nowIso() {
  return new Date().toISOString();
}

function buildDeterministicScan(project: BuilderProject) {
  const hasSpec = !!(project as any)?.spec_json;
  const hasArch = !!(project as any)?.architecture_json;
  const hasPlan = !!(project as any)?.export_plan_json;
  const hasTests = !!(project as any)?.test_plan_json;

  const issues: {
    id: string;
    title: string;
    severity: "low" | "med" | "high";
    advice: string;
  }[] = [];

  if (!hasSpec)
    issues.push({
      id: "scan_missing_spec",
      title: "Missing spec_json",
      severity: "high",
      advice: "Complete Phase 1 and save at least Founder + Product lenses.",
    });

  if (!hasArch)
    issues.push({
      id: "scan_missing_arch",
      title: "Missing architecture_json",
      severity: "high",
      advice: "Complete Phase 2: define entities + infra + key agents.",
    });

  if (!hasPlan)
    issues.push({
      id: "scan_missing_export_plan",
      title: "Missing export_plan_json scaffold plan",
      severity: "med",
      advice: "Run Phase 3: generate deterministic codegen plan.",
    });

  if (!hasTests)
    issues.push({
      id: "scan_missing_tests",
      title: "No virtual tests recorded",
      severity: "med",
      advice: "Run Phase 5 Virtual tests to get a reliability signal.",
    });

  const negatives = issues.filter((i) => i.severity !== "low").length;
  const score = Math.max(50, 98 - negatives * 12);

  const summary =
    score >= 90
      ? "Strong readiness. Minor polish remaining."
      : score >= 75
        ? "Good foundation. Fix flagged issues before shipping."
        : "Not ship-ready. Complete missing phases and re-run scan.";

  return {
    generatedAt: nowIso(),
    score,
    summary,
    issues,
  };
}

export default function Phase7Cards({
  activeProject,
  setProjectsAction,
}: {
  activeProject: BuilderProject | null;
  setProjectsAction: React.Dispatch<React.SetStateAction<BuilderProject[]>>;
}) {
  const [loadingScan, setLoadingScan] = useState(false);
  const [errScan, setErrScan] = useState<string | null>(null);

  async function runScan() {
    if (!activeProject) return;
    setLoadingScan(true);
    setErrScan(null);

    try {
      /**
       * 🔒 PHASE 7 — QUALITY SCAN (canonical)
       * We store scan report under diagnostics_json.scan
       */
      const scan = buildDeterministicScan(activeProject);

      const nextDiagnostics = {
        ...((activeProject as any)?.diagnostics_json &&
        typeof (activeProject as any)?.diagnostics_json === "object"
          ? (activeProject as any)?.diagnostics_json
          : {}),
        scan,
      };

      const result = await updateProject({
        projectId: activeProject.id,
        status: "scanned_quality",
        artifacts: {
          diagnostics_json: nextDiagnostics,
        },
        meta: {
          module: "phase7_quality_scan",
          note: `Quality scan ran: score ${scan.score}/100`,
          actor: "system",
        },
      });

      if (result?.project) {
        const p = result.project as BuilderProject;
        setProjectsAction((prev) => prev.map((x) => (x.id === p.id ? p : x)));
      }
    } catch (e: any) {
      setErrScan(e?.message || "Scan failed");
    } finally {
      setLoadingScan(false);
    }
  }

  const scan = (activeProject as any)?.diagnostics_json?.scan ?? null;
  const score = scan?.score ?? null;
  const issueCount = (scan?.issues?.length ?? 0) as number;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-900">
            7. Quality scan & docs signal
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Generates readiness scan from your canonical artifacts. Stores
            result in <span className="font-mono">diagnostics_json.scan</span>.
          </p>
        </div>

        <button
          type="button"
          onClick={runScan}
          disabled={!activeProject || loadingScan}
          className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:bg-slate-300"
        >
          {loadingScan ? "Scanning..." : "Run quality scan"}
        </button>
      </div>

      {errScan && (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {errScan}
        </div>
      )}

      {scan && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge label={`Score: ${score ?? "?"}/100`} />
            <Badge label={`Issues: ${issueCount}`} />
          </div>

          <p className="mt-2 text-xs text-slate-700">{scan?.summary ?? ""}</p>

          {issueCount > 0 && (
            <div className="mt-3 space-y-2">
              {(scan?.issues ?? []).slice(0, 6).map((i: any) => (
                <div
                  key={i.id}
                  className="rounded-xl border border-slate-200 bg-white p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-800">
                      {i.title}
                    </p>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-700">
                      {String(i.severity || "med")}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">{i.advice}</p>
                </div>
              ))}
            </div>
          )}
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

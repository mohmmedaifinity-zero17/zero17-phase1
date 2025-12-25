"use client";

import { useMemo, useState } from "react";
import type { BuilderProject } from "@/lib/builder/types";

type DiagnosticsPayload = {
  summary?: string;
  generatedAt?: string;
  version?: string;
  items?: any[];
};

export default function DiagnosticsPanel({
  project,
  onProjectUpdatedAction,
}: {
  project: BuilderProject | null;
  onProjectUpdatedAction?: (p: BuilderProject) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    if (!project) return;
    setLoading(true);
    setErr(null);

    try {
      const res = await fetch("/api/builder/diagnostics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(json?.error || "Failed to compute diagnostics");

      // New stable response shape: { project, diagnostics }
      if (json?.project)
        onProjectUpdatedAction?.(json.project as BuilderProject);
    } catch (e: any) {
      setErr(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const diags = useMemo(() => {
    return ((project as any)?.diagnostics_json ??
      null) as DiagnosticsPayload | null;
  }, [project]);

  // Accept both shapes:
  // - New: payload.items[] with fields (area, severity, symptom, likelyCause, suggestedFix)
  // - Older: payload.items[] with fields (title, whyItMatters, fixNow, phase, severity)
  const items = useMemo(() => {
    const raw = (diags?.items ?? []) as any[];
    return Array.isArray(raw) ? raw : [];
  }, [diags]);

  const hasDiags = !!diags;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-800">
            10. Diagnostics & Fix Suggestions
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Generates ranked issues with exact fix-now instructions.
          </p>
        </div>

        <button
          onClick={run}
          disabled={!project || loading}
          className="rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500 disabled:bg-slate-300"
        >
          {loading ? "Analyzing..." : hasDiags ? "Re-run" : "Run diagnostics"}
        </button>
      </div>

      {err && (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {err}
        </div>
      )}

      {hasDiags && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-slate-800">Summary</p>
              <p className="mt-1 text-xs text-slate-700">
                {diags?.summary || "Diagnostics generated."}
              </p>
            </div>

            <div className="text-[11px] text-slate-500">
              {diags?.generatedAt ? (
                <span>
                  {diags.generatedAt}
                  {diags?.version ? ` • ${diags.version}` : ""}
                </span>
              ) : diags?.version ? (
                <span>{diags.version}</span>
              ) : null}
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {items.length === 0 ? (
              <p className="text-xs text-slate-600">No issues detected.</p>
            ) : (
              items.slice(0, 14).map((it: any) => {
                const severity = it?.severity || it?.level || "info";

                // New diagnostic item shape (heuristics route)
                const title =
                  it?.title || it?.symptom || it?.area || "Diagnostic";

                const why = it?.whyItMatters || it?.likelyCause || "";

                const fix = it?.fixNow || it?.suggestedFix || "";

                const metaLine =
                  it?.phase != null
                    ? `Phase: ${it.phase}`
                    : it?.area
                      ? `Area: ${it.area}`
                      : "";

                return (
                  <div
                    key={
                      it?.id ??
                      `${title}_${Math.random().toString(16).slice(2)}`
                    }
                    className="rounded-xl border border-slate-200 bg-white p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-800">
                        {title}
                      </p>
                      <span className={sevPill(String(severity))}>
                        {String(severity).toUpperCase()}
                      </span>
                    </div>

                    {why && (
                      <p className="mt-2 text-xs text-slate-600">
                        <b>Why:</b> {why}
                      </p>
                    )}

                    {fix && (
                      <p className="mt-2 text-xs text-slate-700">
                        <b>Fix now:</b> {fix}
                      </p>
                    )}

                    {metaLine && (
                      <p className="mt-2 text-[11px] text-slate-500">
                        {metaLine}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function sevPill(sev: string) {
  // Supports both:
  // - new: info|warning|error
  // - old: low|medium|high|critical
  const s = sev.toLowerCase();

  if (s === "critical" || s === "error") {
    return "rounded-full border border-red-300 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700";
  }
  if (s === "high") {
    return "rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700";
  }
  if (s === "medium" || s === "warning") {
    return "rounded-full border border-slate-300 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-700";
  }
  return "rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700";
}

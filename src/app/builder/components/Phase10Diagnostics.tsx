"use client";

import { useMemo, useState } from "react";
import type { BuilderProject } from "@/lib/builder/types";
import { updateProject as patchProject } from "@/app/builder/lib/updateProject";

type Props = {
  activeProject: BuilderProject | null;
  setProjectsAction: React.Dispatch<React.SetStateAction<BuilderProject[]>>;
};

type DiagSeverity = "critical" | "high" | "medium" | "low" | "info" | string;

type DiagItem = {
  id: string;
  title?: string;
  severity?: DiagSeverity;

  // common fields we’ve used
  phase?: string;
  whyItMatters?: string;
  fixNow?: string;

  // older heuristic diagnostics fields
  area?: string;
  symptom?: string;
  likelyCause?: string;
  suggestedFix?: string;

  // patch fields (optional)
  patch_id?: string;
  patchId?: string;
  patch?: any;
};

function sevPill(sev: string) {
  const s = String(sev || "").toLowerCase();
  if (s === "critical")
    return "rounded-full border border-red-300 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700";
  if (s === "high")
    return "rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700";
  if (s === "medium")
    return "rounded-full border border-slate-300 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-700";
  if (s === "low" || s === "info")
    return "rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700";
  return "rounded-full border border-slate-300 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-700";
}

function normalizeDiagnostics(diags: any): {
  summary: string;
  items: DiagItem[];
} {
  if (!diags) return { summary: "", items: [] };

  // Shape A (newer): { summary, items: [...] }
  if (Array.isArray(diags?.items)) {
    return {
      summary: String(diags?.summary ?? ""),
      items: diags.items as DiagItem[],
    };
  }

  // Shape B: { ok:true, diagnostics:[...] }
  if (Array.isArray(diags?.diagnostics)) {
    return {
      summary: String(diags?.summary ?? "Diagnostics generated."),
      items: diags.diagnostics as DiagItem[],
    };
  }

  // Shape C: array only
  if (Array.isArray(diags)) {
    return { summary: "Diagnostics generated.", items: diags as DiagItem[] };
  }

  return { summary: String(diags?.summary ?? ""), items: [] };
}

export default function Phase10Diagnostics({
  activeProject,
  setProjectsAction,
}: Props) {
  const [loadingRun, setLoadingRun] = useState(false);
  const [loadingFix, setLoadingFix] = useState(false);
  const [loadingLock, setLoadingLock] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const locked = useMemo(() => {
    const s = String((activeProject as any)?.status ?? "").toLowerCase();
    return s === "locked";
  }, [activeProject]);

  const diagsRaw: any = (activeProject as any)?.diagnostics_json ?? null;

  const { summary, items } = useMemo(
    () => normalizeDiagnostics(diagsRaw),
    [diagsRaw]
  );

  const topItems = useMemo(() => {
    const arr = [...(items ?? [])].filter(Boolean);
    const rank = (sev: string) => {
      const s = String(sev || "").toLowerCase();
      if (s === "critical") return 0;
      if (s === "high") return 1;
      if (s === "medium") return 2;
      if (s === "low") return 3;
      if (s === "info") return 4;
      return 5;
    };
    arr.sort((a, b) => rank(a.severity ?? "") - rank(b.severity ?? ""));
    return arr.slice(0, 12);
  }, [items]);

  function updateLocal(p: BuilderProject) {
    setProjectsAction((prev) => prev.map((x) => (x.id === p.id ? p : x)));
  }

  /**
   * Phase10 contract:
   * - /api/builder/diagnostics should return { project } after it writes diagnostics_json
   * - If it returns { diagnostics } instead, we patch canonical via patchProject().
   */
  async function runDiagnostics() {
    if (!activeProject) return;
    setLoadingRun(true);
    setErr(null);

    try {
      const res = await fetch("/api/builder/diagnostics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: activeProject.id }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(json?.error || "Failed to compute diagnostics");

      // Preferred canonical behavior: API returns { project }
      if (json?.project) {
        updateLocal(json.project as BuilderProject);
        return;
      }

      // Fallback: API returns diagnostics only → patch via canonical endpoint
      if (json?.diagnostics) {
        const updated = await patchProject(activeProject.id, {
          diagnostics_json: json.diagnostics,
          status: "diagnosed",
        });
        updateLocal(updated);
        return;
      }

      throw new Error(
        "Diagnostics did not return { project } or { diagnostics }"
      );
    } catch (e: any) {
      setErr(e?.message || "Something went wrong");
    } finally {
      setLoadingRun(false);
    }
  }

  /**
   * Autofix contract:
   * - /api/builder/autofix should return { project } after applying safe improvements
   * - LOCKED blocks modifications (kept)
   */
  async function runAutofix() {
    if (!activeProject) return;

    if (locked) {
      setErr("This build is LOCKED. Fork it to continue editing.");
      return;
    }

    setLoadingFix(true);
    setErr(null);

    try {
      const res = await fetch("/api/builder/autofix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: activeProject.id }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Autofix failed");

      if (json?.project) {
        updateLocal(json.project as BuilderProject);
        return;
      }

      throw new Error("Autofix did not return { project }");
    } catch (e: any) {
      setErr(e?.message || "Something went wrong");
    } finally {
      setLoadingFix(false);
    }
  }

  /**
   * Patch apply contract:
   * - /api/builder/patch returns { project }
   * - LOCKED blocks modifications (kept)
   */
  async function applyPatch(item: DiagItem) {
    if (!activeProject) return;

    if (locked) {
      setErr("This build is LOCKED. Fork it to continue editing.");
      return;
    }

    setLoadingFix(true);
    setErr(null);

    try {
      const patchId = item.patch_id ?? item.patchId ?? null;
      const patch = item.patch ?? null;

      const res = await fetch("/api/builder/patch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: activeProject.id,
          patchId,
          patch,
          diagnosticId: item.id,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Patch apply failed");

      if (json?.project) {
        updateLocal(json.project as BuilderProject);
        return;
      }

      throw new Error("Patch API did not return { project }");
    } catch (e: any) {
      setErr(e?.message || "Something went wrong");
    } finally {
      setLoadingFix(false);
    }
  }

  /**
   * Lock toggle:
   * Your UI calls /api/builder/projects/:id/lock (POST)
   * Keep as-is, but enforce { project } response.
   * (Later we can merge lock into PATCH /api/builder/projects/:id)
   */
  async function toggleLock() {
    if (!activeProject) return;

    setLoadingLock(true);
    setErr(null);

    try {
      const res = await fetch(
        `/api/builder/projects/${activeProject.id}/lock`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}), // toggle
        }
      );

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Failed to toggle lock");

      const p = json?.project as BuilderProject | undefined;
      if (!p) throw new Error("Lock API did not return { project }");

      updateLocal(p);
    } catch (e: any) {
      setErr(e?.message || "Something went wrong");
    } finally {
      setLoadingLock(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-900">
            10. Diagnostics & Fix Suggestions
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Ranked issues with fix-now instructions. Autofix + Patch apply are
            disabled in LOCKED mode.
          </p>

          {locked && (
            <div className="mt-2 inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] text-amber-900">
              <span className="rounded-full border border-amber-300 bg-white px-2 py-0.5 text-[10px] font-semibold">
                LOCKED
              </span>
              <span>
                Fork the build to continue edits. (Run/scan/docs/diagnostics
                still allowed.)
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={runDiagnostics}
            disabled={!activeProject || loadingRun}
            className="rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500 disabled:bg-slate-300"
          >
            {loadingRun
              ? "Analyzing..."
              : diagsRaw
                ? "Re-run"
                : "Run diagnostics"}
          </button>

          <button
            onClick={runAutofix}
            disabled={!activeProject || loadingFix || locked}
            className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:bg-slate-300"
            title={
              locked
                ? "Locked builds cannot be modified. Fork to continue."
                : "Apply automatic improvements."
            }
          >
            {loadingFix ? "Working..." : "Autofix"}
          </button>

          <button
            onClick={toggleLock}
            disabled={!activeProject || loadingLock}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:bg-slate-100"
          >
            {loadingLock ? "..." : locked ? "Unlock" : "Lock"}
          </button>
        </div>
      </div>

      {err && (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {err}
        </div>
      )}

      {diagsRaw ? (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold text-slate-800">Summary</p>
          <p className="mt-1 text-xs text-slate-700">
            {summary || "Diagnostics generated."}
          </p>

          <div className="mt-3 space-y-2">
            {topItems.length === 0 ? (
              <p className="text-xs text-slate-600">No issues detected.</p>
            ) : (
              topItems.map((it) => {
                const title =
                  it.title || (it.area ? `Area: ${it.area}` : "Issue");
                const sev = it.severity ?? "medium";

                const why =
                  it.whyItMatters || it.symptom || it.likelyCause || "—";

                const fix = it.fixNow || it.suggestedFix || "—";

                const hasPatch = !!it.patch || !!it.patch_id || !!it.patchId;

                return (
                  <div
                    key={it.id}
                    className="rounded-xl border border-slate-200 bg-white p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-900">
                        {title}
                      </p>
                      <span className={sevPill(String(sev))}>
                        {String(sev).toUpperCase()}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-slate-600">
                      <b>Why:</b> {why}
                    </p>
                    <p className="mt-2 text-xs text-slate-800">
                      <b>Fix now:</b> {fix}
                    </p>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <p className="text-[11px] text-slate-500">
                        Phase: {it.phase ?? "—"}
                      </p>

                      {hasPatch && (
                        <button
                          onClick={() => applyPatch(it)}
                          disabled={loadingFix || locked}
                          className="rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-slate-800 disabled:bg-slate-300"
                          title={
                            locked
                              ? "Locked builds cannot be modified. Fork to continue."
                              : "Apply suggested patch now."
                          }
                        >
                          {locked ? "Locked" : "Apply patch"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-600">
          Run diagnostics to generate ranked issues + fix suggestions.
        </div>
      )}
    </div>
  );
}

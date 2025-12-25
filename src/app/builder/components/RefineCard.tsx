"use client";

import { useMemo, useState } from "react";
import type { BuilderProject } from "@/lib/builder/types";
import { updateProject } from "@/lib/builder/client/updateProject";

function uid(prefix = "refine") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now()
    .toString(36)
    .slice(2)}`;
}

function nowIso() {
  return new Date().toISOString();
}

type RefineStep = { id: string; title: string; detail: string };
type RefinePlan = {
  id: string;
  created_at: string;
  source: "user_prompt" | "autofix";
  mode: "safe" | "aggressive";
  goal: string;
  steps: RefineStep[];
};

export default function RefineCard({
  project,
  onProjectUpdatedAction,
}: {
  project: BuilderProject | null;
  onProjectUpdatedAction?: (p: BuilderProject) => void;
}) {
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<"safe" | "aggressive">("safe");
  const [loading, setLoading] = useState(false);
  const [patchLoading, setPatchLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const exportPlan: any = (project as any)?.export_plan_json ?? null;
  const refinements: any[] = exportPlan?.refinements ?? [];
  const latest = refinements.length > 0 ? refinements[0] : null;

  const patches: any[] = exportPlan?.patches ?? [];
  const lastPatch = patches.length > 0 ? patches[0] : null;

  const isAutofix = useMemo(
    () => String(latest?.source ?? "") === "autofix",
    [latest]
  );

  function buildPlan(p: string, m: "safe" | "aggressive"): RefinePlan {
    // Deterministic skeleton plan (planner-first). Later you can swap to an LLM.
    const steps: RefineStep[] =
      m === "safe"
        ? [
            {
              id: uid("s"),
              title: "Clarify intent",
              detail: "Restate the requested change in measurable terms.",
            },
            {
              id: uid("s"),
              title: "Scope boundaries",
              detail: "Confirm what must NOT change to avoid regressions.",
            },
            {
              id: uid("s"),
              title: "Artifact mapping",
              detail:
                "Identify which JSON artifacts should be updated (spec/arch/ui/ops/docs/diag/export/test).",
            },
            {
              id: uid("s"),
              title: "Patch preview",
              detail:
                "Draft a conservative patch plan limited to JSON artifacts only.",
            },
            {
              id: uid("s"),
              title: "Re-run tests",
              detail: "Run virtual tests and ensure score doesn’t regress.",
            },
          ]
        : [
            {
              id: uid("s"),
              title: "Deep rewrite intent",
              detail:
                "Rewrite the solution plan aggressively for maximum outcome.",
            },
            {
              id: uid("s"),
              title: "Refactor artifacts",
              detail:
                "Propose structural changes across artifacts (arch/ui/ops/docs) if justified.",
            },
            {
              id: uid("s"),
              title: "Stability guardrails",
              detail:
                "Add rollback checkpoints and minimize user-visible breakage.",
            },
            {
              id: uid("s"),
              title: "Autofix patch recipe",
              detail:
                "Draft an autofix patch for artifacts with measurable improvements.",
            },
            {
              id: uid("s"),
              title: "Verification loop",
              detail: "Re-run tests, compare diffs, and lock improvements.",
            },
          ];

    return {
      id: uid("refine"),
      created_at: nowIso(),
      source: "user_prompt",
      mode: m,
      goal: p,
      steps,
    };
  }

  async function runRefine() {
    if (!project) return;
    const p = prompt.trim();
    if (!p) {
      setErr("Write a refinement prompt first.");
      return;
    }

    setLoading(true);
    setErr(null);
    setOkMsg(null);

    try {
      const plan = buildPlan(p, mode);

      const nextExportPlan = {
        ...(exportPlan && typeof exportPlan === "object" ? exportPlan : {}),
        refinements: [plan, ...(refinements || [])],
      };

      const result = await updateProject({
        projectId: project.id,
        status: "refinement_planned",
        artifacts: {
          export_plan_json: nextExportPlan,
        },
        meta: {
          module: "phase4_refine",
          note: `Refine plan created (${mode})`,
          actor: "user",
        },
      });

      if (result?.project)
        onProjectUpdatedAction?.(result.project as BuilderProject);

      setPrompt("");
      setOkMsg("Refine plan created.");
    } catch (e: any) {
      setErr(e?.message || "Refine failed");
    } finally {
      setLoading(false);
    }
  }

  async function applyAutofixPatch() {
    if (!project) return;
    if (!latest) {
      setErr("No refine plan found. Create a plan first.");
      return;
    }

    setPatchLoading(true);
    setErr(null);
    setOkMsg(null);

    try {
      // Deterministic “JSON-only” patch stub (safe). Later can become LLM-based.
      const patch = {
        id: uid("patch"),
        created_at: nowIso(),
        actions: [
          "Applied refinement patch (stub): JSON artifacts only",
          `Mode: ${String(latest?.mode || mode)}`,
          `Goal: ${String(latest?.goal || "")}`.slice(0, 120),
        ],
        before: {
          hasSpec: !!(project as any)?.spec_json,
          hasArch: !!(project as any)?.architecture_json,
          hasDeploy: !!(project as any)?.ops_json,
        },
        after: {
          hasSpec: !!(project as any)?.spec_json,
          hasArch: !!(project as any)?.architecture_json,
          hasDeploy: !!(project as any)?.ops_json,
        },
      };

      const nextExportPlan = {
        ...(exportPlan && typeof exportPlan === "object" ? exportPlan : {}),
        patches: [patch, ...(patches || [])],
      };

      const result = await updateProject({
        projectId: project.id,
        status: "refinement_patched",
        artifacts: {
          export_plan_json: nextExportPlan,
        },
        meta: {
          module: "phase4_refine_patch",
          note: "Autofix patch applied (JSON-only stub)",
          actor: "system",
        },
      });

      if (result?.project)
        onProjectUpdatedAction?.(result.project as BuilderProject);

      setOkMsg("Autofix patch applied. Now rerun Phase 5 tests.");
    } catch (e: any) {
      setErr(e?.message || "Patch failed");
    } finally {
      setPatchLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-violet-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-800">4. Refine</p>
          <p className="mt-1 text-xs text-slate-600">
            Prompt → change plan → (optional) apply deterministic patch to JSON
            artifacts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={runRefine}
            disabled={!project || loading}
            className="rounded-xl bg-violet-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-600 disabled:bg-slate-300"
          >
            {loading ? "Planning..." : "Create plan"}
          </button>

          <button
            type="button"
            onClick={applyAutofixPatch}
            disabled={!project || patchLoading || !isAutofix}
            className="rounded-xl bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 disabled:bg-slate-300"
            title={
              isAutofix
                ? "Apply safe patch (JSON only)"
                : "Autofix source required (set plan.source = 'autofix')"
            }
          >
            {patchLoading ? "Applying..." : "Apply Autofix Patch"}
          </button>
        </div>
      </div>

      <div className="mt-3 grid gap-2">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          placeholder="Example: Improve builder UI spacing, align pills, reduce clutter. Keep the phase rail modular."
          className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 outline-none focus:border-violet-400"
        />

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-slate-600">Mode:</span>
            <button
              type="button"
              onClick={() => setMode("safe")}
              className={[
                "rounded-full border px-2 py-0.5",
                mode === "safe"
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-700",
              ].join(" ")}
            >
              Safe
            </button>
            <button
              type="button"
              onClick={() => setMode("aggressive")}
              className={[
                "rounded-full border px-2 py-0.5",
                mode === "aggressive"
                  ? "border-amber-300 bg-amber-50 text-amber-700"
                  : "border-slate-200 bg-white text-slate-700",
              ].join(" ")}
            >
              Aggressive
            </button>
          </div>

          <span className="text-[11px] text-slate-500">
            Plans: {refinements.length} • Patches: {patches.length}
          </span>
        </div>

        {err && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {err}
          </div>
        )}

        {okMsg && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
            {okMsg}
          </div>
        )}

        {latest && (
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-slate-800">
                Latest plan
              </p>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-700">
                source: {String(latest.source ?? "user_prompt")}
              </span>
            </div>

            <p className="mt-2 text-xs text-slate-700">
              <b>Goal:</b> {latest.goal}
            </p>

            <details className="mt-2">
              <summary className="cursor-pointer text-[11px] font-semibold text-slate-700">
                Show plan steps
              </summary>
              <ol className="mt-2 list-decimal pl-5 text-[11px] text-slate-600">
                {(latest.steps ?? []).slice(0, 8).map((s: any) => (
                  <li key={s.id}>
                    <b>{s.title}:</b> {s.detail}
                  </li>
                ))}
              </ol>
            </details>
          </div>
        )}

        {lastPatch && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-xs font-semibold text-slate-800">Latest patch</p>
            <p className="mt-1 text-[11px] text-slate-700">
              <b>Actions:</b>
            </p>
            <ul className="mt-1 list-disc pl-5 text-[11px] text-slate-700">
              {(lastPatch.actions ?? [])
                .slice(0, 8)
                .map((a: string, i: number) => (
                  <li key={i}>{a}</li>
                ))}
            </ul>

            <p className="mt-2 text-[11px] text-slate-600">
              Before: spec={String(lastPatch.before?.hasSpec)} • arch=
              {String(lastPatch.before?.hasArch)} • deploy=
              {String(lastPatch.before?.hasDeploy)}
              <br />
              After: spec={String(lastPatch.after?.hasSpec)} • arch=
              {String(lastPatch.after?.hasArch)} • deploy=
              {String(lastPatch.after?.hasDeploy)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

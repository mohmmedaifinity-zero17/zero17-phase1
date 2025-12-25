// src/components/growth/LoopBuilderPanel.tsx
"use client";

import { useState } from "react";
import type {
  GrowthMasterbrainInput,
  GrowthMasterbrainOutput,
  LoopDesignPlan,
} from "@/lib/growth/types";

type Props = {
  input: GrowthMasterbrainInput | null;
  masterbrain: GrowthMasterbrainOutput | null;
  plan: LoopDesignPlan | null;
  onChangeAction: (p: LoopDesignPlan | null) => void;
  onStepChangeAction: (s: 1 | 2 | 3) => void;
};

export default function LoopBuilderPanel({
  input,
  masterbrain,
  plan,
  onChangeAction,
  onStepChangeAction,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disabledReason = !input
    ? "Fill Growth Masterbrain basics first."
    : null;

  const run = async () => {
    if (!input) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/growth/loops", {
        method: "POST",
        body: JSON.stringify({ input, masterbrain }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Failed to compute loop design");
      }
      const data = (await res.json()) as LoopDesignPlan;
      onChangeAction(data);
      onStepChangeAction(3);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-4 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-slate-50 to-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-900 px-3 py-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-indigo-100">
              STEP 3.3 · LOOP BUILDER
            </span>
          </div>
          <h3 className="mt-2 text-sm font-semibold text-slate-900">
            Design one repeatable loop instead of 99 random growth hacks.
          </h3>
          <p className="mt-1 text-[11px] text-slate-600">
            I’ll propose 1–2 simple growth loops (“input → activation → value →
            referral”) aligned with your primary engine and constraints, so your
            effort compounds instead of resetting every week.
          </p>
        </div>
        <button
          onClick={run}
          disabled={loading || !!disabledReason}
          className="inline-flex items-center justify-center rounded-xl bg-indigo-700 px-4 py-2 text-[11px] font-semibold text-indigo-50 shadow-sm hover:bg-indigo-800 disabled:opacity-60"
        >
          {loading ? "Designing loops..." : "Run Loop Builder"}
        </button>
      </div>

      {disabledReason && (
        <p className="mt-2 text-[11px] text-amber-700">{disabledReason}</p>
      )}
      {error && <p className="mt-2 text-[11px] text-rose-600">{error}</p>}

      {plan && (
        <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] text-[11px]">
          <div className="space-y-2 rounded-xl border border-indigo-100 bg-white/90 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-indigo-600">
              Loop narratives
            </p>
            {plan.loops.map((loop) => (
              <div
                key={loop.id}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5"
              >
                <p className="text-[10px] font-semibold text-slate-800">
                  {loop.name}
                </p>
                <p className="mt-0.5 text-slate-700">{loop.narrative}</p>
                <div className="mt-1 grid gap-1 md:grid-cols-2">
                  {loop.nodes.map((node) => (
                    <div
                      key={node.id}
                      className="rounded-md border border-slate-200 bg-white/80 px-2 py-1"
                    >
                      <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                        {node.role.toUpperCase()}
                      </p>
                      <p className="text-[10px] font-semibold text-slate-800">
                        {node.label}
                      </p>
                      <p className="text-[10px] text-slate-600">
                        {node.description}
                      </p>
                    </div>
                  ))}
                </div>
                {loop.riskNotes.length > 0 && (
                  <ul className="mt-1 list-disc pl-4 text-[10px] text-slate-600">
                    {loop.riskNotes.map((r, i) => (
                      <li key={loop.id + "r" + i}>{r}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-2 rounded-xl border border-slate-200 bg-white/95 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">
              Implementation steps
            </p>
            <ol className="space-y-1.5 list-decimal pl-4 text-[10px] text-slate-700">
              {plan.implementationSteps.map((s) => (
                <li key={s.step}>
                  <span className="font-semibold">{s.title}</span> – {s.details}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </section>
  );
}

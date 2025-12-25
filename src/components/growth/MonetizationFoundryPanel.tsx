// src/components/growth/MonetizationFoundryPanel.tsx
"use client";

import { useState } from "react";
import type {
  GrowthMasterbrainInput,
  GrowthMasterbrainOutput,
  MonetizationPlan,
} from "@/lib/growth/types";

type Props = {
  input: GrowthMasterbrainInput | null;
  masterbrain: GrowthMasterbrainOutput | null;
  plan: MonetizationPlan | null;
  onChangeAction: (p: MonetizationPlan | null) => void;
  onStepChangeAction: (s: 1 | 2 | 3) => void;
};

export default function MonetizationFoundryPanel({
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
      const res = await fetch("/api/growth/monetization", {
        method: "POST",
        body: JSON.stringify({ input, masterbrain }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Failed to compute monetization plan");
      }
      const data = (await res.json()) as MonetizationPlan;
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
    <section className="mt-4 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-sky-50 to-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-900 px-3 py-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-100">
              STEP 3.2 · MONETIZATION FOUNDRY
            </span>
          </div>
          <h3 className="mt-2 text-sm font-semibold text-slate-900">
            Turn your growth into cash, without building a pricing circus.
          </h3>
          <p className="mt-1 text-[11px] text-slate-600">
            I’ll propose 2–3 realistic pricing shapes, who they’re for, and the
            first moves to validate them without over-engineering payments and
            plans.
          </p>
        </div>
        <button
          onClick={run}
          disabled={loading || !!disabledReason}
          className="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-4 py-2 text-[11px] font-semibold text-emerald-50 shadow-sm hover:bg-emerald-800 disabled:opacity-60"
        >
          {loading ? "Forging monetization..." : "Run Monetization Foundry"}
        </button>
      </div>

      {disabledReason && (
        <p className="mt-2 text-[11px] text-amber-700">{disabledReason}</p>
      )}
      {error && <p className="mt-2 text-[11px] text-rose-600">{error}</p>}

      {plan && (
        <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] text-[11px]">
          <div className="space-y-2 rounded-xl border border-emerald-100 bg-white/90 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600">
              Monetization thesis
            </p>
            <p className="font-semibold text-slate-900">{plan.headline}</p>
            <p className="mt-1 text-slate-700">{plan.summary}</p>

            <div className="mt-2 space-y-1.5">
              {plan.plays.map((play) => (
                <div
                  key={play.id}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold text-slate-800">
                      {play.label}
                    </span>
                    <span className="text-[9px] text-slate-500">
                      {play.pricingShape} · {play.targetSegment}
                    </span>
                  </div>
                  <p className="mt-0.5 text-slate-700">{play.description}</p>
                  <div className="mt-0.5 grid gap-1 md:grid-cols-2">
                    <div>
                      <p className="text-[10px] font-semibold text-emerald-700">
                        Pros
                      </p>
                      <ul className="list-disc pl-4 text-[10px] text-slate-600">
                        {play.pros.map((p, i) => (
                          <li key={play.id + "p" + i}>{p}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-rose-700">
                        Cons
                      </p>
                      <ul className="list-disc pl-4 text-[10px] text-slate-600">
                        {play.cons.map((c, i) => (
                          <li key={play.id + "c" + i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-600">
                    <span className="font-semibold">Best when:</span>{" "}
                    {play.whenToUse}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-slate-200 bg-white/95 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">
              Launch sequence & guardrails
            </p>
            <ol className="space-y-1.5 list-decimal pl-4 text-[10px] text-slate-700">
              {plan.launchSequence.map((s) => (
                <li key={s.step}>
                  <span className="font-semibold">{s.title}</span> – {s.details}
                </li>
              ))}
            </ol>
            <div className="mt-2">
              <p className="text-[10px] font-semibold text-slate-700">
                Guardrails
              </p>
              <ul className="mt-1 list-disc pl-4 text-[10px] text-slate-600">
                {plan.guardrails.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// src/components/growth/GrowthDNAEnginePanel.tsx
"use client";

import { useState } from "react";
import type {
  GrowthMasterbrainInput,
  GrowthMasterbrainOutput,
  GrowthDNAPlan,
} from "@/lib/growth/types";

type Props = {
  input: GrowthMasterbrainInput | null;
  masterbrain: GrowthMasterbrainOutput | null;
  dna: GrowthDNAPlan | null;
  onDnaChangeAction: (dna: GrowthDNAPlan | null) => void;
  onStepChangeAction: (s: 1 | 2 | 3) => void;
};

export default function GrowthDNAEnginePanel({
  input,
  masterbrain,
  dna,
  onDnaChangeAction,
  onStepChangeAction,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDNA = async () => {
    if (!input) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/growth/dna", {
        method: "POST",
        body: JSON.stringify({ input, masterbrain }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Failed to compute Growth DNA plan");
      }
      const data = (await res.json()) as GrowthDNAPlan;
      onDnaChangeAction(data);
      // Keep within Step 1 visually but also guide towards Step 2 next
      onStepChangeAction(1);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const disabledReason = !input
    ? "Run Growth Masterbrain at least once so I know your context."
    : null;

  return (
    <section className="mt-4 rounded-2xl bg-gradient-to-br from-indigo-50 via-sky-50 to-emerald-50/60 p-5 shadow-sm border border-indigo-100/70">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-900 px-3 py-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-indigo-100">
              SYNTHESIS · GROWTH DNA ENGINE
            </span>
          </div>
          <h3 className="mt-2 text-sm font-semibold text-slate-900">
            Steal the right playbooks, not random tactics.
          </h3>
          <p className="mt-1 text-[11px] text-slate-600">
            I’ll match you with 2–3 real growth archetypes (Figma, Beehiiv,
            Framer, Superhuman, etc.), extract their key moves, and fuse them
            into a 7-day micro-play built for your constraints.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] text-slate-500">
          This is your{" "}
          <span className="font-semibold text-indigo-700">
            synthesis engine
          </span>{" "}
          — similar spirit to Research Lab’s Synthesis Zone, but tuned for
          growth case studies and patterns.
        </p>
        <button
          onClick={runDNA}
          disabled={loading || !!disabledReason}
          className="inline-flex items-center justify-center rounded-xl bg-indigo-700 px-4 py-2 text-[11px] font-semibold text-indigo-50 shadow-sm hover:bg-indigo-800 disabled:opacity-60"
        >
          {loading ? "Mixing growth DNA..." : "Run Growth DNA Synthesis"}
        </button>
      </div>

      {disabledReason && (
        <p className="mt-2 text-[11px] text-amber-700">{disabledReason}</p>
      )}

      {error && <p className="mt-2 text-[11px] text-rose-600">{error}</p>}

      {dna && (
        <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] text-[11px] text-slate-800">
          <div className="space-y-2 rounded-xl border border-indigo-100 bg-white/80 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-indigo-700">
              Fused growth archetype
            </p>
            <p className="font-semibold text-slate-900">
              {dna.primaryArchetypeSummary}
            </p>
            <p className="mt-1 text-slate-700">{dna.mergedPlaybookSummary}</p>

            <div className="mt-2 space-y-1.5">
              {dna.archetypes.map((arc) => (
                <div
                  key={arc.id}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold text-slate-800">
                      {arc.label}
                    </span>
                    <span className="text-[9px] text-slate-500">
                      {arc.companyExamples.join(" · ")}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-700">
                    {arc.description}
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-600">
                    <span className="font-semibold">Why match:</span>{" "}
                    {arc.whyMatch}
                  </p>
                  <ul className="mt-0.5 list-disc pl-4 text-[10px] text-slate-600">
                    {arc.keyMoves.map((m, idx) => (
                      <li key={arc.id + idx}>{m}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-slate-200 bg-white/90 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">
              7-day growth micro-play
            </p>
            <div className="max-h-64 space-y-1.5 overflow-y-auto">
              {dna.sevenDayPlan.map((day) => (
                <div
                  key={day.day}
                  className="rounded-lg border border-slate-100 bg-slate-50 px-2 py-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold text-slate-800">
                      Day {day.day}: {day.title}
                    </span>
                    <span className="text-[9px] text-slate-500">
                      {day.focus}
                    </span>
                  </div>
                  <ul className="mt-0.5 list-disc pl-4 text-[10px] text-slate-600">
                    {day.actions.map((a, idx) => (
                      <li key={day.day + "-" + idx}>{a}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="mt-1 text-[10px] text-slate-600">{dna.notes}</p>
          </div>
        </div>
      )}
    </section>
  );
}

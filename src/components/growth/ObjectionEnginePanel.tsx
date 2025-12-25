// src/components/growth/ObjectionEnginePanel.tsx
"use client";

import { useState } from "react";
import type {
  GrowthMasterbrainInput,
  GrowthMasterbrainOutput,
  ObjectionPlaybook,
} from "@/lib/growth/types";

type Props = {
  input: GrowthMasterbrainInput | null;
  masterbrain: GrowthMasterbrainOutput | null;
  playbook: ObjectionPlaybook | null;
  onChangeAction: (p: ObjectionPlaybook | null) => void;
  onStepChangeAction: (s: 1 | 2 | 3) => void;
};

export default function ObjectionEnginePanel({
  input,
  masterbrain,
  playbook,
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
      const res = await fetch("/api/growth/objections", {
        method: "POST",
        body: JSON.stringify({ input, masterbrain }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Failed to compute objection playbook");
      }
      const data = (await res.json()) as ObjectionPlaybook;
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
    <section className="mt-4 rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 via-slate-50 to-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-rose-900 px-3 py-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-rose-100">
              STEP 3.4 · OBJECTION ENGINE
            </span>
          </div>
          <h3 className="mt-2 text-sm font-semibold text-slate-900">
            Pre-solve your “no’s” before you send a single DM.
          </h3>
          <p className="mt-1 text-[11px] text-slate-600">
            I’ll map the 8–12 most likely objections for your ICP and give you
            sharp, calm rebuttals plus proof ideas and field scripts, so sales
            feels like helping, not pushing.
          </p>
        </div>
        <button
          onClick={run}
          disabled={loading || !!disabledReason}
          className="inline-flex items-center justify-center rounded-xl bg-rose-700 px-4 py-2 text-[11px] font-semibold text-rose-50 shadow-sm hover:bg-rose-800 disabled:opacity-60"
        >
          {loading ? "Mapping objections..." : "Run Objection Engine"}
        </button>
      </div>

      {disabledReason && (
        <p className="mt-2 text-[11px] text-amber-700">{disabledReason}</p>
      )}
      {error && <p className="mt-2 text-[11px] text-rose-600">{error}</p>}

      {playbook && (
        <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] text-[11px]">
          <div className="space-y-2 rounded-xl border border-rose-100 bg-white/90 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-rose-600">
              Objection map
            </p>
            <p className="font-semibold text-slate-900">{playbook.headline}</p>
            <p className="mt-1 text-slate-700">{playbook.summary}</p>
            <div className="mt-2 space-y-1.5">
              {playbook.objections.map((obj) => (
                <div
                  key={obj.id}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold text-slate-800">
                      {obj.objection}
                    </span>
                    <span className="text-[9px] text-slate-500">
                      {obj.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-700">
                    <span className="font-semibold">Answer:</span>{" "}
                    {obj.rebuttal}
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-700">
                    <span className="font-semibold">Proof ideas:</span>
                  </p>
                  <ul className="list-disc pl-4 text-[10px] text-slate-600">
                    {obj.proofIdeas.map((p, i) => (
                      <li key={obj.id + "pf" + i}>{p}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-slate-200 bg-white/95 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">
              Field scripts
            </p>
            <ul className="space-y-1.5 list-disc pl-4 text-[10px] text-slate-700">
              {playbook.fieldScripts.map((s, i) => (
                <li key={i}>
                  <span className="font-mono text-[10px]">“{s}”</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}

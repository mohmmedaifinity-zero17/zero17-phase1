// src/components/research/BuildabilityPanel.tsx
"use client";

import { useState } from "react";
import {
  EvidenceBundle,
  ResearchIdea,
  ScoreBundle,
  SynthesisState,
} from "@/lib/research/types";

interface Props {
  idea: ResearchIdea | null;
  evidence: EvidenceBundle | null;
  synthesis: SynthesisState | null;
  scores: ScoreBundle | null;
  onScoresChange: (scores: ScoreBundle) => void;
}

export default function BuildabilityPanel({
  idea,
  evidence,
  synthesis,
  scores,
  onScoresChange,
}: Props) {
  const [isBusy, setIsBusy] = useState(false);

  const handleRun = async () => {
    if (!idea) return;
    setIsBusy(true);
    try {
      const res = await fetch("/api/research/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, evidence, synthesis }),
      });
      if (!res.ok) {
        console.error("Scores API error:", await res.text());
        return;
      }
      const data = (await res.json()) as { scores: ScoreBundle };
      onScoresChange(data.scores);
    } catch (err) {
      console.error("Scores error:", err);
    } finally {
      setIsBusy(false);
    }
  };

  const s = scores;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Buildability Index · Smart Score Stack
          </h2>
          <p className="text-[11px] text-slate-600">
            Ten sub-scores, one Buildability Index and a Signal Pulse that all
            other decisions sit on.
          </p>
        </div>
        <button
          onClick={handleRun}
          disabled={isBusy || !idea}
          className="rounded-full border border-slate-900 bg-slate-900 px-4 py-1.5 text-[11px] font-semibold text-slate-50 disabled:opacity-60"
        >
          {isBusy ? "Scoring…" : "Compute Smart Scores"}
        </button>
      </div>

      {!s && (
        <p className="text-[11px] text-slate-400">
          Smart Scores not computed yet. Run them once you’ve filled Origin
          Frame and added some evidence and synthesis.
        </p>
      )}

      {s && (
        <div className="grid gap-3 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] text-[11px]">
          <div className="space-y-2 rounded-xl bg-slate-900 p-3 text-slate-50">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Buildability Index
                </span>
                <div className="text-lg font-semibold">
                  {s.buildabilityIndex ?? "—"}/100
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Signal Pulse
                </span>
                <div className="text-base font-semibold text-sky-300">
                  {s.signalPulse ?? "—"}/100
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-300">
              This combines problem certainty, demand evidence, category
              momentum, ICP clarity, moat potential and more, minus penalties
              for complexity and compliance load.
            </p>
          </div>

          <div className="space-y-2 rounded-xl bg-slate-50 p-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              Sub-scores (0–10)
            </span>
            <div className="grid grid-cols-2 gap-1 text-[10px]">
              {Object.entries(s.subScores).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-1"
                >
                  <span className="truncate text-slate-600">
                    {prettyKey(key)}
                  </span>
                  <span className="font-semibold text-slate-900">
                    {value ?? "—"}
                  </span>
                </div>
              ))}
            </div>
            {s.proofStack && (
              <p className="mt-1 text-[10px] text-slate-500">
                Proof Stack: {s.proofStack.receiptsCount} receipts ·{" "}
                {s.proofStack.competitorsCount} competitors ·{" "}
                {s.proofStack.blueprintsCount} blueprints.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function prettyKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

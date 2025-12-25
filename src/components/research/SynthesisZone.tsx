// src/components/research/SynthesisZone.tsx
"use client";

import { useState } from "react";
import {
  EvidenceBundle,
  MatrixFeature,
  ResearchIdea,
  SynthesisState,
} from "@/lib/research/types";

interface Props {
  idea: ResearchIdea | null;
  evidence: EvidenceBundle | null;
  synthesis: SynthesisState | null;
  onSynthesisChange: (s: SynthesisState) => void;
}

export default function SynthesisZone({
  idea,
  evidence,
  synthesis,
  onSynthesisChange,
}: Props) {
  const [isFusionBusy, setIsFusionBusy] = useState(false);
  const [isMutatorBusy, setIsMutatorBusy] = useState(false);
  const [isMatrixBusy, setIsMatrixBusy] = useState(false);

  const state: SynthesisState = synthesis ?? {
    fusionFeatures: [],
    mutationPatterns: [],
    matrixFeatures: [],
  };

  const runFusion = async () => {
    if (!idea) return;
    setIsFusionBusy(true);
    try {
      const res = await fetch("/api/research/synthesis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "fusion", idea, evidence }),
      });
      if (!res.ok) {
        console.error("Fusion API error:", await res.text());
        return;
      }
      const data = (await res.json()) as { fusionFeatures: string[] };
      onSynthesisChange({
        ...state,
        fusionFeatures: data.fusionFeatures ?? [],
      });
    } catch (err) {
      console.error("Fusion error:", err);
    } finally {
      setIsFusionBusy(false);
    }
  };

  const runMutator = async () => {
    if (!idea) return;
    setIsMutatorBusy(true);
    try {
      const res = await fetch("/api/research/synthesis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "mutator", idea, evidence }),
      });
      if (!res.ok) {
        console.error("Mutator API error:", await res.text());
        return;
      }
      const data = (await res.json()) as { mutationPatterns: string[] };
      onSynthesisChange({
        ...state,
        mutationPatterns: data.mutationPatterns ?? [],
      });
    } catch (err) {
      console.error("Mutator error:", err);
    } finally {
      setIsMutatorBusy(false);
    }
  };

  const runMatrix = async () => {
    if (!idea) return;
    setIsMatrixBusy(true);
    try {
      const res = await fetch("/api/research/synthesis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "matrix",
          idea,
          evidence,
          synthesis: state,
        }),
      });
      if (!res.ok) {
        console.error("Matrix API error:", await res.text());
        return;
      }
      const data = (await res.json()) as { matrixFeatures: MatrixFeature[] };
      onSynthesisChange({
        ...state,
        matrixFeatures: data.matrixFeatures ?? [],
      });
    } catch (err) {
      console.error("Matrix error:", err);
    } finally {
      setIsMatrixBusy(false);
    }
  };

  return (
    <section className="space-y-4 rounded-2xl border border-rose-100 bg-rose-50/70 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Synthesis Zone · Fuse, Mutate & Break The Matrix
          </h2>
          <p className="text-[11px] text-slate-600">
            Mix the best from similar tools, steal patterns from other
            categories and summon future-shaped Matrix features. This is where
            your product shape becomes uniquely Zero17.
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3 text-[11px]">
        {/* Fusion */}
        <div className="space-y-2 rounded-xl bg-white/80 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              Feature Fusion Engine
            </span>
            <button
              onClick={runFusion}
              disabled={isFusionBusy || !idea}
              className="rounded-full border border-rose-600 bg-rose-600 px-3 py-1 text-[10px] font-semibold text-rose-50 disabled:opacity-60"
            >
              {isFusionBusy ? "Fusing…" : "Run Fusion"}
            </button>
          </div>
          <p className="text-[10px] text-slate-600">
            Pulls parity, delight and strategic features from tools closest to
            yours.
          </p>
          <ul className="mt-1 space-y-1">
            {state.fusionFeatures.map((f, idx) => (
              <li
                key={idx}
                className="rounded-md bg-rose-50 px-2 py-1 text-[10px]"
              >
                • {f}
              </li>
            ))}
            {state.fusionFeatures.length === 0 && (
              <li className="text-[10px] text-slate-400">
                No fusion yet. Add competitors in Reality Scanner, then run
                Fusion.
              </li>
            )}
          </ul>
        </div>

        {/* Mutator */}
        <div className="space-y-2 rounded-xl bg-white/80 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              Cross-Category Mutator
            </span>
            <button
              onClick={runMutator}
              disabled={isMutatorBusy || !idea}
              className="rounded-full border border-rose-500 bg-white px-3 py-1 text-[10px] font-semibold text-rose-600 disabled:opacity-60"
            >
              {isMutatorBusy ? "Mutating…" : "Run Mutation Pass"}
            </button>
          </div>
          <p className="text-[10px] text-slate-600">
            Steals interaction and business model patterns from Notion, Figma,
            Duolingo, Airbnb, etc.
          </p>
          <ul className="mt-1 space-y-1">
            {state.mutationPatterns.map((p, idx) => (
              <li
                key={idx}
                className="rounded-md bg-rose-50 px-2 py-1 text-[10px]"
              >
                • {p}
              </li>
            ))}
            {state.mutationPatterns.length === 0 && (
              <li className="text-[10px] text-slate-400">
                No patterns yet. Run a Mutation Pass to borrow genius from other
                categories.
              </li>
            )}
          </ul>
        </div>

        {/* Matrix */}
        <div className="space-y-2 rounded-xl bg-slate-900 p-3 text-slate-50">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-300">
              Break The Matrix
            </span>
            <button
              onClick={runMatrix}
              disabled={isMatrixBusy || !idea}
              className="rounded-full border border-rose-400 bg-rose-500 px-3 py-1 text-[10px] font-semibold text-rose-50 disabled:opacity-60"
            >
              {isMatrixBusy ? "Summoning…" : "Break The Matrix"}
            </button>
          </div>
          <p className="text-[10px] text-slate-200">
            Generate 7–15 future-shaped features with timeframe, difficulty,
            dependencies. Most will live in Phase 1–2 & matrixOptional.
          </p>
          <div className="mt-1 space-y-1 max-h-48 overflow-auto pr-1">
            {state.matrixFeatures.map((m, idx) => (
              <div
                key={idx}
                className="rounded-md border border-slate-700 bg-slate-900/60 px-2 py-1"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold text-rose-100">
                    {m.label}
                  </span>
                  <div className="flex gap-1 text-[9px]">
                    <span className="rounded-full bg-rose-500/90 px-2 py-[1px] font-semibold uppercase text-rose-50">
                      {m.timeframe.replace("_", " ")}
                    </span>
                    <span className="rounded-full bg-slate-800 px-2 py-[1px] font-medium text-slate-100">
                      {m.type.replace("_", " ")}
                    </span>
                    <span className="rounded-full bg-slate-50 px-2 py-[1px] font-medium text-slate-900">
                      {m.difficulty}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-100">{m.description}</p>
                <p className="mt-1 text-[10px] text-rose-200">
                  Why: {m.whyInteresting}
                </p>
                {m.dependencies.length > 0 && (
                  <p className="mt-1 text-[9px] text-slate-300">
                    Dependencies: {m.dependencies.join(", ")}
                  </p>
                )}
              </div>
            ))}
            {state.matrixFeatures.length === 0 && (
              <p className="text-[10px] text-slate-400">
                No Matrix features yet. When you break the matrix, I’ll track
                structured future bets here.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// src/components/research/QuantumInsightPanel.tsx
"use client";

import { useState } from "react";
import { EvidenceBundle, ResearchIdea } from "@/lib/research/types";

export interface InsightResult {
  marketDirection: string;
  noveltyScore: number;
  moatIndex: number;
  effortPayoffMap: string;
  keyTruths: string[];
  verdict: string;
}

interface Props {
  idea: ResearchIdea | null;
  evidence: EvidenceBundle | null;
}

export default function QuantumInsightPanel({ idea, evidence }: Props) {
  const [isBusy, setIsBusy] = useState(false);
  const [insight, setInsight] = useState<InsightResult | null>(null);

  const handleRun = async () => {
    if (!idea) return;
    setIsBusy(true);
    try {
      const res = await fetch("/api/research/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, evidence }),
      });
      if (!res.ok) {
        console.error("Insight API error:", await res.text());
        return;
      }
      const data = (await res.json()) as { insight: InsightResult };
      setInsight(data.insight);
    } catch (err) {
      console.error("Insight error:", err);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <section className="rounded-2xl border border-sky-100 bg-sky-50/80 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Quantum Insight Engine
          </h2>
          <p className="text-[11px] text-slate-600">
            Run a VC-level x PM x CTO brain on your idea. See novelty, moat
            index and whether this is worth your next 12 months.
          </p>
        </div>
        <button
          onClick={handleRun}
          disabled={isBusy || !idea}
          className="rounded-full border border-sky-600 bg-sky-600 px-4 py-1.5 text-[11px] font-semibold text-sky-50 disabled:opacity-60"
        >
          {isBusy ? "Thinking…" : "Run Quantum Insight"}
        </button>
      </div>

      {(!idea || !idea.description) && (
        <p className="text-[11px] text-slate-400">
          Fill the Origin Frame first so I know what you’re building.
        </p>
      )}

      {insight && (
        <div className="mt-2 grid gap-3 md:grid-cols-3 text-[11px]">
          <div className="space-y-1 rounded-lg bg-white/70 p-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              Market direction
            </span>
            <p className="text-[11px] text-slate-800">
              {insight.marketDirection}
            </p>
          </div>
          <div className="space-y-1 rounded-lg bg-white/70 p-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              Novelty & Moat
            </span>
            <p className="text-[10px] text-slate-800">
              Novelty:{" "}
              <span className="font-semibold">{insight.noveltyScore}/100</span>
              <br />
              Moat index:{" "}
              <span className="font-semibold">{insight.moatIndex}/100</span>
            </p>
            <p className="mt-1 text-[10px] text-slate-700">
              {insight.effortPayoffMap}
            </p>
          </div>
          <div className="space-y-1 rounded-lg bg-white/70 p-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              Verdict
            </span>
            <p className="text-[11px] text-slate-900">{insight.verdict}</p>
          </div>

          <div className="md:col-span-3 space-y-1 rounded-lg bg-slate-900 p-3 text-slate-50">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-300">
              Key truths
            </span>
            <ul className="space-y-1">
              {insight.keyTruths.map((t, idx) => (
                <li key={idx} className="text-[11px] text-slate-50">
                  • {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}

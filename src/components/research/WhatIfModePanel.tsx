// src/components/research/WhatIfModePanel.tsx
"use client";

import { useState } from "react";
import {
  EvidenceBundle,
  ResearchIdea,
  SynthesisState,
  ScoreBundle,
  Blueprint,
} from "@/lib/research/types";
import type { WhatIfScenarioKey } from "@/app/api/research/whatif/route";

interface WhatIfResult {
  scenarioKey: WhatIfScenarioKey;
  scores: ScoreBundle;
  blueprint: Blueprint;
  note: string;
}

const SCENARIOS: {
  key: WhatIfScenarioKey;
  label: string;
  description: string;
}[] = [
  {
    key: "solo_3_months",
    label: "Solo · 3 months",
    description: "Tiny but sharp wedge, built by one person in <=3 months.",
  },
  {
    key: "enterprise",
    label: "Enterprise ICP",
    description: "Target bigger companies · longer sales, more proof.",
  },
  {
    key: "free_product",
    label: "Free product wedge",
    description: "Free core experience, monetise via upsell later.",
  },
  {
    key: "agent_first",
    label: "Agent-first",
    description: "Agents run the work, UI is supervision and config.",
  },
];

interface Props {
  idea: ResearchIdea | null;
  evidence: EvidenceBundle | null;
  synthesis: SynthesisState | null;
}

export default function WhatIfModePanel({ idea, evidence, synthesis }: Props) {
  const [selected, setSelected] = useState<WhatIfScenarioKey>("solo_3_months");
  const [result, setResult] = useState<WhatIfResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canRun = !!idea;

  const handleRun = async () => {
    if (!idea) return;
    setIsRunning(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/research/whatif", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea,
          evidence,
          synthesis,
          scenarioKey: selected,
        }),
      });

      if (!res.ok) {
        console.error("WhatIf API error:", await res.text());
        setErrorMsg("Something went wrong running this scenario.");
        setIsRunning(false);
        return;
      }

      const data = (await res.json()) as WhatIfResult;
      setResult(data);
    } catch (err) {
      console.error("WhatIf fetch error:", err);
      setErrorMsg("Network error while running scenario.");
    } finally {
      setIsRunning(false);
    }
  };

  const scenarioMeta = SCENARIOS.find((s) => s.key === selected)!;

  return (
    <section className="rounded-2xl border border-sky-100 bg-sky-50/70 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <h3 className="text-[11px] font-semibold text-slate-900">
            What-If Mode
          </h3>
          <p className="text-[10px] text-slate-600">
            See how your scores and blueprint change under alternate realities:
            solo founder, enterprise pivot, free product, agent-first, etc.
          </p>
        </div>
        <button
          onClick={handleRun}
          disabled={!canRun || isRunning}
          className="rounded-full border border-sky-700 bg-sky-700 px-3 py-1 text-[10px] font-semibold text-sky-50 disabled:opacity-50"
        >
          {isRunning
            ? "Simulating..."
            : canRun
              ? "Run scenario"
              : "Add idea first"}
        </button>
      </div>

      <div className="mb-2 flex flex-wrap gap-2">
        {SCENARIOS.map((s) => {
          const isActive = s.key === selected;
          const base =
            "rounded-full border px-3 py-1 text-[10px] font-semibold transition-colors cursor-pointer";
          const style = isActive
            ? "border-sky-700 bg-sky-700 text-sky-50 shadow-sm"
            : "border-sky-200 bg-white text-sky-800 hover:bg-sky-50";
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setSelected(s.key)}
              className={base + " " + style}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      <p className="mb-2 text-[10px] text-slate-600">
        {scenarioMeta.description}
      </p>

      {errorMsg && <p className="mb-1 text-[10px] text-rose-600">{errorMsg}</p>}

      {result && (
        <div className="mt-2 grid gap-2 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] text-[10px]">
          <div className="space-y-2">
            <div className="rounded-lg border border-sky-200 bg-white p-2">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-sky-800">
                  Scenario scores
                </span>
                <span className="rounded-full bg-sky-100 px-2 py-[1px] text-[9px] font-semibold text-sky-900">
                  Buildability {result.scores.buildabilityIndex}/100 · Pulse{" "}
                  {result.scores.signalPulse}/100
                </span>
              </div>
              <ul className="space-y-[2px] text-[10px] text-slate-800">
                <li>
                  • Problem certainty:{" "}
                  {result.scores.subScores.problemCertainty}/10
                </li>
                <li>
                  • Demand evidence: {result.scores.subScores.demandEvidence}/10
                </li>
                <li>• ICP clarity: {result.scores.subScores.icpClarity}/10</li>
                <li>
                  • Build complexity (lower is better):{" "}
                  {result.scores.subScores.buildComplexity}/10
                </li>
                <li>
                  • Growth path clarity:{" "}
                  {result.scores.subScores.growthPathClarity}/10
                </li>
              </ul>
            </div>
            <div className="rounded-lg border border-sky-200 bg-sky-50/80 p-2">
              <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-sky-900">
                Scenario note
              </span>
              <p className="mt-1 whitespace-pre-line text-[10px] text-slate-800">
                {result.note}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="rounded-lg border border-sky-200 bg-white p-2">
              <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-700">
                Phase 0 (scenario)
              </span>
              <p className="mt-1 text-[10px] text-slate-800">
                {result.blueprint.phase0Scope}
              </p>
            </div>
            <div className="rounded-lg border border-sky-200 bg-slate-900 p-2 text-slate-50">
              <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                Decision (scenario)
              </span>
              <p className="mt-1 text-[10px]">
                {result.blueprint.decisionNote}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

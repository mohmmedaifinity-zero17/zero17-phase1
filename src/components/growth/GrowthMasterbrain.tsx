// src/components/growth/GrowthMasterbrain.tsx
"use client";

import { useState } from "react";
import { Brain, Sparkles, Loader2 } from "lucide-react";
import { useGrowthConfig } from "../../../components/growth/GrowthContext";

type GrowthModel = {
  narrative: string;
  priorities: string[];
  moat: string;
  risks: string[];
  kpis: string[];
};

type MasterbrainResponse = {
  ok: boolean;
  model?: GrowthModel;
  error?: string;
};

type HelixMovePayload = {
  source: "growth-masterbrain";
  summary: string;
  createdAt: string;
};

function broadcastHelixMove(summary: string) {
  if (typeof window === "undefined") return;

  const payload: HelixMovePayload = {
    source: "growth-masterbrain",
    summary,
    createdAt: new Date().toISOString(),
  };

  try {
    window.localStorage.setItem(
      "z17_last_growth_move",
      JSON.stringify(payload)
    );
  } catch {
    // ignore
  }

  window.dispatchEvent(
    new CustomEvent("z17:helixNextMove", {
      detail: payload,
    })
  );
}

export function GrowthMasterbrain() {
  const { config } = useGrowthConfig();
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState<GrowthModel | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/z17/growth/masterbrain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: config.goal,
          icp: config.icp,
          offer: config.offer,
          budget: config.budget,
          metric: config.primaryMetric,
        }),
      });

      const json = (await res.json()) as MasterbrainResponse;
      if (!json.ok || !json.model) {
        throw new Error(json.error || "Failed to generate growth model");
      }

      setModel(json.model);

      const topPriority =
        json.model.priorities && json.model.priorities.length > 0
          ? json.model.priorities[0]
          : "Run the first small experiment to validate demand.";

      broadcastHelixMove(topPriority);
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const summaryText =
    model?.narrative ||
    "Click “Generate growth model” to build a custom growth blueprint from your ICP, offer, budget and goals.";

  return (
    <section className="rounded-3xl bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 text-white px-5 py-5 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 shadow-md">
      <div className="flex items-start gap-3 flex-1">
        <div className="mt-0.5">
          <Brain className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <div className="text-[11px] uppercase tracking-wide opacity-80">
            Growth Masterbrain • Founder Operating System
          </div>
          <div className="text-sm font-semibold">
            One brain that designs your entire growth system.
          </div>
          <p className="text-[11px] text-purple-50">{summaryText}</p>

          {model && (
            <div className="grid md:grid-cols-3 gap-3 text-[11px] mt-3">
              <div>
                <div className="font-semibold mb-1">Top priorities</div>
                <ul className="space-y-1 text-purple-50/90">
                  {model.priorities.map((p, i) => (
                    <li key={i}>• {p}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="font-semibold mb-1">Growth moat</div>
                <p className="text-purple-50/90">{model.moat}</p>
              </div>
              <div>
                <div className="font-semibold mb-1">North-star KPIs</div>
                <ul className="space-y-1 text-purple-50/90">
                  {model.kpis.map((k, i) => (
                    <li key={i}>• {k}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {error && (
            <p className="text-[11px] text-red-100 bg-red-500/20 border border-red-300/60 rounded-xl px-3 py-2 mt-2">
              {error}
            </p>
          )}
        </div>
      </div>

      <div className="w-full lg:w-[260px] flex flex-col items-end gap-3">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full bg-white text-purple-700 px-4 py-2 text-[11px] font-semibold shadow-sm hover:bg-purple-50 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Sparkles className="w-3 h-3" />
          )}
          Generate growth model
        </button>
        <p className="text-[10px] text-purple-100 text-right max-w-xs">
          Masterbrain reads your ICP, offer, budget and plan, then outputs a
          focused growth model. HELIX listens to the same signal and surfaces
          today&apos;s next move globally.
        </p>
      </div>
    </section>
  );
}

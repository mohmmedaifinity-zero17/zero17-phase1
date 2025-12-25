// src/components/growth/FlywheelBuilder.tsx
"use client";

import { useState } from "react";
import { RefreshCw, Infinity as InfinityIcon } from "lucide-react";
import { useGrowthConfig } from "./GrowthContext";

type FlywheelLoop = {
  name: string;
  description: string;
  trigger: string;
  accelerators: string[];
  metric: string;
};

type FlywheelResponse = {
  ok: boolean;
  loops?: FlywheelLoop[];
  error?: string;
};

export function FlywheelBuilder() {
  const { config } = useGrowthConfig();
  const [loops, setLoops] = useState<FlywheelLoop[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/z17/growth/flywheel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: config.goal,
          icp: config.icp,
          offer: config.offer,
        }),
      });

      const json = (await res.json()) as FlywheelResponse;
      if (!json.ok || !json.loops) {
        throw new Error(json.error || "Failed to generate flywheel");
      }

      setLoops(json.loops);
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="z17-card bg-white/90 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <InfinityIcon className="w-4 h-4 text-sky-600" />
          <div className="text-sm font-semibold">Growth flywheel builder</div>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-3 py-1.5 text-[11px] font-semibold hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          Generate flywheel
        </button>
      </div>

      <p className="text-[11px] text-slate-600">
        Instead of a one-way funnel, build a compounding flywheel: acquisition →
        activation → amplification. Each loop is a self-reinforcing engine.
      </p>

      {error && (
        <p className="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      {!loops && !error && (
        <p className="text-[11px] text-slate-500">
          Click <span className="font-semibold">Generate flywheel</span> to see
          how your product can grow itself through loops instead of linear
          funnels.
        </p>
      )}

      {loops && (
        <div className="space-y-3 text-[11px] mt-1">
          {loops.map((loop, i) => (
            <div
              key={i}
              className="rounded-xl border border-sky-200 bg-sky-50/70 px-3 py-2 space-y-1"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="font-semibold">{loop.name}</div>
                <span className="text-[10px] text-sky-700 font-semibold">
                  Metric: {loop.metric}
                </span>
              </div>
              <p className="text-slate-700">{loop.description}</p>
              <p className="text-[10px] text-slate-600">
                Trigger: <span className="font-semibold">{loop.trigger}</span>
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {loop.accelerators.map((acc, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-full bg-white border border-sky-200 text-sky-800"
                  >
                    {acc}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

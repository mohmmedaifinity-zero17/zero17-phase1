"use client";

import type { ShadowRunPayload } from "@/lib/builder/agentInsights";

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function toPoints(values: number[], w: number, h: number) {
  if (values.length <= 1) return "";
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;

  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / span) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export default function AgentKpiTimelineChart({
  runs,
}: {
  runs: ShadowRunPayload[];
}) {
  const w = 520;
  const h = 160;

  const success = runs.map((r) => clamp01(r.kpis.successRate));
  const conf = runs.map((r) => Number(r.kpis.confidenceScore || 0));
  const lat = runs.map((r) => Number(r.kpis.avgLatencyMs || 0));

  const successPts = toPoints(success, w, h);
  const confPts = toPoints(conf, w, h);
  const latPts = toPoints(lat, w, h);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-900">KPI timeline</p>
          <p className="mt-1 text-[11px] text-slate-600">
            Success rate (0–1), confidence (0–100), latency (ms) across recent
            runs.
          </p>
        </div>
        <div className="text-[11px] text-slate-600">
          Runs:{" "}
          <span className="font-semibold text-slate-900">{runs.length}</span>
        </div>
      </div>

      {runs.length < 2 ? (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
          Need at least 2 runs to render a timeline.
        </div>
      ) : (
        <div className="mt-3">
          <div className="flex flex-wrap gap-2 text-[11px]">
            <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-slate-700">
              Success rate
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-slate-700">
              Confidence
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-slate-700">
              Latency
            </span>
          </div>

          <div className="mt-2 overflow-x-auto">
            <svg
              width={w}
              height={h}
              className="rounded-xl border border-slate-200 bg-slate-50"
            >
              {/* grid */}
              {Array.from({ length: 5 }).map((_, i) => {
                const y = (i / 4) * h;
                return (
                  <line
                    key={i}
                    x1={0}
                    y1={y}
                    x2={w}
                    y2={y}
                    stroke="rgba(148,163,184,0.35)"
                    strokeWidth={1}
                  />
                );
              })}

              {/* success */}
              <polyline
                points={successPts}
                fill="none"
                stroke="rgba(16,185,129,0.9)"
                strokeWidth={2}
              />

              {/* confidence */}
              <polyline
                points={confPts}
                fill="none"
                stroke="rgba(59,130,246,0.9)"
                strokeWidth={2}
              />

              {/* latency */}
              <polyline
                points={latPts}
                fill="none"
                stroke="rgba(244,63,94,0.85)"
                strokeWidth={2}
              />
            </svg>
          </div>

          <div className="mt-2 grid gap-2 md:grid-cols-3 text-[11px]">
            <div className="rounded-xl border border-slate-200 bg-white p-2">
              <p className="font-semibold text-slate-900">Latest success</p>
              <p className="mt-1 text-slate-700">
                {Math.round(success[success.length - 1] * 100)}%
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-2">
              <p className="font-semibold text-slate-900">Latest confidence</p>
              <p className="mt-1 text-slate-700">{conf[conf.length - 1]}</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-2">
              <p className="font-semibold text-slate-900">Latest latency</p>
              <p className="mt-1 text-slate-700">{lat[lat.length - 1]}ms</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

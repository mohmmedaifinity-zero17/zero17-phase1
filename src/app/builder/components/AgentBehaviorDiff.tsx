"use client";

import type { BehaviorDiff } from "@/lib/builder/agentInsights";

function pill(kind: "good" | "bad" | "neutral") {
  if (kind === "good")
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (kind === "bad") return "border-rose-200 bg-rose-50 text-rose-800";
  return "border-slate-200 bg-white text-slate-700";
}

export default function AgentBehaviorDiff({ diff }: { diff: BehaviorDiff }) {
  const s = diff.summary;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-900">Behavior diff</p>
          <p className="mt-1 text-[11px] text-slate-600">
            What changed between{" "}
            <span className="font-semibold">{diff.fromRunId}</span> →{" "}
            <span className="font-semibold">{diff.toRunId}</span>
          </p>
        </div>

        <div className="text-right text-[11px] text-slate-700">
          <div className="flex flex-wrap justify-end gap-2">
            <span
              className={`rounded-full border px-2 py-0.5 ${pill(s.successRateDeltaPct >= 0 ? "good" : "bad")}`}
            >
              Success {s.successRateDeltaPct >= 0 ? "+" : ""}
              {s.successRateDeltaPct}%
            </span>
            <span
              className={`rounded-full border px-2 py-0.5 ${pill(s.confidenceDelta >= 0 ? "good" : "bad")}`}
            >
              Confidence {s.confidenceDelta >= 0 ? "+" : ""}
              {s.confidenceDelta}
            </span>
            <span
              className={`rounded-full border px-2 py-0.5 ${pill(s.latencyDeltaMs <= 0 ? "good" : "bad")}`}
            >
              Latency {s.latencyDeltaMs >= 0 ? "+" : ""}
              {s.latencyDeltaMs}ms
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-[11px] font-semibold text-slate-900">
            Outcome changes
          </p>
          <p className="mt-1 text-xs text-slate-700">{s.changedOutcomes}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-[11px] font-semibold text-slate-900">
            Added actions
          </p>
          <p className="mt-1 text-xs text-slate-700">{s.addedActions}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-[11px] font-semibold text-slate-900">
            Removed actions
          </p>
          <p className="mt-1 text-xs text-slate-700">{s.removedActions}</p>
        </div>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-[11px] font-semibold text-slate-900">Changed</p>
          <div className="mt-2 max-h-56 overflow-auto space-y-2">
            {diff.changed.length === 0 ? (
              <p className="text-[11px] text-slate-600">No changes detected.</p>
            ) : (
              diff.changed.map((x, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-[11px]"
                >
                  <p className="font-semibold text-slate-900">{x.action}</p>
                  <p className="mt-1 text-slate-700">
                    Outcome:{" "}
                    <span
                      className={
                        x.fromOutcome === "success"
                          ? "text-emerald-700"
                          : "text-rose-700"
                      }
                    >
                      {x.fromOutcome}
                    </span>{" "}
                    →{" "}
                    <span
                      className={
                        x.toOutcome === "success"
                          ? "text-emerald-700"
                          : "text-rose-700"
                      }
                    >
                      {x.toOutcome}
                    </span>
                  </p>
                  <p className="text-slate-700">
                    Latency: {x.fromLatencyMs}ms → {x.toLatencyMs}ms
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-[11px] font-semibold text-slate-900">Added</p>
          <div className="mt-2 max-h-56 overflow-auto space-y-2">
            {diff.added.length === 0 ? (
              <p className="text-[11px] text-slate-600">No added actions.</p>
            ) : (
              diff.added.map((x, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-[11px]"
                >
                  <p className="font-semibold text-slate-900">{x.action}</p>
                  <p className="mt-1 text-slate-700">
                    Outcome:{" "}
                    <span
                      className={
                        x.toOutcome === "success"
                          ? "text-emerald-700"
                          : "text-rose-700"
                      }
                    >
                      {x.toOutcome}
                    </span>
                    , {x.toLatencyMs}ms
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-[11px] font-semibold text-slate-900">Removed</p>
          <div className="mt-2 max-h-56 overflow-auto space-y-2">
            {diff.removed.length === 0 ? (
              <p className="text-[11px] text-slate-600">No removed actions.</p>
            ) : (
              diff.removed.map((x, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-rose-200 bg-rose-50 p-2 text-[11px]"
                >
                  <p className="font-semibold text-slate-900">{x.action}</p>
                  <p className="mt-1 text-slate-700">
                    Outcome:{" "}
                    <span
                      className={
                        x.fromOutcome === "success"
                          ? "text-emerald-700"
                          : "text-rose-700"
                      }
                    >
                      {x.fromOutcome}
                    </span>
                    , {x.fromLatencyMs}ms
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}




// src/lib/builder/server/agentTrendGate.ts

import type { ShadowRunPayload } from "@/lib/builder/agentInsights";

export type TrendDecision = {
  ok: boolean;
  reason?: string;
  metrics?: {
    successTrend: number;
    confidenceTrend: number;
    latencyTrendMs: number;
  };
};

function avg(nums: number[]) {
  return nums.reduce((a, b) => a + b, 0) / Math.max(nums.length, 1);
}

/**
 * Anti-spike trend gate.
 * Rules:
 * - Minimum N runs
 * - No sudden KPI spike
 * - Success + confidence must be stable or improving
 * - Latency must not degrade sharply
 */
export function evaluatePromotionTrend(
  runs: ShadowRunPayload[],
  windowSize = 3
): TrendDecision {
  if (runs.length < windowSize) {
    return {
      ok: false,
      reason: `Need at least ${windowSize} shadow runs for trend analysis`,
    };
  }

  const recent = runs.slice(-windowSize);

  const success = recent.map((r) => r.kpis.successRate);
  const conf = recent.map((r) => r.kpis.confidenceScore);
  const lat = recent.map((r) => r.kpis.avgLatencyMs);

  const successTrend = success[success.length - 1] - success[0];
  const confidenceTrend = conf[conf.length - 1] - conf[0];
  const latencyTrendMs = lat[lat.length - 1] - lat[0];

  // Anti-spike: block sharp jumps
  const spike = Math.abs(successTrend) > 0.25 || Math.abs(confidenceTrend) > 25;

  if (spike) {
    return {
      ok: false,
      reason: "Detected unstable KPI spike (anti-spike guard)",
      metrics: { successTrend, confidenceTrend, latencyTrendMs },
    };
  }

  if (avg(success) < 0.85) {
    return {
      ok: false,
      reason: "Average success rate below threshold",
      metrics: { successTrend, confidenceTrend, latencyTrendMs },
    };
  }

  if (avg(conf) < 80) {
    return {
      ok: false,
      reason: "Average confidence below threshold",
      metrics: { successTrend, confidenceTrend, latencyTrendMs },
    };
  }

  if (latencyTrendMs > 200) {
    return {
      ok: false,
      reason: "Latency trending worse",
      metrics: { successTrend, confidenceTrend, latencyTrendMs },
    };
  }

  return {
    ok: true,
    metrics: { successTrend, confidenceTrend, latencyTrendMs },
  };
}

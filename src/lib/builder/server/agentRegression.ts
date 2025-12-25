// src/lib/builder/server/agentRegression.ts

import type { ShadowRunPayload } from "@/lib/builder/agentInsights";

export type RegressionResult = {
  regressed: boolean;
  drops?: {
    successRateDropPct?: number;
    confidenceDrop?: number;
    latencyIncreaseMs?: number;
  };
};

export function detectRegression(
  baseline: ShadowRunPayload,
  latest: ShadowRunPayload
): RegressionResult {
  const successDrop = baseline.kpis.successRate - latest.kpis.successRate;
  const confidenceDrop =
    baseline.kpis.confidenceScore - latest.kpis.confidenceScore;
  const latencyIncrease = latest.kpis.avgLatencyMs - baseline.kpis.avgLatencyMs;

  const regressed =
    successDrop > 0.1 || confidenceDrop > 15 || latencyIncrease > 300;

  if (!regressed) return { regressed: false };

  return {
    regressed: true,
    drops: {
      successRateDropPct: Math.round(successDrop * 100),
      confidenceDrop: Math.round(confidenceDrop),
      latencyIncreaseMs: Math.round(latencyIncrease),
    },
  };
}

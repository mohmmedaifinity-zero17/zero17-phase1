// src/lib/builder/server/agentAutoDemotion.ts

import type { ShadowRunPayload } from "@/lib/builder/agentInsights";

export type DemotionDecision = {
  demote: boolean;
  reason?: string;
};

export function shouldAutoDemote(
  baseline: ShadowRunPayload,
  latest: ShadowRunPayload
): DemotionDecision {
  const successDrop = baseline.kpis.successRate - latest.kpis.successRate;
  const confidenceDrop =
    baseline.kpis.confidenceScore - latest.kpis.confidenceScore;
  const latencyIncrease = latest.kpis.avgLatencyMs - baseline.kpis.avgLatencyMs;

  if (successDrop > 0.2) {
    return {
      demote: true,
      reason: "Severe success rate regression (>20%)",
    };
  }

  if (confidenceDrop > 25) {
    return {
      demote: true,
      reason: "Severe confidence regression (>25)",
    };
  }

  if (latencyIncrease > 600) {
    return {
      demote: true,
      reason: "Severe latency regression (>600ms)",
    };
  }

  return { demote: false };
}

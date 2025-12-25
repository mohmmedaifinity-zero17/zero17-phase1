// src/lib/builder/server/agentPromotion.ts

import type { AgentRunRecord } from "@/lib/builder/types/agent";

export function canPromoteAgent(run: AgentRunRecord): {
  ok: boolean;
  reason?: string;
} {
  if (run.kpis.successRate < 0.85) {
    return { ok: false, reason: "Success rate below threshold (85%)" };
  }

  if (run.kpis.confidenceScore < 80) {
    return { ok: false, reason: "Confidence score below threshold (80)" };
  }

  if (run.kpis.avgLatencyMs > 600) {
    return { ok: false, reason: "Latency too high" };
  }

  return { ok: true };
}

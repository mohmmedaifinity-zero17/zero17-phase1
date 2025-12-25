// src/lib/builder/server/agentShadow.ts

export type AgentShadowLog = {
  step: number;
  action: string;
  outcome: "success" | "fail";
  latencyMs: number;
  notes?: string;
};

export type AgentShadowRun = {
  runId: string;
  agentId?: string;
  agentName: string;
  mode: "shadow" | "production";
  seed: number;
  tasks: string[];
  logs: AgentShadowLog[];
  kpis: {
    successRate: number; // 0..1
    avgLatencyMs: number;
    confidenceScore: number; // 0..100
  };
  createdAt: string;
};

// Deterministic PRNG (Mulberry32)
function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

export function runAgentInShadowModeDeterministic(opts: {
  agentName: string;
  tasks: string[];
  seed: number;
  agentId?: string;
  mode?: "shadow" | "production";
}): AgentShadowRun {
  const { agentName, tasks, seed, agentId, mode = "shadow" } = opts;

  const rand = mulberry32(seed);
  let totalLatency = 0;
  let successes = 0;

  const logs: AgentShadowLog[] = tasks.map((task, idx) => {
    const latency = Math.floor(120 + rand() * 280);
    totalLatency += latency;

    // deterministic success/fail
    const success = rand() > 0.15;
    if (success) successes++;

    return {
      step: idx + 1,
      action: task,
      outcome: success ? "success" : "fail",
      latencyMs: latency,
      notes: success ? "Executed as expected" : "Ambiguous response",
    };
  });

  const successRate = clamp01(tasks.length ? successes / tasks.length : 0);

  // deterministic confidence (based on seed + performance)
  const confidenceScore = Math.round(70 + successRate * 25 + rand() * 5);

  return {
    runId: `shadow_${seed}_${Date.now()}`, // unique id but deterministic behavior comes from seed
    agentId,
    agentName,
    mode,
    seed,
    tasks,
    logs,
    kpis: {
      successRate: Number(successRate.toFixed(2)),
      avgLatencyMs: tasks.length ? Math.round(totalLatency / tasks.length) : 0,
      confidenceScore,
    },
    createdAt: new Date().toISOString(),
  };
}

export function replayShadowRun(payload: {
  agentName: string;
  tasks: string[];
  seed: number;
  agentId?: string;
}): AgentShadowRun {
  // identical output for same seed+tasks (behavior deterministic)
  return runAgentInShadowModeDeterministic({
    agentName: payload.agentName,
    tasks: payload.tasks,
    seed: payload.seed,
    agentId: payload.agentId,
    mode: "shadow",
  });
}

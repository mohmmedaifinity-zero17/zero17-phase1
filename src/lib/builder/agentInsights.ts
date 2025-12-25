// src/lib/builder/agentInsights.ts

export type ShadowLog = {
  step: number;
  action: string;
  outcome: "success" | "fail";
  latencyMs: number;
  notes?: string;
};

export type ShadowRunPayload = {
  runId: string;
  agentName: string;
  mode: "shadow" | "production";
  logs: ShadowLog[];
  kpis: {
    successRate: number; // 0..1 or 0..100 depending on earlier versions
    avgLatencyMs: number;
    confidenceScore: number; // 0..100
  };
  createdAt: string;
};

export type LedgerEvent = {
  type: string;
  payload: any;
  createdAt: string;
};

export function normalizeSuccessRate(v: number): number {
  // supports 0..1 and 0..100
  if (!Number.isFinite(v)) return 0;
  return v > 1
    ? Math.max(0, Math.min(1, v / 100))
    : Math.max(0, Math.min(1, v));
}

export function getAgentRunsFromLedger(ledger?: any[]): ShadowRunPayload[] {
  const list = (ledger || [])
    .filter((e: any) => e?.type === "agent_shadow_run" && e?.payload?.runId)
    .map((e: any) => {
      const p = e.payload as ShadowRunPayload;
      // prefer payload.createdAt, but fallback to ledger event time
      return {
        ...p,
        createdAt: p.createdAt || e.createdAt,
        kpis: {
          ...p.kpis,
          successRate: normalizeSuccessRate(p.kpis?.successRate ?? 0),
          avgLatencyMs: Number(p.kpis?.avgLatencyMs ?? 0),
          confidenceScore: Number(p.kpis?.confidenceScore ?? 0),
        },
      };
    })
    .sort((a: any, b: any) => +new Date(a.createdAt) - +new Date(b.createdAt));

  return list;
}

export type BehaviorDiff = {
  fromRunId: string;
  toRunId: string;
  summary: {
    totalActionsFrom: number;
    totalActionsTo: number;
    changedOutcomes: number;
    addedActions: number;
    removedActions: number;
    latencyDeltaMs: number;
    successRateDeltaPct: number;
    confidenceDelta: number;
  };
  changed: Array<{
    action: string;
    fromOutcome: "success" | "fail";
    toOutcome: "success" | "fail";
    fromLatencyMs: number;
    toLatencyMs: number;
  }>;
  added: Array<{
    action: string;
    toOutcome: "success" | "fail";
    toLatencyMs: number;
  }>;
  removed: Array<{
    action: string;
    fromOutcome: "success" | "fail";
    fromLatencyMs: number;
  }>;
};

function toActionMap(logs: ShadowLog[]) {
  const m = new Map<string, ShadowLog>();
  for (const l of logs || []) {
    if (!l?.action) continue;
    // latest entry wins if duplicates
    m.set(String(l.action), l);
  }
  return m;
}

export function diffRuns(
  from: ShadowRunPayload,
  to: ShadowRunPayload
): BehaviorDiff {
  const A = toActionMap(from.logs || []);
  const B = toActionMap(to.logs || []);

  const changed: BehaviorDiff["changed"] = [];
  const added: BehaviorDiff["added"] = [];
  const removed: BehaviorDiff["removed"] = [];

  for (const [action, a] of Array.from(A.entries())) {
    const b = B.get(action);
    if (!b) {
      removed.push({
        action,
        fromOutcome: a.outcome,
        fromLatencyMs: a.latencyMs,
      });
      continue;
    }
    if (a.outcome !== b.outcome || a.latencyMs !== b.latencyMs) {
      changed.push({
        action,
        fromOutcome: a.outcome,
        toOutcome: b.outcome,
        fromLatencyMs: a.latencyMs,
        toLatencyMs: b.latencyMs,
      });
    }
  }

  for (const [action, b] of Array.from(B.entries())) {
    if (!A.has(action)) {
      added.push({ action, toOutcome: b.outcome, toLatencyMs: b.latencyMs });
    }
  }

  const successRateDeltaPct = Math.round(
    (to.kpis.successRate - from.kpis.successRate) * 100
  );
  const latencyDeltaMs = Math.round(
    to.kpis.avgLatencyMs - from.kpis.avgLatencyMs
  );
  const confidenceDelta = Math.round(
    to.kpis.confidenceScore - from.kpis.confidenceScore
  );

  return {
    fromRunId: from.runId,
    toRunId: to.runId,
    summary: {
      totalActionsFrom: A.size,
      totalActionsTo: B.size,
      changedOutcomes: changed.filter((x) => x.fromOutcome !== x.toOutcome)
        .length,
      addedActions: added.length,
      removedActions: removed.length,
      latencyDeltaMs,
      successRateDeltaPct,
      confidenceDelta,
    },
    changed,
    added,
    removed,
  };
}

export type ReplayEventPayload = {
  originalRunId: string;
  replaySeed: number;
  replayKpis: {
    successRate: number;
    avgLatencyMs: number;
    confidenceScore: number;
  };
  replayLogs: ShadowLog[];
};

export function getReplayForOriginalRun(
  ledger: any[] | undefined,
  originalRunId: string
) {
  const events = (ledger || []).filter(
    (e: any) => e?.type === "agent_run_replay"
  );
  const match = events.find(
    (e: any) => e?.payload?.originalRunId === originalRunId
  );
  return match?.payload as ReplayEventPayload | null;
}

export function buildRunFromReplay(
  original: ShadowRunPayload,
  replay: ReplayEventPayload
): ShadowRunPayload {
  return {
    ...original,
    runId: `replay_of_${original.runId}`,
    createdAt: new Date().toISOString(),
    logs: replay.replayLogs || [],
    kpis: {
      successRate: normalizeSuccessRate(replay.replayKpis?.successRate ?? 0),
      avgLatencyMs: Number(replay.replayKpis?.avgLatencyMs ?? 0),
      confidenceScore: Number(replay.replayKpis?.confidenceScore ?? 0),
    },
  };
}

export function isDeterministic(diff: BehaviorDiff) {
  const noBehaviorDelta =
    diff.changed.length === 0 &&
    diff.added.length === 0 &&
    diff.removed.length === 0;
  const kpiStable =
    diff.summary.successRateDeltaPct === 0 &&
    diff.summary.confidenceDelta === 0 &&
    diff.summary.latencyDeltaMs === 0;
  return noBehaviorDelta && kpiStable;
}

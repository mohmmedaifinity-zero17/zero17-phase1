"use client";

import { useMemo, useState } from "react";
import {
  getAgentRunsFromLedger,
  diffRuns,
  getReplayForOriginalRun,
  buildRunFromReplay,
} from "@/lib/builder/agentInsights";
import AgentBehaviorDiff from "@/app/builder/components/AgentBehaviorDiff";
import AgentKpiTimelineChart from "@/app/builder/components/AgentKpiTimelineChart";
import AgentReplayIntegrityPanel from "@/app/builder/components/AgentReplayIntegrityPanel";

export default function AgentInsightsPanel({ ledger }: { ledger?: any[] }) {
  const runs = useMemo(() => getAgentRunsFromLedger(ledger), [ledger]);

  const defaultFrom = runs.length >= 2 ? runs[runs.length - 2].runId : "";
  const defaultTo = runs.length >= 1 ? runs[runs.length - 1].runId : "";

  const [fromId, setFromId] = useState(defaultFrom);
  const [toId, setToId] = useState(defaultTo);

  const fromRun = useMemo(
    () => runs.find((r) => r.runId === fromId) || null,
    [runs, fromId]
  );
  const toRun = useMemo(
    () => runs.find((r) => r.runId === toId) || null,
    [runs, toId]
  );

  const baseDiff = useMemo(() => {
    if (!fromRun || !toRun) return null;
    return diffRuns(fromRun, toRun);
  }, [fromRun, toRun]);

  // Replay integrity: if there is a replay event for the selected "to run", compare original vs replay
  const replayPayload = useMemo(() => {
    if (!toRun) return null;
    return getReplayForOriginalRun(ledger || [], toRun.runId);
  }, [ledger, toRun]);

  const replayDiff = useMemo(() => {
    if (!toRun || !replayPayload) return null;
    const replayRun = buildRunFromReplay(toRun, replayPayload);
    return diffRuns(toRun, replayRun);
  }, [toRun, replayPayload]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-900">Agent insights</p>
          <p className="mt-1 text-[11px] text-slate-600">
            Compare shadow runs, track KPI drift, and verify replay determinism.
          </p>
        </div>
        <div className="text-right text-[11px] text-slate-600">
          Runs found:{" "}
          <span className="font-semibold text-slate-900">{runs.length}</span>
        </div>
      </div>

      {runs.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600">
          No shadow runs yet. Run Shadow Mode once to populate insights.
        </div>
      ) : (
        <>
          {/* selectors */}
          <div className="grid gap-2 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[11px] font-semibold text-slate-900">
                From run
              </p>
              <select
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px]"
                value={fromId}
                onChange={(e) => setFromId(e.target.value)}
              >
                {runs.map((r) => (
                  <option key={r.runId} value={r.runId}>
                    {r.runId} • {new Date(r.createdAt).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[11px] font-semibold text-slate-900">To run</p>
              <select
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px]"
                value={toId}
                onChange={(e) => setToId(e.target.value)}
              >
                {runs.map((r) => (
                  <option key={r.runId} value={r.runId}>
                    {r.runId} • {new Date(r.createdAt).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* base diff */}
          {baseDiff && <AgentBehaviorDiff diff={baseDiff} />}

          {/* replay integrity */}
          {replayDiff ? (
            <AgentReplayIntegrityPanel diff={replayDiff} />
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600">
              No replay record found for selected “To run”. Use “Replay Last
              Run” once to generate replay evidence.
            </div>
          )}

          {/* chart */}
          <AgentKpiTimelineChart runs={runs} />
        </>
      )}
    </div>
  );
}

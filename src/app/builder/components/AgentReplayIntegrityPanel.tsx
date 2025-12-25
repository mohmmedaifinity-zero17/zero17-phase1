"use client";

import AgentBehaviorDiff from "@/app/builder/components/AgentBehaviorDiff";
import type { BehaviorDiff } from "@/lib/builder/agentInsights";
import { isDeterministic } from "@/lib/builder/agentInsights";

export default function AgentReplayIntegrityPanel({
  diff,
}: {
  diff: BehaviorDiff;
}) {
  const ok = isDeterministic(diff);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-900">
            Replay integrity
          </p>
          <p className="mt-1 text-[11px] text-slate-600">
            Compares original run vs deterministic replay.
          </p>
        </div>

        <span
          className={
            ok
              ? "rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800"
              : "rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-800"
          }
        >
          {ok ? "DETERMINISM: PASS" : "DETERMINISM: FAIL"}
        </span>
      </div>

      <div className="mt-3">
        <AgentBehaviorDiff diff={diff} />
      </div>

      {!ok && (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-900">
          Replay produced a different outcome. This indicates non-determinism
          (seed/tasks mismatch or logic drift).
        </div>
      )}
    </div>
  );
}

"use client";

export default function AgentLedgerPanel({ ledger }: { ledger?: any[] }) {
  if (!ledger || ledger.length === 0) {
    return (
      <div className="rounded-xl border bg-slate-50 p-3 text-xs text-slate-600">
        No agent activity recorded yet.
      </div>
    );
  }

  const agentEvents = ledger.filter(
    (e) =>
      e.type === "agent_shadow_run" ||
      e.type === "agent_promoted" ||
      e.type === "agent_rollback"
  );

  if (agentEvents.length === 0) {
    return (
      <div className="rounded-xl border bg-slate-50 p-3 text-xs text-slate-600">
        No agent lifecycle events yet.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 space-y-3">
      <p className="text-xs font-semibold text-slate-900">Agent Ledger</p>

      <div className="space-y-2">
        {agentEvents.map((e, idx) => (
          <div
            key={idx}
            className="rounded-lg border bg-slate-50 p-2 text-[11px]"
          >
            <div className="flex justify-between">
              <span className="font-semibold text-slate-800">
                {e.type.replaceAll("_", " ").toUpperCase()}
              </span>
              <span className="text-slate-500">
                {new Date(e.createdAt).toLocaleString()}
              </span>
            </div>

            <pre className="mt-1 max-h-32 overflow-auto rounded bg-white p-2 text-[10px]">
              {JSON.stringify(e.payload, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}

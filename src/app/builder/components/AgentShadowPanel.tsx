"use client";

import { useMemo, useState } from "react";

export default function AgentShadowPanel({
  projectId,
  agentId,
  agentName,
  frozen,
  freezeReason,
}: {
  projectId: string;
  agentId: string;
  agentName: string;
  frozen?: boolean;
  freezeReason?: string;
}) {
  const [tasks, setTasks] = useState("");
  const [result, setResult] = useState<any>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const taskList = useMemo(
    () =>
      tasks
        .split("\n")
        .map((t) => t.trim())
        .filter(Boolean),
    [tasks]
  );

  async function runShadow() {
    setMsg(null);
    const res = await fetch("/api/builder/agents/shadow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        agentId,
        agentName,
        tasks: taskList,
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(json?.error || "Shadow run failed");
      return;
    }
    setResult(json.result);
  }

  async function replayRun() {
    setMsg(null);
    if (!result?.runId) {
      setMsg("No run to replay yet.");
      return;
    }
    const res = await fetch("/api/builder/agents/replay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, runId: result.runId }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(json?.error || "Replay failed");
      return;
    }
    setMsg("Replay completed. Check Agent Insights → Replay integrity.");
  }

  async function requestPromotion() {
    setMsg(null);

    // ✅ UI freeze guard
    if (frozen) {
      setMsg(
        freezeReason || "Project is frozen. Promotion actions are blocked."
      );
      return;
    }

    const res = await fetch("/api/builder/agents/promote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, agentId }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(json?.error || "Promotion request failed");
      return;
    }
    if (!json.ok) {
      setMsg(json.reason || "Promotion blocked");
      return;
    }
    setMsg("Promotion requested. Waiting for human approval.");
  }

  return (
    <div className="rounded-xl border bg-white p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-900">
            Agent Shadow Mode
          </p>
          <p className="mt-1 text-[11px] text-slate-600">
            Deterministic runs + replay evidence + approvals.
          </p>
        </div>
        <div className="text-right text-[11px] text-slate-600">{agentName}</div>
      </div>

      {frozen && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-900">
          <span className="font-semibold">Freeze mode is ON.</span> Promotion
          actions are blocked.
          {freezeReason ? (
            <div className="mt-1 opacity-90">{freezeReason}</div>
          ) : null}
        </div>
      )}

      <textarea
        rows={5}
        className="w-full rounded border px-2 py-1 text-xs"
        placeholder="Enter tasks (one per line)"
        value={tasks}
        onChange={(e) => setTasks(e.target.value)}
      />

      <div className="flex flex-wrap gap-2">
        <button
          onClick={runShadow}
          className="rounded bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
        >
          Run Shadow
        </button>

        <button
          onClick={replayRun}
          className="rounded bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white"
        >
          Replay Last Run
        </button>

        <button
          onClick={requestPromotion}
          disabled={!!frozen}
          className={[
            "rounded px-3 py-1.5 text-xs font-semibold text-white",
            frozen ? "bg-slate-400" : "bg-emerald-600 hover:bg-emerald-500",
          ].join(" ")}
        >
          Request Promotion (Human Sign-off)
        </button>
      </div>

      {result && (
        <pre className="rounded bg-slate-50 p-2 text-[11px] max-h-64 overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}

      {msg && <div className="text-[11px] text-slate-700">{msg}</div>}
    </div>
  );
}

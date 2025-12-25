// src/components/agents/AssignToAgent.tsx
"use client";

import { useEffect, useState } from "react";
import { Users2, CheckCircle2 } from "lucide-react";

type Agent = {
  id: string;
  name: string;
  role: string;
};

type Props = {
  source: string; // e.g. "growth.offer", "growth.social"
  summary: string; // short human description of the task
  defaultAgentId?: string;
};

export function AssignToAgent({ source, summary, defaultAgentId }: Props) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(
    defaultAgentId ?? null
  );
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    async function loadAgents() {
      const res = await fetch("/api/agents/list");
      const json = await res.json();
      setAgents(json.agents || []);
      if (!defaultAgentId && json.agents?.length) {
        setSelectedId(json.agents[0].id);
      }
    }
    loadAgents();
  }, [defaultAgentId]);

  async function assign() {
    if (!selectedId) return;
    setLoading(true);
    setDone(false);
    try {
      await fetch("/api/agents/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: selectedId,
          source,
          summary,
        }),
      });
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mt-2">
      <div className="flex items-center gap-1 text-[11px] text-slate-500">
        <Users2 className="w-3 h-3" />
        <span>Assign to agent:</span>
      </div>
      <select
        className="border rounded-xl px-2 py-1 text-[11px]"
        value={selectedId ?? ""}
        onChange={(e) => setSelectedId(e.target.value)}
      >
        {agents.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>
      <button
        onClick={assign}
        disabled={loading || !selectedId}
        className="px-3 py-1 rounded-xl border text-[11px] hover:bg-black hover:text-white transition disabled:opacity-50"
      >
        {loading ? "Assigning…" : "Assign task"}
      </button>
      {done && (
        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600">
          <CheckCircle2 className="w-3 h-3" />
          Assigned
        </span>
      )}
    </div>
  );
}



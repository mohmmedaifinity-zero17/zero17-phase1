// src/app/agents/growth/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Users2, ClipboardList } from "lucide-react";

type Agent = {
  id: string;
  name: string;
  role: string;
};

type Task = {
  id: string;
  agentId: string;
  source: string;
  summary: string;
  status: "open" | "in-progress" | "done";
  createdAt: number;
};

export default function GrowthAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    setLoading(true);
    const [aRes, tRes] = await Promise.all([
      fetch("/api/agents/list"),
      fetch("/api/agents/tasks"),
    ]);
    const aJson = await aRes.json();
    const tJson = await tRes.json();
    setAgents(aJson.agents || []);
    setTasks(tJson.tasks || []);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  function agentForTask(id: string) {
    return agents.find((a) => a.id === id);
  }

  return (
    <div className="min-h-[calc(100vh-56px)]">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <header className="space-y-1">
          <div className="text-xs uppercase text-slate-500">
            Agents • Growth squad
          </div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users2 className="w-5 h-5" />
            Growth Agent Employees
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            See the virtual growth team working on your product and the tasks
            assigned from Growth OS modules.
          </p>
        </header>

        <section className="grid md:grid-cols-2 gap-5">
          {/* Agents list */}
          <div className="z17-card p-5 bg-white/85 space-y-3">
            <div className="flex items-center gap-2">
              <Users2 className="w-4 h-4" />
              <div className="text-sm font-semibold">Growth squad</div>
            </div>
            {loading ? (
              <div className="text-xs text-slate-500">Loading…</div>
            ) : (
              <div className="space-y-2 text-xs">
                {agents.map((a) => (
                  <div
                    key={a.id}
                    className="rounded-xl border p-3 bg-white flex flex-col gap-1"
                  >
                    <div className="text-sm font-semibold">{a.name}</div>
                    <div className="text-[11px] text-slate-500">
                      Role: {a.role}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tasks list */}
          <div className="z17-card p-5 bg-white/85 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4" />
                <div className="text-sm font-semibold">Assigned tasks</div>
              </div>
              <button
                onClick={loadAll}
                className="px-3 py-1.5 rounded-xl border text-[11px] hover:bg-black hover:text-white transition"
              >
                Refresh
              </button>
            </div>
            {loading ? (
              <div className="text-xs text-slate-500">Loading…</div>
            ) : tasks.length === 0 ? (
              <div className="text-xs text-slate-500">
                No tasks assigned yet. Use the “Assign to Agent” buttons inside
                Growth OS modules.
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                {tasks.map((t) => {
                  const agent = agentForTask(t.agentId);
                  return (
                    <div
                      key={t.id}
                      className="rounded-xl border p-3 bg-white flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold text-sm">{t.summary}</div>
                        <span className="text-[10px] rounded-full border px-2 py-0.5">
                          {t.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Agent: {agent ? agent.name : t.agentId}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Source: {t.source}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(t.createdAt).toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

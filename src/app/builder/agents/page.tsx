"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AgentHeroCard from "@/app/builder/components/AgentHeroCard";
import AgentCard from "@/app/builder/components/AgentCard";

export default function AgentFactoryPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");

  async function refresh() {
    const res = await fetch("/api/builder/agents/list");
    const json = await res.json().catch(() => ({}));
    setRows(json?.rows || []);
  }

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) =>
      `${r.agentName} ${r.projectTitle} ${r.status} ${r.role || ""}`
        .toLowerCase()
        .includes(s)
    );
  }, [rows, q]);

  return (
    <main className="mx-auto max-w-6xl p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            AI Employee Factory
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Draft → Shadow → Production with approvals, replay, and audit
            trails.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/builder/agents/compare"
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900"
          >
            Compare agents
          </Link>
          <Link
            href="/builder"
            className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
          >
            Back to Builder
          </Link>
        </div>
      </div>

      {/* Hero card */}
      <AgentHeroCard />

      <div className="rounded-2xl border border-slate-200 bg-white p-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search agents / projects / status…"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((row, idx) => (
          <AgentCard key={idx} row={row} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          No agents found yet. Create a project and run Shadow Mode once.
        </div>
      )}
    </main>
  );
}

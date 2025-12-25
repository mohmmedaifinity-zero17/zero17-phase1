"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

export default function AgentComparePage() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/builder/agents/compare");
      const json = await res.json().catch(() => ({}));
      setRows(json?.rows || []);
    })();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) =>
      `${r.agentName} ${r.projectTitle} ${r.status}`.toLowerCase().includes(s)
    );
  }, [rows, q]);

  return (
    <main className="mx-auto max-w-6xl p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            Agent comparison
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Compare agents across projects using latest shadow KPIs.
          </p>
        </div>
        <Link
          href="/builder/agents"
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900"
        >
          Back to Agent Factory
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search agent / project / status…"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400"
        />
      </div>

      <div className="overflow-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-[980px] w-full text-left text-[12px]">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2">Project</th>
              <th className="px-3 py-2">Agent</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Success</th>
              <th className="px-3 py-2">Confidence</th>
              <th className="px-3 py-2">Latency</th>
              <th className="px-3 py-2">Last run</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, idx) => (
              <tr key={idx} className="border-t">
                <td className="px-3 py-2">
                  <div className="font-semibold text-slate-900">
                    {r.projectTitle}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {r.projectId}
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="font-semibold text-slate-900">
                    {r.agentName}
                  </div>
                  <div className="text-[11px] text-slate-500">{r.agentId}</div>
                </td>
                <td className="px-3 py-2">{r.status}</td>
                <td className="px-3 py-2">
                  {r.successRate == null
                    ? "—"
                    : `${Math.round(r.successRate * 100)}%`}
                </td>
                <td className="px-3 py-2">{r.confidenceScore ?? "—"}</td>
                <td className="px-3 py-2">
                  {r.avgLatencyMs ?? "—"}
                  {r.avgLatencyMs ? "ms" : ""}
                </td>
                <td className="px-3 py-2">
                  {r.lastRunAt ? new Date(r.lastRunAt).toLocaleString() : "—"}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-slate-600" colSpan={7}>
                  No agents found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

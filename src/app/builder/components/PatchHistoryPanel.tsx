"use client";

import { useState } from "react";
import type { BuilderProject } from "@/lib/builder/types";

export default function PatchHistoryPanel({
  project,
}: {
  project: BuilderProject | null;
}) {
  const [msg, setMsg] = useState<string | null>(null);

  if (!project?.patches || project.patches.length === 0) {
    return (
      <div className="mt-4 rounded-xl border bg-slate-50 p-3 text-xs">
        No patch history yet.
      </div>
    );
  }

  async function rollback(patchId: string) {
    if (!project) return;

    try {
      const res = await fetch(`/api/builder/projects/${project.id}/patches`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patchId }),
      });

      if (!res.ok) throw new Error("Rollback failed");
      setMsg("Rollback successful. Refresh project.");
    } catch {
      setMsg("Rollback failed.");
    }
  }

  return (
    <div className="mt-4 rounded-xl border bg-white p-3">
      <p className="text-xs font-semibold">Patch History</p>

      <div className="mt-2 space-y-2">
        {project.patches.map((p: any) => (
          <div key={p.id} className="rounded border bg-slate-50 p-2 text-xs">
            <div className="flex justify-between">
              <span>{p.description}</span>
              <button
                onClick={() => rollback(p.id)}
                className="text-rose-600 hover:underline"
              >
                Rollback
              </button>
            </div>
            <div className="text-[10px] text-slate-500">
              {new Date(p.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {msg && <div className="mt-2 text-[11px] text-slate-700">{msg}</div>}
    </div>
  );
}

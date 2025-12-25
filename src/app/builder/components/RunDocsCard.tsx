"use client";

import { useState } from "react";
import type { BuilderProject } from "@/lib/builder/types";

export default function RunDocsCard({
  project,
  onProjectUpdated,
}: {
  project: BuilderProject | null;
  onProjectUpdated?: (p: BuilderProject) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    if (!project) return;
    setLoading(true);
    setErr(null);

    try {
      const res = await fetch("/api/builder/docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to generate docs");

      if (json?.project) onProjectUpdated?.(json.project as BuilderProject);
    } catch (e: any) {
      setErr(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const hasDocs = !!(project as any)?.docs_pack_json;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-800">
            9. Docs & Client Pack
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Generates delivery docs: overview, architecture, API contracts, QA
            plan, deploy checklist, client pack, and blueprint JSON.
          </p>
        </div>

        <button
          onClick={run}
          disabled={!project || loading}
          className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:bg-slate-300"
        >
          {loading ? "Generating..." : hasDocs ? "Regenerate" : "Generate pack"}
        </button>
      </div>

      {err && (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {err}
        </div>
      )}

      {hasDocs && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
          Docs pack is saved in{" "}
          <span className="font-mono">docs_pack_json</span>.
        </div>
      )}
    </div>
  );
}

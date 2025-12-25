"use client";

import { useState } from "react";
import type { BuilderProject } from "@/lib/builder/types";

export default function RunScanCard({
  project,
  onProjectUpdated,
}: {
  project: BuilderProject | null;
  onProjectUpdated?: (p: BuilderProject) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runScan() {
    if (!project) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/builder/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      if (json.project) onProjectUpdated?.(json.project);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-800">
            7. Smart quality scan
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Global UX, data, security, reliability, and performance scan.
          </p>
        </div>

        <button
          onClick={runScan}
          disabled={!project || loading}
          className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:bg-slate-300"
        >
          {loading ? "Scanning..." : "Run scan"}
        </button>
      </div>

      {error && (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {project?.scan_report_json && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
          <p>
            <b>Score:</b> {project.scan_report_json.score}/100
          </p>
          <p className="mt-1 text-slate-500">
            Issues detected: {project.scan_report_json.issues.length}
          </p>
        </div>
      )}
    </div>
  );
}

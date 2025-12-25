"use client";

import { useState } from "react";
import type { BuilderProject } from "@/lib/builder/types";

export default function Phase9Docs({
  activeProject,
  setProjectsAction,
}: {
  activeProject: BuilderProject | null;
  setProjectsAction: React.Dispatch<React.SetStateAction<BuilderProject[]>>;
}) {
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function generateDocsPack() {
    if (!activeProject) return;
    setLoadingDocs(true);
    setErr(null);

    try {
      // ✅ FIX: correct endpoint
      const res = await fetch("/api/builder/docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: activeProject.id }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Docs pack failed");

      if (!json?.project)
        throw new Error("Docs API did not return { project }");

      const p = json.project as BuilderProject;
      setProjectsAction((prev) => prev.map((x) => (x.id === p.id ? p : x)));
    } catch (e: any) {
      setErr(e?.message || "Something went wrong");
    } finally {
      setLoadingDocs(false);
    }
  }

  async function exportDocsToRepo() {
    if (!activeProject) return;
    setLoadingExport(true);
    setErr(null);

    try {
      const res = await fetch("/api/builder/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: activeProject.id }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Export failed");

      if (json?.project) {
        const p = json.project as BuilderProject;
        setProjectsAction((prev) => prev.map((x) => (x.id === p.id ? p : x)));
      }
    } catch (e: any) {
      setErr(e?.message || "Something went wrong");
    } finally {
      setLoadingExport(false);
    }
  }

  const docs: any = (activeProject as any)?.docs_pack_json ?? null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-900">
            9. Docs & Client Pack
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Generates README, runbook, architecture notes, and client delivery
            pack. Stored in <span className="font-mono">docs_pack_json</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={generateDocsPack}
            disabled={!activeProject || loadingDocs}
            className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:bg-slate-300"
          >
            {loadingDocs
              ? "Generating..."
              : docs
                ? "Re-generate docs"
                : "Generate docs pack"}
          </button>

          <button
            onClick={exportDocsToRepo}
            disabled={!activeProject || loadingExport}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-slate-50 disabled:bg-slate-100"
          >
            {loadingExport ? "Exporting..." : "Export docs"}
          </button>
        </div>
      </div>

      {err && (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {err}
        </div>
      )}

      {docs && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold text-slate-800">Pack summary</p>
          <p className="mt-1 text-xs text-slate-700">{docs?.summary ?? "—"}</p>

          <div className="mt-3 grid gap-2 md:grid-cols-2">
            <SmallCard title="README" body={docs?.readme ?? "—"} />
            <SmallCard title="Runbook" body={docs?.runbook ?? "—"} />
            <SmallCard
              title="Architecture notes"
              body={docs?.architectureNotes ?? "—"}
            />
            <SmallCard title="Client pack" body={docs?.clientPack ?? "—"} />
          </div>
        </div>
      )}
    </div>
  );
}

function SmallCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-[11px] font-semibold text-slate-800">{title}</p>
      <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap text-[11px] text-slate-700">
        {body}
      </pre>
    </div>
  );
}

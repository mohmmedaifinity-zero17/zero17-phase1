// src/components/builder/ProofPackCard.tsx
"use client";

import React from "react";

type ProofPack = {
  meta: {
    id: string;
    projectName: string;
    variant: "speed" | "strategic";
    generatedAt: string;
    version: string;
  };
  factory: {
    readiness: number;
    appliedFixes: string[];
    checks: {
      perf: number;
      a11y: number;
      security: number;
      codeQuality: number;
      issues?: string[];
    };
  };
  summary: {
    readiness: number;
    strengths: string[];
    risks: string[];
  };
  checklist: string[];
  hash: string;
};

export default function ProofPackCard({ pack }: { pack: ProofPack | null }) {
  if (!pack) return null;

  const { meta, summary, checklist, hash, factory } = pack;

  function downloadJSON() {
    const blob = new Blob([JSON.stringify(pack, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${meta.projectName}-proof-pack.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="z17-card p-5 space-y-3 mt-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase text-slate-500">
            Proof-of-Work Pack
          </div>
          <div className="text-sm font-semibold">
            {meta.projectName} • {meta.variant} variant
          </div>
          <div className="text-[11px] text-slate-500">
            Generated at {new Date(meta.generatedAt).toLocaleString()} •{" "}
            {meta.version}
          </div>
        </div>
        <button
          onClick={downloadJSON}
          className="px-3 py-2 rounded-xl border border-slate-900 bg-white text-xs font-medium hover:bg-slate-900 hover:text-white transition"
        >
          Download JSON
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-3 text-sm">
        <ScoreBox title="Readiness" value={summary.readiness} />
        <ScoreBox title="Performance" value={factory.checks.perf} />
        <ScoreBox title="Accessibility" value={factory.checks.a11y} />
        <ScoreBox title="Security" value={factory.checks.security} />
      </div>

      <div className="grid md:grid-cols-2 gap-3 text-sm">
        <Panel title="Strengths" items={summary.strengths} />
        <Panel title="Risks" items={summary.risks} tone="warn" />
      </div>

      <div className="grid md:grid-cols-2 gap-3 text-sm">
        <Panel title="Suggested next steps" items={checklist} />
        <div className="rounded-xl border border-dashed p-3 bg-white/70">
          <div className="text-xs uppercase text-slate-500 mb-1">
            Truth hash (for ledger)
          </div>
          <div className="text-[10px] font-mono break-all text-slate-600">
            {hash}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreBox({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-xl border p-3 text-center bg-white/80">
      <div className="text-[11px] uppercase text-slate-500">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function Panel({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone?: "warn";
}) {
  const cls = tone
    ? "bg-amber-50 border-amber-200"
    : "bg-white border-slate-200";
  return (
    <div className={`rounded-xl border p-3 ${cls}`}>
      <div className="text-[11px] uppercase text-slate-500 mb-1">{title}</div>
      {items.length ? (
        <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
          {items.map((x, i) => (
            <li key={`${title}-${i}`}>{x}</li>
          ))}
        </ul>
      ) : (
        <div className="text-xs text-slate-400">No items</div>
      )}
    </div>
  );
}

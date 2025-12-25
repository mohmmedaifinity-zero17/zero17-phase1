"use client";

import { useState } from "react";

type LedgerResult = {
  buildId: string;
  timestamp: string;
  hashes: {
    contract: string;
    dependencies: string;
    preflight: string;
    proofPack: string;
    combined: string;
  };
};

export default function LedgerPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LedgerResult | null>(null);

  async function generateLedger() {
    setLoading(true);
    setResult(null);
    const res = await fetch("/api/launch/ledger", { method: "POST" });
    const json = (await res.json()) as LedgerResult;
    setResult(json);
    setLoading(false);
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <header className="space-y-2">
        <div className="text-xs uppercase text-slate-500">
          Launch Engine • Truth Ledger
        </div>
        <h1 className="text-3xl font-bold">
          Lock your launch into a chain of trust.
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl">
          Generate cryptographic hashes for your build contract, dependency
          tree, preflight, Proof Pack and a combined record — so anyone can
          verify what you launched.
        </p>
      </header>

      <section className="z17-card p-5 space-y-3">
        <button
          onClick={generateLedger}
          disabled={loading}
          className="px-4 py-2 rounded-xl border border-slate-900 bg-slate-900 text-white text-sm font-medium hover:bg-white hover:text-black transition disabled:opacity-50"
        >
          {loading ? "Hashing launch artifacts…" : "Generate ledger hashes"}
        </button>

        {result && (
          <div className="mt-4 space-y-3">
            <div className="text-xs text-slate-500">
              Build ID: <span className="font-mono">{result.buildId}</span> •{" "}
              {new Date(result.timestamp).toLocaleString()}
            </div>

            <HashPanel
              label="Build contract hash"
              value={result.hashes.contract}
            />
            <HashPanel
              label="Dependencies hash"
              value={result.hashes.dependencies}
            />
            <HashPanel label="Preflight hash" value={result.hashes.preflight} />
            <HashPanel
              label="Proof Pack hash"
              value={result.hashes.proofPack}
            />
            <HashPanel
              label="Combined ledger hash"
              value={result.hashes.combined}
              emphasise
            />
          </div>
        )}
      </section>
    </div>
  );
}

function HashPanel({
  label,
  value,
  emphasise,
}: {
  label: string;
  value: string;
  emphasise?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 bg-white/80 ${
        emphasise ? "border-slate-900" : "border-slate-200"
      }`}
    >
      <div className="text-[11px] uppercase text-slate-500 mb-1">{label}</div>
      <div className="text-[11px] font-mono break-all text-slate-700">
        {value}
      </div>
    </div>
  );
}

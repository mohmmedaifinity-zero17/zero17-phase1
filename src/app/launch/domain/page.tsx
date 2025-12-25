"use client";

import { useState } from "react";

type DomainResult = {
  domain: string;
  records: { type: string; name: string; value: string }[];
  suggestedSubdomains: string[];
  securityHeaders: string[];
  latencyPreview: { region: string; ms: number }[];
};

export default function DomainPage() {
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState<DomainResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function runWizard() {
    setLoading(true);
    setResult(null);
    const res = await fetch("/api/launch/domain", {
      method: "POST",
      body: JSON.stringify({ domain }),
    });
    const json = (await res.json()) as DomainResult;
    setResult(json);
    setLoading(false);
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <header className="space-y-2">
        <div className="text-xs uppercase text-slate-500">
          Launch Engine • Domain Wizard
        </div>
        <h1 className="text-3xl font-bold">
          Turn your idea into a global address.
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl">
          Get DNS records, SSL, security hardening hints, subdomain architecture
          and latency preview — so your launch feels global from day one.
        </p>
      </header>

      <section className="z17-card p-5 space-y-3">
        <div className="text-sm font-semibold">Your domain</div>
        <input
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/70"
          placeholder="yourproduct.com"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
        />
        <button
          onClick={runWizard}
          disabled={loading || !domain}
          className="mt-2 px-4 py-2 rounded-xl border border-slate-900 bg-slate-900 text-white text-sm font-medium hover:bg-white hover:text-black transition disabled:opacity-50"
        >
          {loading
            ? "Generating DNS & security plan…"
            : "Generate DNS & security plan"}
        </button>

        {result && (
          <div className="mt-4 space-y-4">
            <Panel
              title="DNS records"
              items={result.records.map(
                (r) => `${r.type}  ${r.name}  →  ${r.value}`
              )}
            />
            <Panel
              title="Suggested subdomains"
              items={result.suggestedSubdomains}
            />
            <Panel
              title="Recommended security headers"
              items={result.securityHeaders}
            />
            <LatencyPanel rows={result.latencyPreview} />
          </div>
        )}
      </section>
    </div>
  );
}

function Panel({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border bg-white p-3">
      <div className="text-[11px] uppercase text-slate-500 mb-1">{title}</div>
      <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
        {items.map((x, i) => (
          <li key={`${title}-${i}`}>{x}</li>
        ))}
      </ul>
    </div>
  );
}

function LatencyPanel({ rows }: { rows: { region: string; ms: number }[] }) {
  return (
    <div className="rounded-xl border bg-white p-3">
      <div className="text-[11px] uppercase text-slate-500 mb-1">
        Latency preview
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
        {rows.map((r) => (
          <div
            key={r.region}
            className="rounded-lg border border-slate-200 px-2 py-1 flex items-center justify-between"
          >
            <span className="font-medium text-slate-700">{r.region}</span>
            <span className="text-slate-500">{r.ms} ms</span>
          </div>
        ))}
      </div>
    </div>
  );
}

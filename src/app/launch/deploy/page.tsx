"use client";

import { useState } from "react";

type DeployResult = {
  targetPlatform: string;
  strategy: string;
  zeroDowntimePlan: string[];
  environmentHints: string[];
  rollout: { phase: string; description: string }[];
};

export default function DeployPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DeployResult | null>(null);

  async function runAdvisor() {
    setLoading(true);
    setResult(null);
    const res = await fetch("/api/launch/deploy", { method: "POST" });
    const json = (await res.json()) as DeployResult;
    setResult(json);
    setLoading(false);
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <header className="space-y-2">
        <div className="text-xs uppercase text-slate-500">
          Launch Engine • Deploy Advisor
        </div>
        <h1 className="text-3xl font-bold">
          Ship safely with an ops brain watching your back.
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl">
          Get a suggested hosting platform, rollout strategy, zero-downtime plan
          and environment hints so your first deploy doesn’t become your first
          incident.
        </p>
      </header>

      <section className="z17-card p-5 space-y-3">
        <button
          onClick={runAdvisor}
          disabled={loading}
          className="px-4 py-2 rounded-xl border border-slate-900 bg-slate-900 text-white text-sm font-medium hover:bg-white hover:text-black transition disabled:opacity-50"
        >
          {loading ? "Simulating deployment…" : "Run deploy advisor"}
        </button>

        {result && (
          <div className="mt-4 space-y-4">
            <div className="grid md:grid-cols-3 gap-3 text-sm">
              <Stat title="Target platform" value={result.targetPlatform} />
              <Stat title="Strategy" value={result.strategy} />
              <Stat
                title="Rollout phases"
                value={`${result.rollout.length} steps`}
              />
            </div>
            <Panel title="Zero downtime plan" items={result.zeroDowntimePlan} />
            <Panel title="Environment hints" items={result.environmentHints} />
            <Panel
              title="Suggested rollout"
              items={result.rollout.map((r) => `${r.phase}: ${r.description}`)}
            />
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border bg-white/80 p-3">
      <div className="text-[11px] uppercase text-slate-500">{title}</div>
      <div className="text-sm font-semibold text-slate-800 mt-1">{value}</div>
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

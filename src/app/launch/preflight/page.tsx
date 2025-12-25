"use client";

import { useState } from "react";

type RadarResult = {
  overallScore: number;
  goNoGo: "GO" | "TUNE" | "WAIT";
  marketFit: { score: number; notes: string[] };
  failurePatterns: { risks: string[]; confidence: number };
  legalRisk: { level: "low" | "medium" | "high"; notes: string[] };
  techStability: { score: number; hotspots: string[] };
  businessViability: { score: number; notes: string[] };
};

export default function PreflightPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RadarResult | null>(null);

  async function runRadar() {
    setLoading(true);
    setResult(null);
    const res = await fetch("/api/launch/preflight", {
      method: "POST",
    });
    const json = (await res.json()) as RadarResult;
    setResult(json);
    setLoading(false);
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <header className="space-y-2">
        <div className="text-xs uppercase text-slate-500">
          Launch Engine • Founder Radar
        </div>
        <h1 className="text-3xl font-bold">
          Preflight: see the invisible risks before launch.
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl">
          Market fit, failure patterns, legal risks, technical bottlenecks and
          business viability — scored and summarised so you can launch with eyes
          open.
        </p>
      </header>

      <section className="z17-card p-5 space-y-3">
        <button
          onClick={runRadar}
          disabled={loading}
          className="px-4 py-2 rounded-xl border border-slate-900 bg-slate-900 text-white text-sm font-medium hover:bg-white hover:text-black transition disabled:opacity-50"
        >
          {loading ? "Running founder radar…" : "Run founder radar"}
        </button>

        {result && (
          <div className="mt-4 space-y-4">
            <div className="grid md:grid-cols-4 gap-3 text-sm">
              <ScoreBox title="Overall" value={result.overallScore} />
              <ScoreBox title="Market fit" value={result.marketFit.score} />
              <ScoreBox
                title="Tech stability"
                value={result.techStability.score}
              />
              <ScoreBox
                title="Viability"
                value={result.businessViability.score}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <Panel title="Market fit notes" items={result.marketFit.notes} />
              <Panel
                title="Failure pattern risks"
                items={result.failurePatterns.risks}
                tone="warn"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <Panel
                title={`Legal risk (${result.legalRisk.level})`}
                items={result.legalRisk.notes}
                tone={result.legalRisk.level === "high" ? "warn" : undefined}
              />
              <Panel
                title="Technical hotspots"
                items={result.techStability.hotspots}
              />
            </div>

            <Panel
              title={
                result.goNoGo === "GO"
                  ? "Recommendation: GO"
                  : result.goNoGo === "TUNE"
                    ? "Recommendation: Tune & test"
                    : "Recommendation: Wait & rethink"
              }
              items={result.businessViability.notes}
            />
          </div>
        )}
      </section>
    </div>
  );
}

function ScoreBox({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-xl border bg-white/80 p-3 text-center">
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
        <div className="text-xs text-slate-400">No items.</div>
      )}
    </div>
  );
}

// src/app/research/whatif/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useResearch } from "@/components/research/ResearchContext";

type WhatIfScenario = {
  label: string;
  impact: string;
};

type WhatIfResponse = {
  ok: boolean;
  scenarios?: WhatIfScenario[];
  recommendation?: string;
};

export default function WhatIfPage() {
  const { idea, icp, stage } = useResearch();
  const [prompt, setPrompt] = useState(
    "What if I change my ICP to agency owners?"
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WhatIfResponse | null>(null);

  async function runWhatIf() {
    if (!idea.trim()) return;
    try {
      setLoading(true);
      setResult(null);
      const res = await fetch("/api/z17/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "whatif",
          idea,
          icp,
          stage,
          prompt,
        }),
      });
      const json = (await res.json()) as WhatIfResponse;
      setResult(json || null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)]">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/research"
            className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-black"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Research Lab
          </Link>
        </div>

        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-500" />
            <h1 className="text-xl font-semibold">What-if mode</h1>
          </div>
          <p className="text-[11px] text-slate-600 max-w-3xl">
            Explore alternate universes without rewriting the whole plan.
            Specify a &quot;what if&quot; and see how it could affect ICP,
            product shape and growth model.
          </p>
        </section>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Input */}
          <div className="z17-card bg-white/90 p-4 space-y-3">
            <div className="space-y-1 text-[11px]">
              <label className="font-semibold text-slate-700">What if...</label>
              <textarea
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-teal-100"
                placeholder="Example: What if I only target agency owners and price at 10x current plans?"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            <button
              type="button"
              disabled={loading || !idea.trim()}
              onClick={runWhatIf}
              className="inline-flex items-center gap-1 rounded-full bg-teal-500 text-white px-4 py-1.5 text-[11px] font-semibold hover:bg-teal-600 disabled:opacity-60"
            >
              {loading ? "Exploring..." : "Run What-if"}
            </button>
          </div>

          {/* Output */}
          <div className="z17-card bg-slate-950 text-white p-4 space-y-3">
            {!result && (
              <p className="text-[11px] text-slate-100">
                You&apos;ll see 1–3 scenarios and a final recommendation here
                once you run What-if.
              </p>
            )}

            {result?.scenarios?.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-cyan-500/40 bg-cyan-950/40 p-3 space-y-1"
              >
                <div className="text-[11px] font-semibold text-cyan-200">
                  {s.label}
                </div>
                <p className="text-[10px] text-slate-50">{s.impact}</p>
              </div>
            ))}

            {result?.recommendation && (
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-emerald-300">
                  Recommendation
                </div>
                <p className="text-[10px] text-slate-50">
                  {result.recommendation}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// src/app/research/investor/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { useResearch } from "@/components/research/ResearchContext";

type InvestorResponse = {
  ok: boolean;
  pitchHeadline?: string;
  narrative?: string;
  slides?: string[];
  nextSteps?: string[];
};

export default function InvestorPage() {
  const { idea, icp, stage } = useResearch();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InvestorResponse | null>(null);

  async function runInvestorPack() {
    if (!idea.trim()) return;
    try {
      setLoading(true);
      setResult(null);
      const res = await fetch("/api/z17/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "investor", idea, icp, stage }),
      });
      const json = (await res.json()) as InvestorResponse;
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
            <FileText className="w-5 h-5 text-slate-900" />
            <h1 className="text-xl font-semibold">Investor pack</h1>
          </div>
          <p className="text-[11px] text-slate-600 max-w-3xl">
            A five-slide story pulled from your research. Use it to clarify your
            own vision, share with investors, or as a north-star narrative for
            your build and growth decisions.
          </p>
        </section>

        <div className="z17-card bg-white/90 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2 text-[11px]">
            <div className="text-slate-600">
              Using idea / ICP / stage plus QIE + Blueprint as context.
            </div>
            <button
              type="button"
              disabled={loading || !idea.trim()}
              onClick={runInvestorPack}
              className="inline-flex items-center gap-1 rounded-full bg-slate-900 text-white px-3 py-1 text-[11px] font-semibold hover:bg-black disabled:opacity-60"
            >
              {loading ? "Generating..." : "Generate Investor Pack"}
            </button>
          </div>

          {!result && (
            <p className="text-[11px] text-slate-600">
              Once generated, you&apos;ll see a headline, short narrative and
              slide outline. Later you can connect this to auto-generated PDFs
              or slide decks.
            </p>
          )}

          {result?.pitchHeadline && (
            <div className="space-y-1">
              <div className="text-[11px] font-semibold text-slate-800">
                Pitch headline
              </div>
              <p className="text-[10px] text-slate-700">
                {result.pitchHeadline}
              </p>
            </div>
          )}

          {result?.narrative && (
            <div className="space-y-1">
              <div className="text-[11px] font-semibold text-slate-800">
                Narrative
              </div>
              <p className="text-[10px] text-slate-700">{result.narrative}</p>
            </div>
          )}

          {result?.slides && result.slides.length > 0 && (
            <div className="space-y-1">
              <div className="text-[11px] font-semibold text-slate-800">
                Slide outline
              </div>
              <ol className="list-decimal pl-4 text-[10px] text-slate-700 space-y-0.5">
                {result.slides.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </div>
          )}

          {result?.nextSteps && (
            <div className="space-y-1">
              <div className="text-[11px] font-semibold text-emerald-700">
                Suggested next steps
              </div>
              <ul className="list-disc pl-4 text-[10px] text-slate-700 space-y-0.5">
                {result.nextSteps.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

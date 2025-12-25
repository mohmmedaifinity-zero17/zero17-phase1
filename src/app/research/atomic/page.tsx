// src/app/research/atomic/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Orbit } from "lucide-react";
import { useResearch } from "@/components/research/ResearchContext";

type AtomicResponse = {
  ok: boolean;
  blocks?: {
    problemProof?: string;
    userPsychology?: string;
    categoryFrictions?: string;
    unseenOpportunities?: string[];
    riskMap?: string[];
  };
  nextMoves?: string[];
};

export default function AtomicPage() {
  const { idea, icp, stage } = useResearch();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AtomicResponse | null>(null);

  async function runAtomic() {
    if (!idea.trim()) return;
    try {
      setLoading(true);
      setResult(null);

      const res = await fetch("/api/z17/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "atomic", idea, icp, stage }),
      });
      const json = (await res.json()) as AtomicResponse;
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
            <Orbit className="w-5 h-5 text-emerald-500" />
            <h1 className="text-xl font-semibold">Atomic research blocks</h1>
          </div>
          <p className="text-[11px] text-slate-600 max-w-3xl">
            Turn your research into atomic, usable blocks: problem proof, user
            psychology, category frictions, unseen opportunities and risk map —
            all linked to clear next moves.
          </p>
        </section>

        <div className="z17-card bg-white/90 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[11px] text-slate-600">
              Using the same idea / ICP / stage you set in Quantum Idea Engine.
            </div>
            <button
              type="button"
              disabled={loading || !idea.trim()}
              onClick={runAtomic}
              className="inline-flex items-center gap-1 rounded-full bg-emerald-500 text-white px-3 py-1 text-[11px] font-semibold hover:bg-emerald-600 disabled:opacity-60"
            >
              {loading ? "Generating..." : "Generate atomic blocks"}
            </button>
          </div>

          {!result && (
            <p className="text-[11px] text-slate-600">
              Run QIE first to define your idea clearly, then click{" "}
              <span className="font-semibold">Generate atomic blocks</span> to
              see the entire reality broken into pieces.
            </p>
          )}

          {result?.blocks && (
            <div className="grid md:grid-cols-2 gap-4 text-[11px]">
              {result.blocks.problemProof && (
                <Block
                  title="Problem proof"
                  text={result.blocks.problemProof}
                />
              )}
              {result.blocks.userPsychology && (
                <Block
                  title="User psychology"
                  text={result.blocks.userPsychology}
                />
              )}
              {result.blocks.categoryFrictions && (
                <Block
                  title="Category frictions"
                  text={result.blocks.categoryFrictions}
                />
              )}
              {result.blocks.unseenOpportunities && (
                <ListBlock
                  title="Unseen opportunities"
                  items={result.blocks.unseenOpportunities}
                />
              )}
              {result.blocks.riskMap && (
                <ListBlock title="Risk map" items={result.blocks.riskMap} />
              )}
            </div>
          )}

          {result?.nextMoves && (
            <div className="mt-4 space-y-1">
              <div className="text-[11px] font-semibold text-slate-800">
                Suggested next moves
              </div>
              <ul className="list-disc pl-4 text-[10px] text-slate-700 space-y-0.5">
                {result.nextMoves.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Block({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3">
      <div className="text-[11px] font-semibold text-emerald-800 mb-1">
        {title}
      </div>
      <p className="text-[10px] text-emerald-900">{text}</p>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <div className="text-[11px] font-semibold text-slate-800 mb-1">
        {title}
      </div>
      <ul className="list-disc pl-4 text-[10px] text-slate-700 space-y-0.5">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}

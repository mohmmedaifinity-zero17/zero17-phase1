// src/app/research/sim/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, LineChart } from "lucide-react";
import { useResearch } from "@/components/research/ResearchContext";

type SimResponse = {
  ok: boolean;
  demandHeat?: string;
  competitorMoves?: string[];
  growthCurve?: string;
  unitEconomics?: {
    targetCAC?: string;
    payback?: string;
    comments?: string;
  };
};

export default function SimPage() {
  const { idea, icp, stage } = useResearch();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimResponse | null>(null);

  async function runSim() {
    if (!idea.trim()) return;
    try {
      setLoading(true);
      setResult(null);
      const res = await fetch("/api/z17/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "sim", idea, icp, stage }),
      });
      const json = (await res.json()) as SimResponse;
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
            <LineChart className="w-5 h-5 text-rose-500" />
            <h1 className="text-xl font-semibold">Market OS simulations</h1>
          </div>
          <p className="text-[11px] text-slate-600 max-w-3xl">
            See how demand, competition, growth trajectory and unit economics
            might behave for your idea, before you commit months of build time.
          </p>
        </section>

        <div className="z17-card bg-slate-950 text-white p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[11px] text-slate-100">
              Using your current idea / ICP / stage from QIE.
            </div>
            <button
              type="button"
              disabled={loading || !idea.trim()}
              onClick={runSim}
              className="inline-flex items-center gap-1 rounded-full bg-rose-400 text-slate-900 px-3 py-1 text-[11px] font-semibold hover:bg-rose-300 disabled:opacity-60"
            >
              {loading ? "Simulating..." : "Run simulation"}
            </button>
          </div>

          {!result && (
            <p className="text-[11px] text-slate-100">
              You&apos;ll see demand heat, competitor moves, growth curve and
              basic unit economics here once you run the simulation.
            </p>
          )}

          {result?.demandHeat && (
            <Block
              title="Demand heat"
              color="text-rose-300"
              text={result.demandHeat}
            />
          )}

          {result?.competitorMoves && (
            <ListBlock
              title="Competitor moves"
              color="text-orange-300"
              items={result.competitorMoves}
            />
          )}

          {result?.growthCurve && (
            <Block
              title="Growth curve (narrative)"
              color="text-emerald-300"
              text={result.growthCurve}
            />
          )}

          {result?.unitEconomics && (
            <div className="space-y-1">
              <div className="text-[11px] font-semibold text-sky-300">
                Unit economics
              </div>
              <ul className="text-[10px] text-slate-50 space-y-0.5">
                {result.unitEconomics.targetCAC && (
                  <li>
                    <span className="font-semibold">Target CAC: </span>
                    {result.unitEconomics.targetCAC}
                  </li>
                )}
                {result.unitEconomics.payback && (
                  <li>
                    <span className="font-semibold">Payback: </span>
                    {result.unitEconomics.payback}
                  </li>
                )}
                {result.unitEconomics.comments && (
                  <li>{result.unitEconomics.comments}</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Block({
  title,
  color,
  text,
}: {
  title: string;
  color: string;
  text: string;
}) {
  return (
    <div className="space-y-1">
      <div className={`text-[11px] font-semibold ${color}`}>{title}</div>
      <p className="text-[10px] text-slate-50">{text}</p>
    </div>
  );
}

function ListBlock({
  title,
  color,
  items,
}: {
  title: string;
  color: string;
  items: string[];
}) {
  return (
    <div className="space-y-1">
      <div className={`text-[11px] font-semibold ${color}`}>{title}</div>
      <ul className="list-disc pl-4 text-[10px] text-slate-50 space-y-0.5">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}

// src/app/research/boardroom/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { useResearch } from "@/components/research/ResearchContext";

type BoardroomVoice = {
  role: string;
  stance: string;
};

type BoardroomResponse = {
  ok: boolean;
  voices?: BoardroomVoice[];
  summary?: string;
};

export default function BoardroomPage() {
  const { idea, icp, stage } = useResearch();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BoardroomResponse | null>(null);

  async function runBoardroom() {
    if (!idea.trim()) return;
    try {
      setLoading(true);
      setResult(null);
      const res = await fetch("/api/z17/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "boardroom", idea, icp, stage }),
      });
      const json = (await res.json()) as BoardroomResponse;
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
            <Users className="w-5 h-5 text-purple-500" />
            <h1 className="text-xl font-semibold">Boardroom simulation</h1>
          </div>
          <p className="text-[11px] text-slate-600 max-w-3xl">
            A simulated panel of CTO, CPO, VC, growth and brand leads give
            conflicting but useful opinions on your idea, then the system
            synthesizes a brutal conclusion.
          </p>
        </section>

        <div className="z17-card bg-slate-950 text-white p-4 space-y-3">
          <div className="flex items-center justify-between gap-2 text-[11px]">
            <div className="text-slate-100">
              Using your current idea / ICP / stage as context.
            </div>
            <button
              type="button"
              disabled={loading || !idea.trim()}
              onClick={runBoardroom}
              className="inline-flex items-center gap-1 rounded-full bg-purple-400 text-slate-900 px-3 py-1 text-[11px] font-semibold hover:bg-purple-300 disabled:opacity-60"
            >
              {loading ? "Summoning..." : "Summon boardroom"}
            </button>
          </div>

          {!result && (
            <p className="text-[11px] text-slate-100">
              Run this when you want to see how different expert roles would
              react to your current plan.
            </p>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {result?.voices?.map((v) => (
              <div
                key={v.role}
                className="rounded-2xl border border-purple-500/30 bg-purple-950/40 p-3 space-y-1"
              >
                <div className="text-[11px] font-semibold text-purple-200">
                  {v.role}
                </div>
                <p className="text-[10px] text-slate-50">{v.stance}</p>
              </div>
            ))}
          </div>

          {result?.summary && (
            <div className="mt-3 space-y-1">
              <div className="text-[11px] font-semibold text-amber-300">
                Boardroom summary
              </div>
              <p className="text-[10px] text-slate-50">{result.summary}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

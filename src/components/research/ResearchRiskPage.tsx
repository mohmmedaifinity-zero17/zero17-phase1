// src/components/research/ResearchRiskPage.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldAlert, Activity, Calculator } from "lucide-react";
import { loadResearchSnapshot } from "@/components/research/researchSnapshot";

export default function ResearchRiskPage() {
  const [idea, setIdea] = useState("");
  const [risk, setRisk] = useState("");
  const [feasibility, setFeasibility] = useState("");
  const [score, setScore] = useState(0);
  const [loadingRisk, setLoadingRisk] = useState(false);
  const [loadingFeas, setLoadingFeas] = useState(false);

  useEffect(() => {
    const snap = loadResearchSnapshot();
    if (snap?.idea) setIdea(snap.idea);
  }, []);

  const canRun = !!idea.trim();

  async function runRisk() {
    if (!canRun) return;
    setLoadingRisk(true);
    await fakeDelay(800);

    setRisk(
      [
        "Risk map:",
        "",
        "• Compliance/data: handling prompts & logs with potential PII.",
        "• Engineering: over-automation, fragile orchestration, too many external APIs.",
        "• Market: category fatigue around generic 'AI tools'.",
        "• Churn: no visible 'I won' moment within first few sessions.",
      ].join("\n")
    );

    setLoadingRisk(false);
  }

  async function runFeasibility() {
    if (!canRun) return;
    setLoadingFeas(true);
    await fakeDelay(800);

    setFeasibility(
      [
        "Feasibility (opinionated):",
        "",
        "• Stack: Next.js + Supabase + Vercel + ChatGPT + Cursor.",
        "• Solo build: 3–6 weeks for focused v1.",
        "• Infra cost early: AI usage + some storage, manageable.",
      ].join("\n")
    );

    setScore(82);
    setLoadingFeas(false);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-sky-50 via-amber-50 to-rose-50 px-4 pb-10 pt-6">
      <div className="mx-auto max-w-4xl space-y-5">
        {/* Header */}
        <header className="flex items-center justify-between gap-2">
          <Link
            href="/research"
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[10px] text-slate-700 hover:border-sky-300"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Research Lab
          </Link>
          <div className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] text-amber-700">
            <ShieldAlert className="h-3 w-3" />
            Risk & Buildability
          </div>
        </header>

        {/* Idea context */}
        <section className="rounded-3xl border border-amber-100 bg-white/90 px-5 py-4 shadow-sm">
          <p className="mb-2 text-[11px] font-semibold text-slate-900">
            See the hard truths before you over-build.
          </p>
          <p className="text-[10px] text-slate-600">
            This module is your boardroom pessimist and pragmatic CTO in one
            place.
          </p>
          <textarea
            rows={3}
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Your idea (brought from Overview / QIE)."
            className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-[11px] text-slate-900 outline-none focus:border-amber-400"
          />
        </section>

        {/* Risk + Feasibility */}
        <section className="grid gap-3 md:grid-cols-2 text-[10px]">
          {/* Risk engine */}
          <div className="rounded-2xl border border-amber-100 bg-white/95 px-3 py-3 shadow-sm">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                <span className="font-semibold text-slate-900">
                  Risk engine
                </span>
              </div>
              <button
                type="button"
                disabled={!canRun || loadingRisk}
                onClick={runRisk}
                className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[10px] text-amber-700 disabled:opacity-40"
              >
                {loadingRisk ? "Scanning…" : "Run risk map"}
              </button>
            </div>
            {risk ? (
              <pre className="whitespace-pre-wrap text-[10px] text-slate-700">
                {risk}
              </pre>
            ) : (
              <p className="text-[10px] text-slate-500">
                Run the risk engine to see compliance, engineering and market
                risks.
              </p>
            )}
          </div>

          {/* Feasibility + score */}
          <div className="rounded-2xl border border-sky-100 bg-white/95 px-3 py-3 shadow-sm">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-sky-600" />
                <span className="font-semibold text-slate-900">
                  Feasibility & buildability
                </span>
              </div>
              <button
                type="button"
                disabled={!canRun || loadingFeas}
                onClick={runFeasibility}
                className="inline-flex items-center gap-1 rounded-full border border-sky-300 bg-sky-50 px-3 py-1 text-[10px] text-sky-700 disabled:opacity-40"
              >
                <Calculator className="h-3 w-3" />
                {loadingFeas ? "Scoring…" : "Run feasibility"}
              </button>
            </div>
            {feasibility ? (
              <>
                <pre className="mb-2 whitespace-pre-wrap text-[10px] text-slate-700">
                  {feasibility}
                </pre>
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-slate-900">
                    Buildability score
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-700">
                    <span>Overall</span>
                    <span className="font-semibold text-sky-700">
                      {score || 0}/100
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-200">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-emerald-400 via-sky-500 to-indigo-500"
                      style={{ width: `${score || 0}%` }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <p className="text-[10px] text-slate-500">
                Feasibility + buildability give you a sanity check on whether
                this is a solo-friendly, realistic play.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function fakeDelay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

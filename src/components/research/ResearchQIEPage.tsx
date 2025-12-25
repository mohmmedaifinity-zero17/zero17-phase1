// src/components/research/ResearchQIEPage.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Beaker,
  FlaskConical,
  Sparkles,
  Rocket,
} from "lucide-react";
import {
  loadResearchSnapshot,
  saveResearchSnapshot,
} from "@/components/research/researchSnapshot";

export default function ResearchQIEPage() {
  const [idea, setIdea] = useState("");
  const [icp, setIcp] = useState("");
  const [outcome, setOutcome] = useState("");

  const [summary, setSummary] = useState("");
  const [stars, setStars] = useState("");
  const [opps, setOpps] = useState("");
  const [verdict, setVerdict] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const snap = loadResearchSnapshot();
    if (snap) {
      setIdea(snap.idea || "");
      setIcp(snap.icp || "");
      setOutcome(snap.outcome || "");
      setSummary(snap.lastQieSummary || "");
    }
  }, []);

  const canRun = !!idea.trim();

  async function runQIE() {
    if (!canRun) return;
    setLoading(true);
    await fakeDelay(900);

    const baseOutcome = outcome || "a tangible, measurable win";

    const s = [
      "QIE summary:",
      "",
      `• Idea: ${idea.trim().slice(0, 140)}${idea.length > 140 ? "…" : ""}`,
      `• ICP: ${icp || "needs sharpening"}`,
      `• Outcome: ${baseOutcome}`,
      "",
      "The direction is strong if you frame it as a 'Founder Operating System' rather than a generic AI tool.",
    ].join("\n");

    const o = [
      "Opportunity map:",
      "",
      "• Short-term: solo founders & tiny teams who need proof-backed MVPs fast.",
      "• Mid-term: agencies and studios that want repeatable build systems.",
      "• Long-term: default OS for building & growing new products.",
    ].join("\n");

    const sf = [
      "Star feature candidates:",
      "",
      "1) Quantum Idea Engine — this module.",
      "2) Truth Ledger — every build & test is notarised.",
      "3) Growth Oracle — future-looking growth strategy.",
      "4) Agent Employees — plug-and-play expert roles.",
    ].join("\n");

    const verdictText =
      idea.length > 150 && icp.trim() && outcome.trim()
        ? "High-potential concept — worth building with a sharp MVP scope."
        : "Promising but incomplete — sharpen ICP & outcome before heavy build.";

    setSummary(s);
    setOpps(o);
    setStars(sf);
    setVerdict(verdictText);
    setLoading(false);

    saveResearchSnapshot({
      idea,
      icp,
      outcome,
      mustHaves: "",
      tone: "Practical",
      marketType: "SMB",
      stage: "QIE",
      blueprintHeadline: blueprintHeadlineFromIdea(idea, outcome),
      lastQieSummary: s,
    });
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-sky-50 via-amber-50 to-rose-50 px-4 pb-10 pt-6">
      <div className="mx-auto max-w-4xl space-y-5">
        <header className="flex items-center justify-between gap-2">
          <Link
            href="/research"
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[10px] text-slate-700 hover:border-sky-300"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Research Lab
          </Link>
          <div className="flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] text-sky-700">
            <Beaker className="h-3 w-3" />
            Quantum Idea Engine
          </div>
        </header>

        <section className="rounded-3xl border border-sky-100 bg-white/90 px-5 py-4 shadow-sm">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div className="space-y-1 max-w-xl">
              <h1 className="text-lg font-semibold text-slate-900 md:text-xl">
                Deep-scan your idea before you write a single line of code.
              </h1>
              <p className="text-[11px] text-slate-600">
                QIE looks at opportunity, star features and narrative like a
                panel of top founders, PMs and VCs — then compresses it into a
                single verdict.
              </p>
            </div>
            <button
              type="button"
              disabled={!canRun || loading}
              onClick={runQIE}
              className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-4 py-1.5 text-[11px] font-semibold text-white shadow-md disabled:opacity-40"
            >
              <FlaskConical className="h-4 w-4" />
              {loading ? "Running QIE…" : "Run QIE analysis"}
            </button>
          </div>

          <div className="mt-4 space-y-2 text-[10px]">
            <p className="text-[10px] font-medium text-slate-800">
              Inputs (you can tweak them here – they will sync back to Research
              Overview):
            </p>
            <textarea
              rows={3}
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Your idea..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-[11px] text-slate-900 outline-none focus:border-sky-500"
            />
            <div className="grid gap-2 md:grid-cols-2">
              <input
                value={icp}
                onChange={(e) => setIcp(e.target.value)}
                placeholder="ICP"
                className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] outline-none focus:border-sky-500"
              />
              <input
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                placeholder="Outcome"
                className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="grid gap-3 md:grid-cols-3 text-[10px]">
          <ResultCard title="Summary" content={summary} />
          <ResultCard title="Opportunity map" content={opps} />
          <ResultCard title="Star features" content={stars} />
        </section>

        <section className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-white/90 px-4 py-3 text-[10px] shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2 py-0.5 text-[9px] font-medium text-white">
              <Sparkles className="h-3 w-3" />
              Verdict
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/research/risk"
                className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-amber-700"
              >
                <Rocket className="h-3 w-3" />
                Next: Risk & Buildability
              </Link>
            </div>
          </div>
          <p className="text-[10px] text-slate-700">
            {verdict ||
              "Run QIE to get a realistic verdict on whether this is worth building now, later, or never."}
          </p>
        </section>
      </div>
    </div>
  );
}

function ResultCard({ title, content }: { title: string; content: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white/90 px-3 py-3 shadow-sm">
      <p className="mb-1 text-[10px] font-semibold text-slate-900">{title}</p>
      {content ? (
        <pre className="whitespace-pre-wrap text-[10px] text-slate-700">
          {content}
        </pre>
      ) : (
        <p className="text-[10px] text-slate-500">
          Will populate after you run QIE.
        </p>
      )}
    </div>
  );
}

function blueprintHeadlineFromIdea(idea: string, outcome: string) {
  const base = idea.trim().slice(0, 60) || "Zero17 project";
  const clean = base.replace(/\s+/g, " ").trim();
  if (outcome.trim()) return `${clean} — ${outcome.trim()}`;
  return `${clean} — from idea to proof`;
}

function fakeDelay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

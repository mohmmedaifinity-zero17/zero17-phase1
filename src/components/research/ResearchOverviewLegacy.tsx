// src/components/research/ResearchOverview.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Beaker,
  Sparkles,
  Lightbulb,
  ArrowRight,
  ListChecks,
  Brain,
  RefreshCw,
} from "lucide-react";
import {
  loadResearchSnapshot,
  saveResearchSnapshot,
} from "@/components/research/researchSnapshot";

export default function ResearchOverview() {
  const [idea, setIdea] = useState("");
  const [icp, setIcp] = useState("");
  const [outcome, setOutcome] = useState("");
  const [unpacked, setUnpacked] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const snap = loadResearchSnapshot();
    if (snap) {
      setIdea(snap.idea || "");
      setIcp(snap.icp || "");
      setOutcome(snap.outcome || "");
    }
  }, []);

  const canRun = !!idea.trim();

  async function handleQuickUnpack() {
    if (!canRun) return;
    setStatus(null);
    await fakeDelay(500);

    const text = [
      "Quick unpack:",
      "",
      `• Idea: ${idea.trim().slice(0, 160)}${idea.length > 160 ? "…" : ""}`,
      `• ICP: ${icp || "not yet defined — sharpen this soon."}`,
      `• Outcome: ${outcome || "define one sharp win to anchor the OS."}`,
      "",
      "This will feed Quantum Idea Engine, Risk Engine and Blueprint.",
    ].join("\n");

    setUnpacked(text);

    saveResearchSnapshot({
      idea,
      icp,
      outcome,
      mustHaves: "",
      tone: "Practical",
      marketType: "SMB",
      stage: "Overview",
      blueprintHeadline: blueprintHeadlineFromIdea(idea, outcome),
      lastQieSummary: "",
    });

    setStatus(
      "Saved idea to Research Lab • HELIX & Builder now see this context."
    );
  }

  function handleReset() {
    setIdea("");
    setIcp("");
    setOutcome("");
    setUnpacked("");
    setStatus("Cleared Research Lab context.");
  }

  const chiefHeadline = idea
    ? `Today: sharpen "${blueprintHeadlineFromIdea(idea, outcome)}"`
    : "Today: pick one idea and make it real.";

  const chiefNext = idea
    ? "Run QIE, then Risk + Buildability. Only build once both look solid."
    : "Write down one idea and a clear outcome, then run a Quick Unpack.";

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-sky-50 via-amber-50 to-rose-50 px-4 pb-10 pt-6">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* HERO */}
        <section className="rounded-3xl border border-sky-100 bg-white/80 px-5 py-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] text-sky-700">
                <Beaker className="h-3 w-3" />
                ZERO17 • Research Lab
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">
                Turn raw ideas into{" "}
                <span className="text-sky-700">
                  validated world-class blueprints
                </span>
                .
              </h1>
              <p className="text-[11px] text-slate-600">
                Designed with patterns from top founders, VCs and product chiefs
                — but compressed into one simple flow:{" "}
                <span className="font-medium">
                  Idea → QIE → Risk → Blueprint → Build.
                </span>
              </p>
            </div>
            <div className="flex flex-col items-start gap-2 text-[10px] text-slate-600 md:items-end">
              <Link
                href="/research/qie"
                className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-4 py-1.5 text-[11px] font-semibold text-white shadow-md hover:bg-sky-700"
              >
                <Sparkles className="h-4 w-4" />
                Open Quantum Idea Engine
              </Link>
              <p className="max-w-xs text-right text-[10px] text-slate-500">
                Start in QIE whenever you want a serious answer to: “Is this
                worth building?”
              </p>
            </div>
          </div>
        </section>

        {/* MINI GUIDE */}
        <section className="rounded-2xl border border-slate-100 bg-white/90 px-4 py-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <ListChecks className="h-3.5 w-3.5 text-slate-700" />
              <span className="text-[11px] font-semibold text-slate-900">
                5-step Research Loop
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-700 md:grid-cols-5">
            <GuideChip number="1" label="Describe your idea" />
            <GuideChip number="2" label="Run Quantum Idea Engine" />
            <GuideChip number="3" label="Run Risk + Buildability" />
            <GuideChip number="4" label="Generate Blueprint" />
            <GuideChip number="5" label="Send to Builder & Growth" />
          </div>
        </section>

        {/* IDEA INTAKE + QUICK UNPACK */}
        <section className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
          <div className="rounded-2xl border border-slate-100 bg-white/95 px-4 py-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-[11px] font-semibold text-slate-900">
                  Idea intake engine
                </span>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-0.5 text-[10px] text-slate-500 hover:border-rose-300 hover:text-rose-500"
              >
                <RefreshCw className="h-3 w-3" />
                Reset
              </button>
            </div>
            <div className="space-y-2 text-[10px]">
              <label className="flex flex-col gap-1">
                <span className="text-slate-700">Describe your idea</span>
                <textarea
                  rows={4}
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="In one paragraph, explain what you want to build and why it matters."
                  className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-[11px] text-slate-900 outline-none focus:border-sky-500"
                />
              </label>
              <div className="grid gap-2 md:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className="text-slate-700">Who is this for? (ICP)</span>
                  <input
                    value={icp}
                    onChange={(e) => setIcp(e.target.value)}
                    placeholder="e.g., solo SaaS founders, micro-agencies…"
                    className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] outline-none focus:border-sky-500"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-slate-700">
                    What outcome should they get?
                  </span>
                  <input
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value)}
                    placeholder="e.g., launch a proof-backed MVP & first 10 users in 30 days."
                    className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] outline-none focus:border-sky-500"
                  />
                </label>
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[10px] text-slate-500">
                  This capsule feeds every research module: QIE, Risk, Blueprint
                  and Synthesis.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={!canRun}
                    onClick={handleQuickUnpack}
                    className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1.5 text-[10px] font-semibold text-white disabled:opacity-40"
                  >
                    <Sparkles className="h-3 w-3" />
                    Save & quick-unpack
                  </button>
                  <Link
                    href="/research/qie"
                    className="inline-flex items-center gap-1 rounded-full border border-sky-400 bg-sky-50 px-3 py-1.5 text-[10px] font-medium text-sky-700"
                  >
                    Open QIE
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
            {unpacked && (
              <pre className="mt-3 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] text-slate-700">
                {unpacked}
              </pre>
            )}
            {status && (
              <p className="mt-2 text-[10px] text-emerald-600">{status}</p>
            )}
          </div>

          {/* Research Chief */}
          <div className="flex flex-col gap-3">
            <section className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 via-sky-50 to-white px-4 py-3 shadow-sm">
              <div className="mb-1 flex items-center gap-1.5">
                <Brain className="h-3.5 w-3.5 text-violet-600" />
                <span className="text-[11px] font-semibold text-slate-900">
                  Research Chief • Today&apos;s focus
                </span>
              </div>
              <p className="mb-1 text-[10px] font-medium text-slate-800">
                {chiefHeadline}
              </p>
              <p className="mb-2 text-[10px] text-slate-600">{chiefNext}</p>
              <div className="flex flex-wrap gap-2 text-[10px]">
                <Link
                  href="/research/qie"
                  className="inline-flex items-center gap-1 rounded-full bg-violet-600 px-3 py-1 text-[10px] font-semibold text-white"
                >
                  Run QIE
                </Link>
                <Link
                  href="/research/risk"
                  className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-amber-700"
                >
                  Risk & Buildability
                </Link>
                <Link
                  href="/research/blueprint"
                  className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-slate-700"
                >
                  Blueprint
                </Link>
              </div>
            </section>

            {/* Research Loop */}
            <section className="rounded-2xl border border-slate-100 bg-white/90 px-4 py-3 shadow-sm">
              <p className="mb-1 text-[11px] font-semibold text-slate-900">
                Research Loop
              </p>
              <p className="mb-2 text-[10px] text-slate-600">
                Run this loop every time you consider a serious idea:
              </p>
              <ol className="space-y-1 text-[10px] text-slate-700">
                <li>1. Capture idea + ICP + outcome.</li>
                <li>2. Run QIE → read Summary + Star Features.</li>
                <li>
                  3. Run Risk + Buildability — if red flags dominate, change the
                  idea.
                </li>
                <li>4. Generate Blueprint → send to Builder & Growth.</li>
                <li>
                  5. Save to Projects & HELIX, then iterate from real-world
                  signals.
                </li>
              </ol>
            </section>
          </div>
        </section>

        {/* MODULE STRIP */}
        <section className="rounded-2xl border border-slate-100 bg-white/95 px-4 py-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-sky-600" />
              <span className="text-[11px] font-semibold text-slate-900">
                Research modules
              </span>
            </div>
            <span className="text-[10px] text-slate-500">
              Pick a module or just follow them left → right.
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <ModuleCard
              title="Quantum Idea Engine"
              subtitle="Deep evaluation + star features + narrative."
              badge="Start here"
              href="/research/qie"
            />
            <ModuleCard
              title="Risk & Buildability"
              subtitle="Risk map, feasibility & 10-point buildability score."
              badge="Reality check"
              href="/research/risk"
            />
            <ModuleCard
              title="Blueprint & Investor Pack"
              subtitle="Architecture, scope, GTM and investor-ready story."
              badge="Plan to build"
              href="/research/blueprint"
            />
            <ModuleCard
              title="Evidence & Atomic Blocks"
              subtitle="Competitors, market pulse & actionable research blocks."
              badge="Signals"
              href="/research/risk" // we’ll reuse same page for now
            />
            <ModuleCard
              title="Synthesis Engine"
              subtitle="Combine 2–3 ideas into one monster thesis."
              badge="Advanced"
              href="/research/synthesis"
            />
            <ModuleCard
              title="Sync to Builder + Growth"
              subtitle="Use outputs directly inside Builder Lab & Growth OS."
              badge="Connected"
              href="/projects"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

/* helpers */

function GuideChip({ number, label }: { number: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-slate-100 bg-slate-50 px-2 py-1">
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[9px] font-semibold text-white">
        {number}
      </span>
      <span className="text-[10px] text-slate-800">{label}</span>
    </div>
  );
}

function ModuleCard({
  title,
  subtitle,
  href,
  badge,
}: {
  title: string;
  subtitle: string;
  href: string;
  badge: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3 text-[11px] text-slate-900 shadow-sm hover:border-sky-300 hover:bg-white"
    >
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1 rounded-full bg-slate-900/90 px-2 py-0.5 text-[9px] font-medium text-white">
          {badge}
        </div>
        <p className="font-semibold">{title}</p>
        <p className="text-[10px] text-slate-600">{subtitle}</p>
      </div>
      <div className="mt-2 inline-flex items-center gap-1 text-[10px] text-sky-700">
        Open module
        <ArrowRight className="h-3 w-3" />
      </div>
    </Link>
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

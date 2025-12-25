// src/components/research/ResearchBlueprintPage.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Rocket, TrendingUp } from "lucide-react";
import { loadResearchSnapshot } from "@/components/research/researchSnapshot";

export default function ResearchBlueprintPage() {
  const [headline, setHeadline] = useState("");
  const [blueprint, setBlueprint] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const snap = loadResearchSnapshot();
    if (snap) {
      setHeadline(
        snap.blueprintHeadline ||
          blueprintHeadlineFromIdea(snap.idea || "", snap.outcome || "")
      );
    }
  }, []);

  async function runBlueprint() {
    setLoading(true);
    await fakeDelay(900);

    const text = [
      `Blueprint: ${headline || "Zero17 project — from idea to proof"}`,
      "",
      "1) Core surfaces:",
      "   • Research Lab → thesis.",
      "   • Builder Lab → working product.",
      "   • Launch Engine → public launch & Truth Ledger.",
      "   • Growth OS → repeatable revenue.",
      "",
      "2) Data model (v1): Project, ResearchSnapshot, BuildArtifact, GrowthPlan.",
      "",
      "3) Non-goals: multi-tenant teams, complex billing, infinite themeing.",
      "",
      "4) GTM seed:",
      "   • 10–20 interviews with ICP.",
      "   • 1–2 public case studies built with Zero17.",
      "   • Daily build-in-public content driven by Growth OS.",
    ].join("\n");

    setBlueprint(text);
    setLoading(false);
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
          <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] text-slate-700">
            <FileText className="h-3 w-3" />
            Blueprint & Investor Pack
          </div>
        </header>

        {/* Blueprint generator */}
        <section className="rounded-3xl border border-slate-100 bg-white/90 px-5 py-4 shadow-sm text-[10px]">
          <p className="mb-2 text-[11px] font-semibold text-slate-900">
            Turn your thesis into something Builder, Launch Engine and Growth OS
            can act on.
          </p>
          <input
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="Headline for this blueprint (shows up in Projects / HELIX)."
            className="mb-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] text-slate-900 outline-none focus:border-sky-500"
          />

          <button
            type="button"
            onClick={runBlueprint}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-1.5 text-[11px] font-semibold text-white"
          >
            {loading ? "Drafting…" : "Generate blueprint"}
          </button>

          {blueprint && (
            <pre className="mt-3 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] text-slate-700">
              {blueprint}
            </pre>
          )}
        </section>

        {/* Wiring to other pillars */}
        <section className="flex flex-wrap gap-3 rounded-2xl border border-slate-100 bg-white/90 px-4 py-3 text-[10px] shadow-sm">
          <span className="text-[10px] font-semibold text-slate-900">
            Send this blueprint directly into the rest of your OS:
          </span>
          <Link
            href="/builder/arena"
            className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-emerald-700"
          >
            <Rocket className="h-3 w-3" />
            Open Builder Lab
          </Link>
          <Link
            href="/growth"
            className="inline-flex items-center gap-1 rounded-full border border-violet-300 bg-violet-50 px-3 py-1 text-violet-700"
          >
            <TrendingUp className="h-3 w-3" />
            Open Growth OS
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-slate-700"
          >
            Save as Project
          </Link>
        </section>
      </div>
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

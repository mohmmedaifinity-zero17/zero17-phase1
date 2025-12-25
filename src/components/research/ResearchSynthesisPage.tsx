// src/components/research/ResearchSynthesisPage.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { loadResearchSnapshot } from "@/components/research/researchSnapshot";

export default function ResearchSynthesisPage() {
  const [ideaA, setIdeaA] = useState("");
  const [ideaB, setIdeaB] = useState("");
  const [ideaC, setIdeaC] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const snap = loadResearchSnapshot();
    if (snap?.idea) setIdeaA(snap.idea);
  }, []);

  const canRun = !!ideaA.trim() && !!ideaB.trim();

  async function runSynth() {
    if (!canRun) return;
    setLoading(true);
    await fakeDelay(900);

    const text = [
      "Synthesis result:",
      "",
      `• Idea A: ${truncate(ideaA, 80)}`,
      `• Idea B: ${truncate(ideaB, 80)}`,
      ideaC.trim() && `• Idea C: ${truncate(ideaC, 80)}`,
      "",
      "Next move:",
      "• Choose one primary ICP and outcome that all three ideas can serve.",
      "• Merge the strongest features into one OS; drop anything that doesn't reinforce the promise.",
      "• Use this combined thesis as the single project inside Zero17.",
    ]
      .filter(Boolean)
      .join("\n");

    setResult(text);
    setLoading(false);
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
          <div className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[10px] text-rose-700">
            <Sparkles className="h-3 w-3" />
            Synthesis Engine
          </div>
        </header>

        <section className="rounded-3xl border border-rose-100 bg-white/90 px-5 py-4 shadow-sm text-[10px]">
          <p className="mb-2 text-[11px] font-semibold text-slate-900">
            Combine 2–3 ideas into one monster thesis instead of building three
            half-baked tools.
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            <textarea
              rows={4}
              value={ideaA}
              onChange={(e) => setIdeaA(e.target.value)}
              placeholder="Idea A (usually your current main idea)."
              className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-[11px] text-slate-900 outline-none focus:border-rose-400"
            />
            <textarea
              rows={4}
              value={ideaB}
              onChange={(e) => setIdeaB(e.target.value)}
              placeholder="Idea B (another path you’re considering)."
              className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-[11px] text-slate-900 outline-none focus:border-rose-400"
            />
            <textarea
              rows={4}
              value={ideaC}
              onChange={(e) => setIdeaC(e.target.value)}
              placeholder="Idea C (optional)."
              className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-[11px] text-slate-900 outline-none focus:border-rose-400"
            />
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <p className="text-[10px] text-slate-600">
              Use this when you feel pulled in multiple directions. The output
              is a single, sharper thesis.
            </p>
            <button
              type="button"
              disabled={!canRun || loading}
              onClick={runSynth}
              className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-1.5 text-[11px] font-semibold text-white disabled:opacity-40"
            >
              {loading ? "Synthesizing…" : "Synthesize ideas"}
            </button>
          </div>
          {result && (
            <pre className="mt-3 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] text-slate-700">
              {result}
            </pre>
          )}
        </section>
      </div>
    </div>
  );
}

function truncate(text: string, max: number) {
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + "…";
}

function fakeDelay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

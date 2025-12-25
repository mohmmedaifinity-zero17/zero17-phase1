// src/components/research/SuccessMirrorPanel.tsx
"use client";

import { useState } from "react";
import { EvidenceBundle, ResearchIdea } from "@/lib/research/types";

interface MirrorResult {
  closestArchetypes: string[];
  comparisonNarrative: string;
  earlyMilestones: string[];
  longTermPatterns: string[];
}

interface Props {
  idea: ResearchIdea | null;
  evidence: EvidenceBundle | null;
}

export default function SuccessMirrorPanel({ idea, evidence }: Props) {
  const [mirror, setMirror] = useState<MirrorResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasTried, setHasTried] = useState(false);

  const canRun = Boolean(idea);

  const handleRunMirror = async () => {
    if (!idea) return;
    setIsLoading(true);
    setHasTried(true);

    try {
      const res = await fetch("/api/research/mirror", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, evidence }),
      });

      if (!res.ok) {
        console.error("Mirror API error:", await res.text());
        setIsLoading(false);
        return;
      }

      const data = (await res.json()) as { mirror: MirrorResult };
      setMirror(data.mirror);
    } catch (err) {
      console.error("Mirror fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Success-Story Mirror
          </h2>
          <p className="text-[11px] text-slate-600">
            See which winning products your idea most resembles, how they
            actually won, and what milestones to aim for.
          </p>
        </div>
        <button
          onClick={handleRunMirror}
          disabled={!canRun || isLoading}
          className="rounded-full border border-indigo-700 bg-indigo-700 px-4 py-1.5 text-[11px] font-semibold text-indigo-50 disabled:opacity-60"
        >
          {isLoading
            ? "Mirroring..."
            : canRun
              ? "Run Success Mirror"
              : "Add idea first"}
        </button>
      </div>

      {!idea && (
        <p className="text-[11px] text-slate-500">
          Start in <span className="font-semibold">Origin Frame</span> by
          describing your idea. The Mirror will then compare it to real
          archetypes.
        </p>
      )}

      {idea && !mirror && !isLoading && !hasTried && (
        <p className="text-[11px] text-slate-500">
          When you&apos;re ready, hit{" "}
          <span className="font-semibold">Run Success Mirror</span> to see which
          archetypes your idea rhymes with and what path they took.
        </p>
      )}

      {idea && !mirror && !isLoading && hasTried && (
        <p className="text-[11px] text-rose-500">
          Something went off while generating the mirror. Try again in a moment,
          or continue with other sections.
        </p>
      )}

      {mirror && (
        <div className="mt-2 grid gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.3fr)] text-[11px]">
          {/* Left: Archetypes + milestones */}
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-900 p-3 text-slate-50">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300">
                  Closest archetypes
                </span>
                <span className="rounded-full bg-slate-800 px-2 py-[2px] text-[9px] font-semibold text-slate-200">
                  {mirror.closestArchetypes.length} matches
                </span>
              </div>
              {mirror.closestArchetypes.length === 0 ? (
                <p className="text-[10px] text-slate-300">
                  No strong archetype matches. This might be very new or very
                  vague. Tighten your ICP and scope, then run again.
                </p>
              ) : (
                <ul className="mt-1 space-y-1 text-[10px]">
                  {mirror.closestArchetypes.map((a, i) => (
                    <li key={i}>• {a}</li>
                  ))}
                </ul>
              )}
            </div>

            <MilestoneCard
              title="Early milestones (0–18 months)"
              items={mirror.earlyMilestones}
            />
          </div>

          {/* Right: narrative + long-term patterns */}
          <div className="space-y-2">
            <div className="rounded-lg border border-indigo-200 bg-white/90 p-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-indigo-700">
                How winners actually won
              </span>
              <p className="mt-1 whitespace-pre-line text-[11px] text-slate-900">
                {mirror.comparisonNarrative}
              </p>
            </div>
            <PatternCard items={mirror.longTermPatterns} />
          </div>
        </div>
      )}
    </section>
  );
}

function MilestoneCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-indigo-100 bg-white/90 p-3">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          {title}
        </span>
        <span className="rounded-full bg-indigo-50 px-2 py-[2px] text-[9px] font-semibold text-indigo-800">
          {items.length} steps
        </span>
      </div>
      {items.length === 0 ? (
        <p className="text-[10px] text-slate-400">
          No milestones yet. Mirror will fill this once it sees enough shape.
        </p>
      ) : (
        <ul className="mt-1 space-y-1 text-[10px] text-slate-800">
          {items.map((x, i) => (
            <li key={i}>• {x}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PatternCard({ items }: { items: string[] }) {
  return (
    <div className="rounded-lg border border-indigo-100 bg-indigo-50/80 p-3">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-indigo-800">
          Long-term patterns from winners
        </span>
        <span className="rounded-full bg-indigo-100 px-2 py-[2px] text-[9px] font-semibold text-indigo-900">
          {items.length} patterns
        </span>
      </div>
      {items.length === 0 ? (
        <p className="text-[10px] text-slate-500">
          Patterns will appear once the Mirror recognises clear archetypes.
        </p>
      ) : (
        <ul className="mt-1 space-y-1 text-[10px] text-slate-800">
          {items.map((x, i) => (
            <li key={i}>• {x}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

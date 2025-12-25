"use client";

import { useEffect, useState } from "react";
import {
  EvidenceBundle,
  ResearchIdea,
  SynthesisState,
  ScoreBundle,
  RiskProfile,
  Blueprint,
} from "@/lib/research/types";

interface HelixAdvice {
  primaryAction: string;
  primaryReason: string;
  secondaryTips: string[];
  toneTag: string;
}

interface Props {
  idea: ResearchIdea | null;
  evidence: EvidenceBundle | null;
  synthesis: SynthesisState | null;
  scores: ScoreBundle | null;
  risks: RiskProfile | null;
  blueprint: Blueprint | null;
  currentStep: number;
}

export default function HelixGuidePanel({
  idea,
  evidence,
  synthesis,
  scores,
  risks,
  blueprint,
  currentStep,
}: Props) {
  const [helix, setHelix] = useState<HelixAdvice | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!idea) {
      setHelix(null);
      return;
    }

    setLoading(true);
    const controller = new AbortController();

    const run = async () => {
      try {
        const res = await fetch("/api/research/helix", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idea,
            evidence,
            synthesis,
            scores,
            risks,
            blueprint,
            currentStep,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          console.error("Helix API error:", await res.text());
          setLoading(false);
          return;
        }

        const data = (await res.json()) as { helix: HelixAdvice };
        setHelix(data.helix);
      } catch (err) {
        if ((err as any).name !== "AbortError") {
          console.error("Helix fetch error:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    const t = setTimeout(run, 500);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [idea, evidence, synthesis, scores, risks, blueprint, currentStep]);

  const tagChip = getToneChip(helix?.toneTag || "gentle-nudge");

  return (
    <section className="mb-4 rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-sm">
      <div className="mb-1 flex items-center justify-between gap-2">
        <div>
          <h1 className="text-sm font-semibold text-slate-900">
            Research Lab – Helix Navigation
          </h1>
          <p className="text-[10px] text-slate-600">
            One step at a time. Helix watches your progress and points to the
            next best click.
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-[3px] text-[9px] font-semibold ${tagChip}`}
        >
          HELIX ACTIVE
        </span>
      </div>

      {!idea && (
        <p className="mt-1 text-[10px] text-slate-500">
          Start with a clear idea in{" "}
          <span className="font-semibold">Origin Frame</span>. Helix will guide
          you from there.
        </p>
      )}

      {idea && loading && (
        <p className="mt-1 text-[10px] text-slate-500">
          Reading the lab state and plotting your next move…
        </p>
      )}

      {idea && helix && !loading && (
        <div className="mt-2 grid gap-2 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] text-[10px]">
          <div className="rounded-xl bg-slate-900 p-3 text-slate-50">
            <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-300">
              Next primary action
            </div>
            <p className="mt-1 text-[11px] font-semibold">
              {helix.primaryAction}
            </p>
            <p className="mt-1 text-[10px] text-slate-100">
              {helix.primaryReason}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="mb-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-600">
              Quick tips
            </div>
            <ul className="space-y-[2px] text-[10px] text-slate-800">
              {helix.secondaryTips.map((tip, i) => (
                <li key={i}>• {tip}</li>
              ))}
              {helix.secondaryTips.length === 0 && (
                <li className="text-slate-400">No extra tips right now.</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}

function getToneChip(tone: string) {
  switch (tone) {
    case "decisive":
      return "bg-slate-900 text-slate-50";
    case "warning":
      return "bg-amber-100 text-amber-900";
    case "celebrate":
      return "bg-emerald-100 text-emerald-900";
    case "gentle-nudge":
    default:
      return "bg-slate-100 text-slate-800";
  }
}

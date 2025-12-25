// src/components/research/BlueprintFoundry.tsx
"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { logHelixEvent } from "@/lib/helix/logClient";
import type {
  ResearchIdea,
  EvidenceBundle,
  SynthesisState,
  ScoreBundle,
  RiskProfile,
  Blueprint,
} from "@/lib/research/types";

type BlueprintFoundryProps = {
  idea?: ResearchIdea | null;
  evidence?: EvidenceBundle | null;
  synthesis?: SynthesisState | null;
  scores?: ScoreBundle | null;
  risks?: RiskProfile | null;
  blueprint?: Blueprint | null;
  onBlueprintChangeAction?: (blueprint: Blueprint | null) => void;
  userId?: string | null;
  // Legacy props for backwards compatibility
  ideaId?: string;
  ideaTitle?: string;
  buildabilityScore?: number | null;
  decision?: string | null; // "build", "park", "kill" or similar
  onCommitAction?: (decision: string) => Promise<void> | void;
};

export default function BlueprintFoundry(props: BlueprintFoundryProps) {
  const {
    idea,
    scores,
    blueprint,
    onBlueprintChangeAction,
    // Legacy props
    ideaId,
    ideaTitle,
    buildabilityScore,
    decision,
    onCommitAction,
  } = props;

  // Extract values from props
  const title =
    ideaTitle || idea?.title || idea?.description || "Untitled idea";
  const score = buildabilityScore ?? scores?.buildabilityIndex ?? null;
  const currentDecision = decision ?? blueprint?.decisionNote ?? null;
  const [committing, setCommitting] = useState(false);

  async function handleCommit(nextDecision: string) {
    if (committing) return;
    setCommitting(true);
    try {
      // 1) Update blueprint if callback provided
      if (onBlueprintChangeAction && blueprint) {
        onBlueprintChangeAction({
          ...blueprint,
          decisionNote: nextDecision,
        });
      }

      // 2) Call legacy callback if provided
      if (onCommitAction) {
        await onCommitAction(nextDecision);
      }

      // 3) Log to Helix Memory + update pill
      const humanDecision =
        nextDecision === "build"
          ? "Build now"
          : nextDecision === "park"
            ? "Park & revisit later"
            : nextDecision === "kill"
              ? "Kill and redirect"
              : nextDecision;

      await logHelixEvent({
        source: "research",
        kind: "decision",
        title: title ?? "Research decision",
        summary: `Decision on "${title || "untitled idea"}": ${humanDecision}. Buildability score: ${
          score ?? "unknown"
        }/100.`,
        metadata: {
          ideaId,
          buildabilityScore: score,
          decision: nextDecision,
        },
        nextMoveSummary:
          nextDecision === "build"
            ? "Move to Builder Lab and cut Phase 0 from this idea."
            : nextDecision === "park"
              ? "Log why you parked this in Validation Memory and explore adjacent ideas."
              : nextDecision === "kill"
                ? "Kill the idea cleanly and pivot using the strongest signal from your evidence."
                : undefined,
      });
    } finally {
      setCommitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-4 shadow-sm">
      {/* ... your existing blueprint UI ... */}

      <div className="mt-4 flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2 text-xs text-slate-500 items-center">
          {typeof score === "number" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 text-slate-50 px-3 py-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-300" />
              Buildability {score}/100
            </span>
          )}
          {currentDecision && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-slate-700">
              Decision: <span className="font-semibold">{currentDecision}</span>
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            disabled={committing}
            onClick={() => handleCommit("build")}
            className="inline-flex items-center gap-1 rounded-full bg-emerald-600 text-white px-3 py-1 text-xs font-semibold hover:bg-emerald-500 disabled:opacity-60"
          >
            {committing && <Loader2 className="w-3 h-3 animate-spin" />}
            Build this
          </button>
          <button
            type="button"
            disabled={committing}
            onClick={() => handleCommit("park")}
            className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 text-white px-3 py-1 text-xs font-semibold hover:bg-amber-400 disabled:opacity-60"
          >
            Park for later
          </button>
          <button
            type="button"
            disabled={committing}
            onClick={() => handleCommit("kill")}
            className="inline-flex items-center gap-1 rounded-full bg-rose-600 text-white px-3 py-1 text-xs font-semibold hover:bg-rose-500 disabled:opacity-60"
          >
            Kill this bet
          </button>
        </div>
      </div>
    </div>
  );
}

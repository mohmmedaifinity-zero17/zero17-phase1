// src/components/research/ValidationChiefRail.tsx
"use client";

import {
  EvidenceBundle,
  ResearchIdea,
  SynthesisState,
  ScoreBundle,
  RiskProfile,
  Blueprint,
} from "@/lib/research/types";

interface Props {
  idea: ResearchIdea | null;
  evidence: EvidenceBundle | null;
  synthesis: SynthesisState | null;
  scores: ScoreBundle | null;
  risks: RiskProfile | null;
  blueprint: Blueprint | null;
  currentStep: number;
}

export default function ValidationChiefRail({
  idea,
  evidence,
  synthesis,
  scores,
  risks,
  blueprint,
  currentStep,
}: Props) {
  const hasEvidence =
    !!evidence &&
    (!!evidence.autoScan ||
      (evidence.receipts && evidence.receipts.length > 0) ||
      (evidence.competitors && evidence.competitors.length > 0));

  const buildability =
    scores?.buildabilityIndex != null ? scores.buildabilityIndex : null;
  const signalPulse = scores?.signalPulse ?? null;
  const riskHeat = risks?.overall ?? null;

  const proofCount = [
    evidence?.receipts?.length ?? 0,
    evidence?.competitors?.length ?? 0,
  ].reduce((a, b) => a + b, 0);

  const stepLabel = [
    "Not started",
    "Idea & ICP",
    "Reality Scan",
    "Synthesis Zone",
    "Scores & Risk",
    "Blueprint & Decision",
  ][currentStep] as string;

  return (
    <aside className="space-y-3">
      {/* Chief hero card with crown + dark palette similar to Helix */}
      <section className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 text-slate-50 shadow-[0_18px_45px_rgba(15,23,42,0.75)]">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-emerald-400 to-violet-500 text-lg">
              <span>👑</span>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-50">
                Validation Chief
              </div>
              <div className="text-[10px] text-slate-300">
                Your ruthless but loyal co-founder for this idea.
              </div>
            </div>
          </div>
          <span className="rounded-full bg-sky-400/90 px-3 py-[4px] text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-950">
            STAR · ONLINE
          </span>
        </div>

        <div className="mt-2 rounded-2xl bg-slate-900/60 p-3 text-[10px]">
          <div className="mb-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-300">
            Where you are
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="rounded-full bg-slate-800 px-2.5 py-[3px] text-[10px] font-medium text-slate-50">
              Step {currentStep}/5 · {stepLabel}
            </span>
            {buildability != null && (
              <span className="rounded-full bg-emerald-400/90 px-2.5 py-[3px] text-[10px] font-semibold text-slate-950">
                Buildability {buildability}/100
              </span>
            )}
          </div>

          <p className="mt-2 text-[10px] text-slate-200">
            {getChiefHeadline({
              currentStep,
              idea,
              hasEvidence,
              buildability,
              blueprint,
            })}
          </p>
        </div>
      </section>

      {/* Mini Lab Snapshot card just below Chief */}
      <section className="rounded-2xl border border-slate-200 bg-white/90 p-3 text-[10px] shadow-sm">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] font-semibold text-slate-900">
              Lab Snapshot
            </div>
            <div className="text-[9px] text-slate-500">
              Quick feel for this idea’s strength, risk, and proof.
            </div>
          </div>
          <span className="rounded-full bg-slate-900 px-2.5 py-[2px] text-[9px] font-semibold text-slate-50">
            LIVE
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-slate-50 p-2">
            <div className="text-[9px] text-slate-500">Buildability</div>
            <div className="text-[12px] font-semibold text-slate-900">
              {buildability != null ? `${buildability}/100` : "—"}
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-2">
            <div className="text-[9px] text-slate-500">Signal Pulse</div>
            <div className="text-[12px] font-semibold text-slate-900">
              {signalPulse != null ? `${signalPulse}/100` : "—"}
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-2">
            <div className="text-[9px] text-slate-500">Risk heat</div>
            <div className="text-[12px] font-semibold text-slate-900">
              {riskHeat ?? "—"}
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-2">
            <div className="text-[9px] text-slate-500">Proof stack</div>
            <div className="text-[12px] font-semibold text-slate-900">
              {proofCount > 0 ? `${proofCount} signals` : "No proof yet"}
            </div>
          </div>
        </div>

        <div className="mt-2 rounded-xl bg-slate-50 p-2 text-[9px] text-slate-600">
          {getChiefMicroAdvice({
            currentStep,
            hasEvidence,
            buildability,
            blueprint,
          })}
        </div>
      </section>
    </aside>
  );
}

function getChiefHeadline({
  currentStep,
  idea,
  hasEvidence,
  buildability,
  blueprint,
}: {
  currentStep: number;
  idea: ResearchIdea | null;
  hasEvidence: boolean;
  buildability: number | null;
  blueprint: Blueprint | null;
}) {
  if (!idea) {
    return "Start with a sharp, specific idea in Origin Frame. Vague ideas create vague scores.";
  }

  if (currentStep === 1) {
    return "Good. Finish pinning down the problem and ICP. Then run Reality Scan to see how the world actually behaves.";
  }

  if (currentStep === 2 && !hasEvidence) {
    return "You’re still flying mostly on instinct. Add at least a few demand receipts or run the auto Reality Scan to give this idea a spine.";
  }

  if (currentStep === 3 && buildability == null) {
    return "You’ve invented a strong feature stack. Now let’s see if it’s worth building: run the Buildability Index next.";
  }

  if (currentStep === 4 && !blueprint) {
    return "The numbers are in. Convert this into a clear Phase 0 / 1 / 2 blueprint so Builder Lab can actually ship it.";
  }

  if (currentStep === 5 && blueprint) {
    return "You have a real blueprint. The next move is simple: push this into Builder Lab and Growth OS, then talk to 10 real humans.";
  }

  return "Keep moving through the pipeline. My job is to stop you overbuilding, under-validating, and kidding yourself.";
}

function getChiefMicroAdvice({
  currentStep,
  hasEvidence,
  buildability,
  blueprint,
}: {
  currentStep: number;
  hasEvidence: boolean;
  buildability: number | null;
  blueprint: Blueprint | null;
}) {
  if (currentStep === 0) {
    return "Give me one concrete idea and one concrete ICP. No buzzwords. The clearer you are here, the sharper the whole lab becomes.";
  }

  if (currentStep === 2 && !hasEvidence) {
    return "Paste 3–5 real user quotes, DMs, or emails. Even weak signals are better than fantasy.";
  }

  if (buildability != null && buildability < 45) {
    return "This idea is structurally weak right now. Either tighten ICP, simplify scope, or steal a stronger pattern from Synthesis Zone.";
  }

  if (blueprint && buildability != null && buildability >= 70) {
    return "This is a serious bet. Ship a slim Phase 0, price it, and run a tiny launch to 20–50 people. Then come back and log what actually happened.";
  }

  return "Don’t try to make this perfect inside the lab. The point is to get you to a sharp, testable blueprint – then out into the real world.";
}

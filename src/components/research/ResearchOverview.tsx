// src/components/research/ResearchOverview.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";

import OriginFrame from "@/components/research/OriginFrame";
import QuantumInsightPanel from "@/components/research/QuantumInsightPanel";
import RealityScanner from "@/components/research/RealityScanner";
import SynthesisZone from "@/components/research/SynthesisZone";
import SuccessMirrorPanel from "@/components/research/SuccessMirrorPanel";
import BuildabilityPanel from "@/components/research/BuildabilityPanel";
import RiskRadar from "@/components/research/RiskRadar";
import WhatIfModePanel from "@/components/research/WhatIfModePanel";
import BlueprintFoundry from "@/components/research/BlueprintFoundry";
import ValidationMemoryPanel from "@/components/research/ValidationMemoryPanel";
import ValidationChiefRail from "@/components/research/ValidationChiefRail";
import FlightPlanFooter from "@/components/research/FlightPlanFooter";
import HelixGuidePanel from "@/components/research/HelixGuidePanel";

import {
  ResearchIdea,
  EvidenceBundle,
  SynthesisState,
  ScoreBundle,
  RiskProfile,
  Blueprint,
} from "@/lib/research/types";
import { useAuth } from "@/components/auth/AuthProvider";
import { researchCopy } from "@/lib/research/copy";

export default function ResearchOverview() {
  const { user } = useAuth();

  const [idea, setIdea] = useState<ResearchIdea | null>(null);
  const [evidence, setEvidence] = useState<EvidenceBundle | null>(null);
  const [synthesis, setSynthesis] = useState<SynthesisState | null>(null);
  const [scores, setScores] = useState<ScoreBundle | null>(null);
  const [risks, setRisks] = useState<RiskProfile | null>(null);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [insight, setInsight] = useState<any | null>(null);

  const currentStep = (() => {
    if (!idea) return 0;

    let step = 1;

    if (
      evidence &&
      (evidence.autoScan ||
        (evidence.receipts && evidence.receipts.length > 0) ||
        (evidence.competitors && evidence.competitors.length > 0))
    ) {
      step = 2;
    }

    if (
      synthesis &&
      ((synthesis.fusionFeatures && synthesis.fusionFeatures.length > 0) ||
        (synthesis.mutationPatterns && synthesis.mutationPatterns.length > 0) ||
        (synthesis.matrixFeatures && synthesis.matrixFeatures.length > 0))
    ) {
      step = 3;
    }

    if (scores) {
      step = 4;
    }

    if (blueprint) {
      step = 5;
    }

    return step;
  })();

  const handleStepClick = (id: number) => {
    if (typeof document === "undefined") return;
    const el = document.getElementById(`rl-step-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="space-y-4">
      {/* HELIX brain */}
      <HelixGuidePanel
        idea={idea}
        evidence={evidence}
        synthesis={synthesis}
        scores={scores}
        risks={risks}
        blueprint={blueprint}
        currentStep={currentStep}
      />

      {/* HERO – cinematic blue/black capsule */}
      <header className="rounded-3xl border border-sky-500/20 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            {/* HELIX-STYLE HERO HEADER FOR RESEARCH LAB */}
            <section className="mb-4 rounded-3xl border border-slate-900/70 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 shadow-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-800/80 px-3 py-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-200">
                  Zero17 · Research Lab v4.1
                </span>
              </div>
              <h1 className="mt-2 text-[15px] font-semibold text-slate-50">
                Research Lab — Turn sparks into serious, fundable bets.
              </h1>
              <p className="mt-1 text-[11px] text-slate-200">
                No idea theatre. We crush fantasies, surface red flags, and
                forge one sharp blueprint you can actually build — then wire it
                straight into Builder Lab and Growth OS.
              </p>
            </section>
          </div>

          {/* right-side hero pills */}
          <div className="flex flex-wrap items-end justify-start gap-2 sm:justify-end">
            <div className="flex flex-col items-start gap-1 sm:items-end">
              <span className="rounded-2xl bg-slate-900/80 px-3 py-1 text-[10px] font-semibold text-sky-200 ring-1 ring-sky-500/60">
                Founder Quantum Engine · v4.1
              </span>
              <span className="rounded-2xl bg-sky-500/15 px-3 py-1 text-[10px] text-slate-100 ring-1 ring-sky-400/50">
                Built for 0.01% operators · Designed to be un-copyable
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN GRID */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,0.9fr)]">
        {/* LEFT: LAB */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* STEP 1 – Origin + Insight */}
          <div id="rl-step-1" className="space-y-3 scroll-mt-24">
            <OriginFrame idea={idea} onIdeaChange={setIdea} />
            <QuantumInsightPanel idea={idea} evidence={evidence} />
          </div>

          {/* STEP 2 – Reality */}
          <div id="rl-step-2" className="space-y-3 scroll-mt-24">
            <RealityScanner
              evidence={evidence}
              onEvidenceChange={setEvidence}
            />
          </div>

          {/* STEP 3 – Synthesis + Mirror */}
          <div id="rl-step-3" className="space-y-3 scroll-mt-24">
            <SynthesisZone
              idea={idea}
              evidence={evidence}
              synthesis={synthesis}
              onSynthesisChange={setSynthesis}
            />
            <SuccessMirrorPanel idea={idea} evidence={evidence} />
          </div>

          {/* STEP 4 – Scores + Risk + What-If */}
          <div id="rl-step-4" className="space-y-3 scroll-mt-24">
            <BuildabilityPanel
              idea={idea}
              evidence={evidence}
              synthesis={synthesis}
              scores={scores}
              onScoresChange={setScores}
            />
            <RiskRadar
              idea={idea}
              evidence={evidence}
              synthesis={synthesis}
              risks={risks}
              onRisksChange={setRisks}
            />
            <WhatIfModePanel
              idea={idea}
              evidence={evidence}
              synthesis={synthesis}
            />
          </div>

          {/* STEP 5 – Blueprint + Memory */}
          <div id="rl-step-5" className="space-y-3 scroll-mt-24">
            <BlueprintFoundry
              idea={idea}
              evidence={evidence}
              synthesis={synthesis}
              scores={scores}
              risks={risks}
              blueprint={blueprint}
              onBlueprintChangeAction={setBlueprint}
              userId={user ? user.id : null}
            />
            <ValidationMemoryPanel
              idea={idea}
              evidence={evidence}
              synthesis={synthesis}
              scores={scores}
              risks={risks}
              blueprint={blueprint}
              userId={user ? user.id : null}
            />
          </div>

          {/* Flight Plan */}
          <FlightPlanFooter
            currentStep={currentStep}
            onStepClick={handleStepClick}
          />
        </motion.div>

        {/* RIGHT: CHIEF RAIL */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
        >
          <ValidationChiefRail
            idea={idea}
            evidence={evidence}
            synthesis={synthesis}
            scores={scores}
            risks={risks}
            blueprint={blueprint}
            currentStep={currentStep}
          />
        </motion.div>
      </div>
    </div>
  );
}

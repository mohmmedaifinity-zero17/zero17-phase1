// src/components/research/LabSnapshotCard.tsx
"use client";

import {
  ResearchIdea,
  EvidenceBundle,
  ScoreBundle,
} from "@/lib/research/types";

interface Props {
  stepIndex: number;
  idea: ResearchIdea | null;
  evidence: EvidenceBundle | null;
  scores: ScoreBundle | null;
  risks: { overall: string } | null; // optional external risk profile
}

export default function LabSnapshotCard({
  stepIndex,
  idea,
  evidence,
  scores,
  risks,
}: Props) {
  const buildability = scores?.buildabilityIndex ?? null;
  const signalPulse = scores?.signalPulse ?? null;
  const riskLevel = scores?.riskLevel ?? "unknown";

  const proof = scores?.proofStack ?? {
    receiptsCount: evidence?.receipts?.length ?? 0,
    competitorsCount: evidence?.competitors?.length ?? 0,
    blueprintsCount: 0,
  };

  const proofLabel = `${proof.receiptsCount} receipts · ${proof.competitorsCount} competitors · ${proof.blueprintsCount} blueprints`;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-[10px] shadow-sm">
      {/* Progress */}
      <div className="flex flex-col min-w-[80px]">
        <span className="text-[10px] font-medium text-slate-500">Progress</span>
        <span className="text-xs font-semibold text-slate-900">
          Step {stepIndex} / 5
        </span>
      </div>

      <div className="h-7 w-px bg-slate-200" />

      {/* Buildability */}
      <div className="flex flex-col min-w-[80px]">
        <span className="text-[10px] font-medium text-slate-500">
          Buildability
        </span>
        <span className="text-xs font-semibold text-slate-900">
          {buildability !== null ? `${buildability}/100` : "—"}
        </span>
      </div>

      <div className="h-7 w-px bg-slate-200" />

      {/* Signal Pulse */}
      <div className="flex flex-col min-w-[90px]">
        <span className="text-[10px] font-medium text-slate-500">
          Signal Pulse
        </span>
        <span className="text-xs font-semibold text-sky-700">
          {signalPulse !== null ? `${signalPulse}/100` : "—"}
        </span>
      </div>

      <div className="h-7 w-px bg-slate-200" />

      {/* Risk Heat */}
      <div className="flex flex-col min-w-[70px]">
        <span className="text-[10px] font-medium text-slate-500">
          Risk Heat
        </span>
        <span className="text-xs font-semibold capitalize text-amber-700">
          {riskLevel === "unknown" ? "—" : riskLevel}
        </span>
      </div>

      <div className="h-7 w-px bg-slate-200" />

      {/* Proof Stack */}
      <div className="flex flex-col min-w-[140px]">
        <span className="text-[10px] font-medium text-slate-500">
          Proof Stack
        </span>
        <span className="text-[10px] font-medium text-slate-800">
          {proofLabel}
        </span>
      </div>
    </div>
  );
}

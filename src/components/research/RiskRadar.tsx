// src/components/research/RiskRadar.tsx
"use client";

import { useState } from "react";
import {
  EvidenceBundle,
  ResearchIdea,
  RiskFlag,
  RiskProfile,
  SynthesisState,
} from "@/lib/research/types";

interface Props {
  idea: ResearchIdea | null;
  evidence: EvidenceBundle | null;
  synthesis: SynthesisState | null;
  risks: RiskProfile | null;
  onRisksChange: (r: RiskProfile) => void;
}

export default function RiskRadar({
  idea,
  evidence,
  synthesis,
  risks,
  onRisksChange,
}: Props) {
  const [isBusy, setIsBusy] = useState(false);

  const handleRun = async () => {
    if (!idea) return;
    setIsBusy(true);
    try {
      const res = await fetch("/api/research/risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, evidence, synthesis }),
      });
      if (!res.ok) {
        console.error("Risk API error:", await res.text());
        return;
      }
      const data = (await res.json()) as { risks: RiskProfile };
      onRisksChange(data.risks);
    } catch (err) {
      console.error("Risk error:", err);
    } finally {
      setIsBusy(false);
    }
  };

  const overall = risks?.overall ?? "unknown";
  const flags = risks?.flags ?? [];

  return (
    <section className="rounded-2xl border border-amber-100 bg-amber-50/80 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Risk & Compliance Radar
          </h2>
          <p className="text-[11px] text-slate-600">
            Legal, platform, PII, ethics, ops & financial risks — plus Safe-Mode
            hints for a Phase 0 that won’t get you banned.
          </p>
        </div>
        <button
          onClick={handleRun}
          disabled={isBusy || !idea}
          className="rounded-full border border-amber-700 bg-amber-700 px-4 py-1.5 text-[11px] font-semibold text-amber-50 disabled:opacity-60"
        >
          {isBusy ? "Scanning…" : "Run Risk Radar"}
        </button>
      </div>

      {!risks && (
        <p className="text-[11px] text-slate-400">
          No risk profile yet. Run the radar once you have at least a basic idea
          described.
        </p>
      )}

      {risks && (
        <div className="space-y-2 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              Overall risk
            </span>
            <RiskChip level={overall} />
          </div>
          <div className="space-y-1">
            {flags.length === 0 && (
              <p className="text-[11px] text-slate-500">
                No major risks detected. This does not replace legal advice, but
                it suggests your shape is relatively safe for a Phase 0.
              </p>
            )}
            {flags.map((f, idx) => (
              <FlagRow key={idx} flag={f} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function RiskChip({ level }: { level: string }) {
  const config =
    level === "high"
      ? {
          label: "High",
          cls: "bg-red-100 text-red-800 border-red-300",
        }
      : level === "medium"
        ? {
            label: "Medium",
            cls: "bg-amber-100 text-amber-800 border-amber-300",
          }
        : level === "low"
          ? {
              label: "Low",
              cls: "bg-emerald-100 text-emerald-800 border-emerald-300",
            }
          : {
              label: "Unknown",
              cls: "bg-slate-100 text-slate-700 border-slate-300",
            };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-[2px] text-[10px] font-semibold ${config.cls}`}
    >
      {config.label}
    </span>
  );
}

function FlagRow({ flag }: { flag: RiskFlag }) {
  const level = flag.severity;
  const color =
    level === "high"
      ? "text-red-800"
      : level === "medium"
        ? "text-amber-800"
        : "text-emerald-800";
  const bg =
    level === "high"
      ? "bg-red-50 border-red-100"
      : level === "medium"
        ? "bg-amber-50 border-amber-100"
        : "bg-emerald-50 border-emerald-100";

  return (
    <div className={`rounded-lg border ${bg} px-3 py-2`}>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className={`text-[10px] font-semibold capitalize ${color}`}>
          {flag.type} · {flag.severity}
        </span>
      </div>
      <p className="text-[11px] text-slate-800">{flag.summary}</p>
      {flag.mitigation && (
        <p className="mt-1 text-[10px] text-slate-600">
          Mitigation: {flag.mitigation}
        </p>
      )}
    </div>
  );
}

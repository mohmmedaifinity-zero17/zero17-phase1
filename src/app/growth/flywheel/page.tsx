// src/app/growth/flywheel/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Orbit,
  Sparkles,
  AlertTriangle,
  Loader2,
} from "lucide-react";

type NodeKey =
  | "acquisition"
  | "activation"
  | "value"
  | "retention"
  | "referral";

type NodeState = {
  strength: number; // 0–100
  note: string;
};

type FlywheelResponse = {
  ok: boolean;
  diagnosis?: string;
  experiments?: string[];
  risks?: string[];
};

type HelixMovePayload = {
  source: "flywheel";
  summary: string;
  createdAt: string;
};

function broadcastHelixMove(summary: string) {
  if (typeof window === "undefined") return;
  const payload: HelixMovePayload = {
    source: "flywheel",
    summary,
    createdAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(
      "z17_last_growth_move",
      JSON.stringify(payload)
    );
  } catch {
    // ignore
  }
  window.dispatchEvent(
    new CustomEvent("z17:helixNextMove", { detail: payload })
  );
}

const NODE_LABELS: Record<NodeKey, string> = {
  acquisition: "Acquisition",
  activation: "Activation",
  value: "Value moment",
  retention: "Retention",
  referral: "Referral / Viral",
};

export default function FlywheelPage() {
  const [nodes, setNodes] = useState<Record<NodeKey, NodeState>>({
    acquisition: { strength: 40, note: "" },
    activation: { strength: 30, note: "" },
    value: { strength: 50, note: "" },
    retention: { strength: 20, note: "" },
    referral: { strength: 15, note: "" },
  });

  const [selected, setSelected] = useState<NodeKey>("acquisition");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<FlywheelResponse | null>(null);

  async function diagnose(mode: "diagnose" | "infinite") {
    try {
      setLoading(true);
      setAnalysis(null);

      const res = await fetch("/api/z17/growth/flywheel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          nodes,
        }),
      });
      const json = (await res.json()) as FlywheelResponse;
      setAnalysis(json || null);

      if (json?.diagnosis) {
        broadcastHelixMove(json.diagnosis.slice(0, 200));
      }
    } catch {
      setAnalysis({
        ok: false,
        diagnosis: "Something went wrong while running flywheel analysis.",
      });
    } finally {
      setLoading(false);
    }
  }

  function updateStrength(key: NodeKey, strength: number) {
    setNodes((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        strength,
      },
    }));
  }

  function updateNote(key: NodeKey, note: string) {
    setNodes((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        note,
      },
    }));
  }

  return (
    <div className="min-h-[calc(100vh-56px)]">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/growth"
            className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-black"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Growth OS
          </Link>
        </div>

        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <Orbit className="w-5 h-5 text-sky-500" />
            <h1 className="text-xl font-semibold">Flywheel Builder</h1>
          </div>
          <p className="text-[11px] text-slate-600 max-w-3xl">
            Design an infinite compounding loop. Each node represents a stage:
            acquisition, activation, value moment, retention and referral. Set
            their strength, add notes, then let Zero17 diagnose weak points and
            propose experiments.
          </p>
        </section>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: node graph */}
          <div className="relative rounded-3xl bg-gradient-to-br from-sky-50 via-indigo-50 to-purple-50 border border-slate-200 p-4">
            <div className="absolute inset-4 flex items-center justify-center pointer-events-none">
              {/* Circle */}
              <div className="w-52 h-52 md:w-72 md:h-72 rounded-full border border-slate-200/60 relative">
                {(Object.keys(NODE_LABELS) as NodeKey[]).map(
                  (key, idx, arr) => {
                    const angle = (idx / arr.length) * Math.PI * 2;
                    const radius = 110;
                    const cx = 0;
                    const cy = 0;
                    const x = cx + radius * Math.cos(angle);
                    const y = cy + radius * Math.sin(angle);
                    const strength = nodes[key].strength;
                    const size = 44 + (strength / 100) * 20;
                    const isActive = key === selected;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelected(key)}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border shadow-sm flex items-center justify-center text-[10px] font-semibold transition-all ${
                          isActive
                            ? "bg-sky-600 text-white border-sky-700"
                            : "bg-white/90 text-slate-700 border-slate-200 hover:bg-sky-50"
                        }`}
                        style={{
                          left: `calc(50% + ${x}px)`,
                          top: `calc(50% + ${y}px)`,
                          width: size,
                          height: size,
                        }}
                      >
                        {NODE_LABELS[key]}
                      </button>
                    );
                  }
                )}
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-[11px] text-slate-600 max-w-xs">
                The larger the node, the stronger that stage is in your current
                loop. Click a node to edit its strength and notes on the right.
              </p>
            </div>
          </div>

          {/* Right: controls */}
          <div className="space-y-4">
            <div className="z17-card bg-white/90 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Orbit className="w-4 h-4 text-sky-600" />
                  <div className="text-sm font-semibold">
                    {NODE_LABELS[selected]}
                  </div>
                </div>
                <div className="text-[11px] text-slate-500">
                  Node strength: {nodes[selected].strength}/100
                </div>
              </div>

              <div className="space-y-1 text-[11px]">
                <label className="font-semibold text-slate-700">
                  How strong is this stage today?
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={nodes[selected].strength}
                  onChange={(e) =>
                    updateStrength(selected, Number(e.target.value))
                  }
                  className="w-full"
                />
                <p className="text-[10px] text-slate-500">
                  0 = non-existent; 100 = world-class. Be honest — the diagnosis
                  works best when you are brutal.
                </p>
              </div>

              <div className="space-y-1 text-[11px]">
                <label className="font-semibold text-slate-700">
                  Notes for this stage
                </label>
                <textarea
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-sky-100"
                  placeholder="Example: Acquisition = X and LinkedIn threads. Activation = users stuck at import step."
                  value={nodes[selected].note}
                  onChange={(e) => updateNote(selected, e.target.value)}
                />
              </div>
            </div>

            <div className="z17-card bg-white/90 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <div className="text-sm font-semibold">
                  Run flywheel intelligence
                </div>
              </div>
              <p className="text-[11px] text-slate-600">
                Let Zero17 diagnose weak points, propose PLG experiments and
                even design an “Infinite Engine” loop that compounds your
                product like Figma or Duolingo.
              </p>

              <div className="flex flex-wrap gap-2 text-[11px]">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => diagnose("diagnose")}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-900 text-white px-3 py-1.5 hover:bg-black disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3" />
                  )}
                  Diagnose flywheel
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => diagnose("infinite")}
                  className="inline-flex items-center gap-1 rounded-full bg-sky-500 text-white px-3 py-1.5 hover:bg-sky-600 disabled:opacity-60"
                >
                  Infinite Engine mode
                </button>
              </div>

              {analysis && (
                <div className="mt-2 space-y-2 text-[11px]">
                  {analysis.diagnosis && (
                    <p className="text-slate-700">{analysis.diagnosis}</p>
                  )}
                  {analysis.risks && analysis.risks.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-red-600">
                        <AlertTriangle className="w-3 h-3" />
                        Risks
                      </div>
                      <ul className="list-disc pl-4 text-[10px] text-slate-600 space-y-0.5">
                        {analysis.risks.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysis.experiments && analysis.experiments.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold text-emerald-700">
                        Suggested experiments
                      </div>
                      <ul className="list-disc pl-4 text-[10px] text-slate-600 space-y-0.5">
                        {analysis.experiments.map((exp) => (
                          <li key={exp}>{exp}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

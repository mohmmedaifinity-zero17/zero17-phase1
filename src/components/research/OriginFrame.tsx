// src/components/research/OriginFrame.tsx
"use client";

import { ChangeEvent } from "react";
import ResearchCardShell from "@/components/research/ResearchCardShell";
import { ResearchIdea } from "@/lib/research/types";

interface Props {
  idea: ResearchIdea | null;
  onIdeaChange: (idea: ResearchIdea | null) => void;
}

export default function OriginFrame({ idea, onIdeaChange }: Props) {
  const safeIdea: ResearchIdea = idea || {
    title: "",
    description: "",
    icp: "",
    outcome: "",
    constraints: {
      timeHorizonMonths: 3,
      teamSize: "solo",
      monthlyBudgetUsd: null,
    },
    marketType: "smb",
  };

  const handleChange = (
    field: keyof ResearchIdea,
    value: string | ResearchIdea["constraints"]
  ) => {
    const updated: ResearchIdea = {
      ...safeIdea,
      [field]: value as any,
    };
    onIdeaChange(updated);
  };

  const handleConstraintChange = (
    field: keyof NonNullable<ResearchIdea["constraints"]>,
    value: number | string | null
  ) => {
    const updated: ResearchIdea = {
      ...safeIdea,
      constraints: {
        ...(safeIdea.constraints || {
          timeHorizonMonths: null,
          teamSize: "unknown",
          monthlyBudgetUsd: null,
        }),
        [field]: value,
      },
    };
    onIdeaChange(updated);
  };

  const onText = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    if (
      name === "title" ||
      name === "description" ||
      name === "icp" ||
      name === "outcome"
    ) {
      handleChange(name as keyof ResearchIdea, value);
    }
  };

  return (
    <ResearchCardShell
      variant="origin"
      title="Origin Frame"
      subtitle="Describe the problem, who you're serving, and what 'success' means. Helix and Validation Chief will push you until it's sharp."
    >
      <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
        {/* Left: main text inputs */}
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-300">
              Idea in one paragraph
            </label>
            <textarea
              name="description"
              rows={3}
              value={safeIdea.description}
              onChange={onText}
              placeholder="Describe what you want to build as if you're explaining it to a sharp but busy founder..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs text-sky-50 outline-none placeholder:text-slate-500 focus:border-sky-400"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-300">
                Who is this for? (ICP)
              </label>
              <input
                name="icp"
                value={safeIdea.icp}
                onChange={onText}
                placeholder="e.g. SaaS founders doing $1–10k MRR..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs text-sky-50 outline-none placeholder:text-slate-500 focus:border-sky-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-300">
                Title
              </label>
              <input
                name="title"
                value={safeIdea.title}
                onChange={onText}
                placeholder="Short title for your idea"
                className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs text-sky-50 outline-none placeholder:text-slate-500 focus:border-sky-400"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-300">
              What does “success” look like?
            </label>
            <textarea
              name="outcome"
              rows={2}
              value={safeIdea.outcome}
              onChange={onText}
              placeholder="In 12–18 months, what should be true for you to call this a win?"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs text-sky-50 outline-none placeholder:text-slate-500 focus:border-sky-400"
            />
          </div>
        </div>

        {/* Right: constraints & market type */}
        <div className="space-y-3 rounded-2xl border border-sky-500/40 bg-slate-950/70 p-3">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-300">
            Reality Box
          </div>
          <p className="text-[10px] text-slate-300">
            Be honest about your constraints. The entire lab (scores, synthesis,
            blueprint) uses this box to stay realistic and ruthless.
          </p>

          <div className="grid gap-2 text-[10px]">
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-200">Time horizon</span>
              </div>
              <div className="flex gap-2">
                {[
                  { label: "3 months", value: 3 },
                  { label: "6 months", value: 6 },
                  { label: "12 months", value: 12 },
                ].map(({ label, value }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      handleConstraintChange("timeHorizonMonths", value)
                    }
                    className={
                      "flex-1 rounded-full border px-2 py-1 text-[10px] transition " +
                      (safeIdea.constraints?.timeHorizonMonths === value
                        ? "border-sky-400 bg-sky-500/20 text-sky-100"
                        : "border-slate-700 bg-slate-950/60 text-slate-300 hover:border-sky-500/60")
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-200">Team shape</span>
              <div className="flex gap-2">
                {[
                  { label: "Solo", value: "solo" },
                  { label: "Duo", value: "duo" },
                  { label: "Small", value: "small" },
                ].map(({ label, value }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleConstraintChange("teamSize", value)}
                    className={
                      "flex-1 rounded-full border px-2 py-1 text-[10px] transition " +
                      (safeIdea.constraints?.teamSize === value
                        ? "border-sky-400 bg-sky-500/20 text-sky-100"
                        : "border-slate-700 bg-slate-950/60 text-slate-300 hover:border-sky-500/60")
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-200">Monthly budget (USD)</span>
              <input
                type="number"
                value={safeIdea.constraints?.monthlyBudgetUsd ?? ""}
                onChange={(e) => {
                  const val = e.target.value
                    ? parseInt(e.target.value, 10)
                    : null;
                  handleConstraintChange("monthlyBudgetUsd", val);
                }}
                placeholder="e.g. 500"
                className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-[10px] text-sky-50 outline-none placeholder:text-slate-500 focus:border-sky-400"
              />
            </div>

            <div className="space-y-1">
              <span className="text-slate-200">Market type</span>
              <select
                value={safeIdea.marketType || "smb"}
                onChange={(e) =>
                  handleChange("marketType", e.target.value as any)
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-[10px] text-slate-100 outline-none focus:border-sky-400"
              >
                <option value="smb">SMB / B2B</option>
                <option value="consumer">Consumer</option>
                <option value="prosumer">Prosumer / Creator</option>
                <option value="enterprise">Enterprise</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
          </div>

          <p className="mt-1 text-[9px] text-slate-500">
            These constraints feed into Quantum Insight, Synthesis,
            Buildability, and Blueprint phasing so the plan matches your real
            life, not fantasy.
          </p>
        </div>
      </div>
    </ResearchCardShell>
  );
}

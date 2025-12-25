// src/components/growth/GrowthMasterbrainPanel.tsx
"use client";

import { useEffect, useState } from "react";
import type {
  GrowthMasterbrainInput,
  GrowthMasterbrainOutput,
  GrowthSkill,
} from "@/lib/growth/types";

type Props = {
  input?: GrowthMasterbrainInput | null;
  masterbrain: GrowthMasterbrainOutput | null;
  onMasterbrainChangeAction: (m: GrowthMasterbrainOutput | null) => void;
  onInputChangeAction: (input: GrowthMasterbrainInput | null) => void;
  onStepChangeAction: (step: 1 | 2 | 3) => void;
};

const defaultInput: GrowthMasterbrainInput = {
  productType: "saas",
  icpDescription: "",
  pricePoint: "",
  currentStage: "pre-launch",
  currentMRR: undefined,
  timePerWeekHours: 15,
  budgetPerMonth: "0",
  skills: [],
  constraints: "",
};

export default function GrowthMasterbrainPanel({
  input,
  masterbrain,
  onMasterbrainChangeAction,
  onInputChangeAction,
  onStepChangeAction,
}: Props) {
  const [form, setForm] = useState<GrowthMasterbrainInput>(
    input ?? defaultInput
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial sync so other engines (e.g. DNA engine) can see the current input
  useEffect(() => {
    onInputChangeAction(form);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runMasterbrain = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/growth/masterbrain", {
        method: "POST",
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Failed to compute Growth Masterbrain");
      }
      const data = (await res.json()) as GrowthMasterbrainOutput;
      onMasterbrainChangeAction(data);
      onInputChangeAction(form); // keep input state in sync for DNA engine, etc.
      onStepChangeAction(2);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="growth-step-1"
      className="rounded-2xl bg-gradient-to-br from-sky-50 via-emerald-50/60 to-slate-50 p-5 shadow-sm border border-emerald-100/60"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-900/90 px-3 py-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
              STEP 1 · GROWTH MASTERBRAIN
            </span>
            <span className="h-1 w-1 rounded-full bg-emerald-300" />
          </div>
          <h2 className="mt-2 text-lg font-semibold text-slate-900">
            Diagnose your true growth archetype.
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            Tell the OS who you serve, what you sell, and your constraints. It
            will choose one primary engine, north-star metric, and weekly target
            that actually fits your life.
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-700">
              Product type
            </label>
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800"
              value={form.productType}
              onChange={(e) =>
                setForm((f) => {
                  const next: GrowthMasterbrainInput = {
                    ...f,
                    productType: e.target.value as any,
                  };
                  onInputChangeAction(next);
                  return next;
                })
              }
            >
              <option value="saas">B2B / SaaS</option>
              <option value="service">Service / Agency</option>
              <option value="creator">Creator / Info</option>
              <option value="tool">Tool / Plugin</option>
              <option value="community">Community</option>
              <option value="other">Other / Hybrid</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700">
              ICP (who exactly is this for?)
            </label>
            <textarea
              rows={3}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800"
              placeholder="e.g. Solo SaaS founders doing $1–10k MRR who hate cold outbound but can write content..."
              value={form.icpDescription}
              onChange={(e) =>
                setForm((f) => {
                  const next: GrowthMasterbrainInput = {
                    ...f,
                    icpDescription: e.target.value,
                  };
                  onInputChangeAction(next);
                  return next;
                })
              }
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700">
              Price point / monetization shape
            </label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800"
              placeholder="e.g. ₹2,999/mo subscription, or ₹25,000 one-time"
              value={form.pricePoint}
              onChange={(e) =>
                setForm((f) => {
                  const next: GrowthMasterbrainInput = {
                    ...f,
                    pricePoint: e.target.value,
                  };
                  onInputChangeAction(next);
                  return next;
                })
              }
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700">
                Time per week (hours)
              </label>
              <input
                type="number"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800"
                value={form.timePerWeekHours}
                onChange={(e) =>
                  setForm((f) => {
                    const next: GrowthMasterbrainInput = {
                      ...f,
                      timePerWeekHours: Number(e.target.value || 0),
                    };
                    onInputChangeAction(next);
                    return next;
                  })
                }
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700">
                Budget per month (₹ or $)
              </label>
              <input
                type="number"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800"
                value={form.budgetPerMonth}
                onChange={(e) =>
                  setForm((f) => {
                    const next: GrowthMasterbrainInput = {
                      ...f,
                      budgetPerMonth: e.target.value || "0",
                    };
                    onInputChangeAction(next);
                    return next;
                  })
                }
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700">
              Skills (comma separated)
            </label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800"
              placeholder="e.g. cold DM, design, long-form writing, video"
              onChange={(e) =>
                setForm((f) => {
                  const next: GrowthMasterbrainInput = {
                    ...f,
                    skills: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean) as GrowthSkill[],
                  };
                  onInputChangeAction(next);
                  return next;
                })
              }
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700">
              Constraints (brutally honest)
            </label>
            <textarea
              rows={2}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800"
              placeholder="e.g. introvert, hate video, small audience, no ads budget, doing this on nights..."
              value={form.constraints}
              onChange={(e) =>
                setForm((f) => {
                  const next: GrowthMasterbrainInput = {
                    ...f,
                    constraints: e.target.value,
                  };
                  onInputChangeAction(next);
                  return next;
                })
              }
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-slate-500">
          Growth Masterbrain will choose ONE primary engine, a north-star
          metric, and a weekly target that respects your constraints.
        </div>
        <button
          onClick={runMasterbrain}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-4 py-2 text-xs font-semibold text-emerald-50 shadow-sm hover:bg-emerald-800 disabled:opacity-60"
        >
          {loading ? "Thinking like a CMO..." : "Run Growth Masterbrain"}
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}

      {masterbrain && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-white/70 p-4 text-xs text-slate-800">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
              Primary Engine: {masterbrain.primaryEngine.toUpperCase()}
            </span>
            {masterbrain.secondaryEngine && (
              <span className="inline-flex items-center rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-800">
                Secondary: {masterbrain.secondaryEngine.toUpperCase()}
              </span>
            )}
          </div>
          <p className="font-semibold text-slate-900">
            Archetype: {masterbrain.growthArchetype.label}
          </p>
          <p className="mt-1 text-[11px] text-slate-700">
            {masterbrain.growthArchetype.description}
          </p>
          <p className="mt-2 text-[11px]">
            <span className="font-semibold">North star:</span>{" "}
            {masterbrain.northStarMetric} —{" "}
            <span className="font-medium text-emerald-800">
              {masterbrain.weeklyTarget}
            </span>
          </p>
          <p className="mt-2 text-[11px]">
            <span className="font-semibold">Threat radar:</span>{" "}
            {masterbrain.threatRadar.join(" · ")}
          </p>
          <p className="mt-1 text-[11px]">
            <span className="font-semibold">Moat map:</span>{" "}
            {masterbrain.moatMap.join(" · ")}
          </p>
          <p className="mt-2 text-[11px] text-slate-700">{masterbrain.notes}</p>
        </div>
      )}
    </section>
  );
}

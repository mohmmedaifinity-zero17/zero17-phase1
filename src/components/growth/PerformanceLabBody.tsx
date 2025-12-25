// src/components/growth/PerformanceLabBody.tsx
"use client";

import { useState } from "react";
import {
  LineChart,
  Sparkles,
  Loader2,
  Target,
  Rocket,
  SplitSquareHorizontal,
} from "lucide-react";
import {
  useGrowthConfig,
  GrowthGoal,
  PlanDay,
} from "../../../components/growth/GrowthContext";

type AngleResponse = {
  ok: boolean;
  angles?: {
    clarity: string;
    premium: string;
    bold: string;
    contrarian: string;
  };
  error?: string;
};

type PlanResponse = {
  ok: boolean;
  plan?: PlanDay[];
  error?: string;
};

const GOALS: GrowthGoal[] = [
  "Awareness",
  "Leads",
  "Sales",
  "Retention",
  "Activation",
];

export function PerformanceLabBody() {
  const { config, setConfig } = useGrowthConfig();

  const [anglesLoading, setAnglesLoading] = useState(false);
  const [anglesError, setAnglesError] = useState<string | null>(null);

  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  async function handleGenerateAngles() {
    try {
      setAnglesLoading(true);
      setAnglesError(null);

      const res = await fetch("/api/z17/growth/angles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: config.goal,
          icp: config.icp,
          offer: config.offer,
          baseAngle: config.primaryAngle,
        }),
      });

      const json = (await res.json()) as AngleResponse;
      if (!json.ok || !json.angles) {
        throw new Error(json.error || "Failed to generate angles");
      }
      setConfig((prev) => ({
        ...prev,
        angles: json.angles,
      }));
    } catch (err: any) {
      setAnglesError(err?.message || "Something went wrong");
    } finally {
      setAnglesLoading(false);
    }
  }

  async function handleGeneratePlan() {
    try {
      setPlanLoading(true);
      setPlanError(null);

      const res = await fetch("/api/z17/growth/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: config.goal,
          icp: config.icp,
          offer: config.offer,
          budget: config.budget,
          metric: config.primaryMetric,
        }),
      });

      const json = (await res.json()) as PlanResponse;
      if (!json.ok || !json.plan) {
        throw new Error(json.error || "Failed to generate plan");
      }
      setConfig((prev) => ({
        ...prev,
        plan: json.plan || null,
      }));
    } catch (err: any) {
      setPlanError(err?.message || "Something went wrong");
    } finally {
      setPlanLoading(false);
    }
  }

  const angles = config.angles;

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <LineChart className="w-4 h-4" />
            <span>Performance Lab</span>
          </div>
          <p className="text-[11px] text-slate-600">
            Paid growth & funnels: turn your offer into a simple 7-day
            performance engine.
          </p>
        </div>
        <button
          onClick={handleGeneratePlan}
          disabled={planLoading}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold bg-black text-white hover:bg-slate-900 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {planLoading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Rocket className="w-3 h-3" />
          )}
          Generate 7-day performance plan
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* LEFT: strategy + funnel + primary angle input */}
        <div className="md:col-span-2 space-y-4">
          {/* Strategy */}
          <section className="z17-card bg-white/85 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-600" />
                <div className="text-sm font-semibold">
                  Performance strategy
                </div>
              </div>
              <div className="text-[11px] text-slate-500">
                Everything here flows into Growth Masterbrain.
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-700">
                  Primary goal
                </label>
                <div className="flex flex-wrap gap-1">
                  {GOALS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          goal: g,
                        }))
                      }
                      className={`px-2 py-1 rounded-full text-[11px] border ${
                        config.goal === g
                          ? "bg-black text-white border-black"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-700">
                  Monthly test budget (₹)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={100}
                    max={50000}
                    step={100}
                    value={config.budget}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        budget: Number(e.target.value),
                      }))
                    }
                    className="w-full"
                  />
                  <div className="text-[11px] font-semibold text-slate-700 min-w-[80px] text-right">
                    ₹{config.budget.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-700">
                  Ideal customer profile (1–2 sentences)
                </label>
                <textarea
                  value={config.icp}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      icp: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-slate-200"
                  placeholder="Example: Solo founders and small teams building AI tools who want launch-ready MVPs without hiring a dev team."
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-700">
                  Performance offer (what we are selling)
                </label>
                <textarea
                  value={config.offer}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      offer: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-slate-200"
                  placeholder="Example: Done-for-you Zero17 build + launch in 14 days for busy founders."
                />
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="block text-[11px] font-semibold text-slate-700">
                Primary success metric
              </label>
              <input
                value={config.primaryMetric}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    primaryMetric: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="Example: Cost per booked demo under ₹800."
              />
            </div>
          </section>

          {/* Funnel sketch */}
          <section className="z17-card bg-white/85 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <SplitSquareHorizontal className="w-4 h-4 text-sky-600" />
                <div className="text-sm font-semibold">Funnel sketch</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white">
                Ad / Post
              </span>
              <span className="h-px w-6 bg-slate-200" />
              <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                Landing
              </span>
              <span className="h-px w-6 bg-slate-200" />
              <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                Lead / Signup
              </span>
              <span className="h-px w-6 bg-slate-200" />
              <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                Activation / Call
              </span>
              <span className="h-px w-6 bg-slate-200" />
              <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                Paid
              </span>
            </div>

            <p className="text-[11px] text-slate-600">
              Every experiment should improve one step of this funnel, not
              create random noise.
            </p>
          </section>

          {/* Primary angle input */}
          <section className="z17-card bg-white/85 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <div className="text-sm font-semibold">Ad angle workspace</div>
              </div>
              <div className="text-[11px] text-slate-500">
                Start with your best guess – we&apos;ll mutate it.
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="block text-[11px] font-semibold text-slate-700">
                Primary angle (1-sentence hook)
              </label>
              <textarea
                value={config.primaryAngle}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    primaryAngle: e.target.value,
                  }))
                }
                rows={2}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="Example: Launch an AI-powered MVP in 7 days without hiring a single engineer."
              />
            </div>

            <button
              type="button"
              onClick={handleGenerateAngles}
              disabled={anglesLoading || !config.primaryAngle.trim()}
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold bg-black text-white hover:bg-slate-900 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {anglesLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
              Make this 10× better (Angle Mutator)
            </button>

            {anglesError && (
              <div className="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                {anglesError}
              </div>
            )}
          </section>
        </div>

        {/* RIGHT: angle variants + 7-day plan */}
        <div className="space-y-4">
          {/* Angle mutator output */}
          <section className="z17-card bg-white/85 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <div className="text-sm font-semibold">Angle Mutator</div>
              </div>
              <div className="text-[11px] text-slate-500">
                Pick one angle per channel.
              </div>
            </div>

            {!angles ? (
              <p className="text-[11px] text-slate-500">
                Paste your best attempt at a hook and click{" "}
                <span className="font-semibold">Make this 10× better</span> to
                see clarity, premium, bold and contrarian variants here.
              </p>
            ) : (
              <div className="space-y-2 text-[11px]">
                <AngleCard
                  label="Clarity (for cold traffic)"
                  text={angles.clarity}
                />
                <AngleCard
                  label="Premium (for high-ticket / founders)"
                  text={angles.premium}
                />
                <AngleCard
                  label="Bold (for social + short-form)"
                  text={angles.bold}
                />
                <AngleCard
                  label="Contrarian (for X / thought-pieces)"
                  text={angles.contrarian}
                />
              </div>
            )}
          </section>

          {/* 7-day performance plan */}
          <section className="z17-card bg-white/85 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <LineChart className="w-4 h-4 text-emerald-600" />
                <div className="text-sm font-semibold">
                  7-day performance plan
                </div>
              </div>
              <div className="text-[11px] text-slate-500">
                This powers 7-Day Sprint Engine.
              </div>
            </div>

            {planLoading && (
              <div className="flex items-center gap-2 text-[11px] text-slate-600">
                <Loader2 className="w-3 h-3 animate-spin" />
                Generating sprint plan…
              </div>
            )}

            {planError && (
              <div className="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                {planError}
              </div>
            )}

            {!planLoading && !config.plan && !planError && (
              <p className="text-[11px] text-slate-500">
                Click{" "}
                <span className="font-semibold">
                  Generate 7-day performance plan
                </span>{" "}
                after setting goal, ICP, offer and budget. The Sprint Engine
                will use this automatically.
              </p>
            )}

            {config.plan && !planLoading && (
              <div className="space-y-2 text-[11px]">
                {config.plan.map((day) => (
                  <div
                    key={day.day}
                    className="rounded-xl border bg-white px-3 py-2 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold">
                        Day {day.day}: {day.title}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {day.channels.map((ch) => (
                          <span
                            key={ch}
                            className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200"
                          >
                            {ch}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600">{day.summary}</p>
                    <div className="text-[10px] text-slate-500">
                      Focus metric:{" "}
                      <span className="font-semibold">{day.metric}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function AngleCard({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-xl border bg-white px-3 py-2">
      <div className="text-[11px] font-semibold mb-1">{label}</div>
      <p className="text-[11px] text-slate-700">{text}</p>
    </div>
  );
}

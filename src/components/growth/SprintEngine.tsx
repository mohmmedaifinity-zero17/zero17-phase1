// src/components/growth/SprintEngine.tsx
"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CalendarDays, Rocket, Zap, Users } from "lucide-react";
import { useGrowthConfig, PlanDay } from "./GrowthContext";

type SprintDay = PlanDay & {
  theme: string;
};

export function SprintEngine() {
  const { config } = useGrowthConfig();

  const days: SprintDay[] = useMemo(() => {
    const basePlan =
      config.plan && config.plan.length > 0
        ? config.plan
        : buildDefaultPlan(config.offer, config.icp, config.primaryMetric);

    const themes = [
      "Offer & ICP",
      "Proof & social",
      "Traffic burst",
      "Angle mutation",
      "Conversion tuning",
      "Moat building",
      "Review & reset",
    ];

    return basePlan.slice(0, 7).map((d, idx) => ({
      ...d,
      theme: themes[idx] || "Experiment",
    }));
  }, [config.plan, config.offer, config.icp, config.primaryMetric]);

  return (
    <section className="z17-card bg-white/90 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-emerald-600" />
          <div className="text-sm font-semibold">7-Day Growth Sprint</div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          <Rocket className="w-3 h-3" />1 focused move per day, not 100 random
          tactics.
        </div>
      </div>

      <p className="text-[11px] text-slate-600">
        Masterbrain + Performance Lab compress everything into a tight 7-day
        sprint. Each day has a clear theme, a concrete action and a metric you
        can measure.
      </p>

      <div className="grid md:grid-cols-2 gap-3 text-[11px] mt-2">
        {days.map((day) => (
          <div
            key={day.day}
            className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 space-y-1"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="font-semibold">
                Day {day.day}: {day.title}
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 text-white px-2 py-0.5 text-[10px]">
                <Zap className="w-3 h-3" />
                {day.theme}
              </span>
            </div>
            <p className="text-slate-600">{day.summary}</p>
            <div className="flex items-center justify-between gap-2 text-[10px] text-slate-500">
              <span>Focus metric: {day.metric}</span>
              <Link
                href="/agents"
                className="inline-flex items-center gap-1 rounded-full bg-white border border-slate-200 px-2 py-0.5 hover:bg-slate-100"
              >
                <Users className="w-3 h-3" />
                Assign to agent
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function buildDefaultPlan(
  offer: string,
  icp: string,
  metric: string
): PlanDay[] {
  const metricLabel = metric || "your primary metric";
  const who = icp || "your ideal customers";
  const what = offer || "your core offer";

  return [
    {
      day: 1,
      title: "Sharpen offer + ICP",
      summary: `Clarify who you serve (${who}) and why ${what} is a no-brainer.`,
      channels: ["Docs"],
      metric: "Clarity score from 3 people",
    },
    {
      day: 2,
      title: "Publish 1 proof asset",
      summary:
        "Create a simple case study, demo or before/after walkthrough and post it publicly.",
      channels: ["LinkedIn", "X"],
      metric: "Number of meaningful replies",
    },
    {
      day: 3,
      title: "First traffic spike",
      summary:
        "Run a micro-campaign (organic or paid) to stress-test your landing page.",
      channels: ["Ads", "Social"],
      metric: metricLabel,
    },
    {
      day: 4,
      title: "Mutate angles",
      summary:
        "Use the Angle Mutator to test 3–4 different hooks across your best channel.",
      channels: ["Ads", "Social"],
      metric: "Best-performing angle CTR",
    },
    {
      day: 5,
      title: "Tighten conversion",
      summary:
        "Fix the biggest friction on your landing / booking flow based on real user feedback.",
      channels: ["Landing"],
      metric: "Signup / booking rate",
    },
    {
      day: 6,
      title: "Lock in a moat",
      summary:
        "Add one feature, guarantee or proof element that makes your offer hard to copy.",
      channels: ["Product", "Offer"],
      metric: "Qualitative feedback from 3 ICPs",
    },
    {
      day: 7,
      title: "Retro & next sprint",
      summary:
        "Review the week, log learnings in Growth OS and schedule next week’s experiments.",
      channels: ["Docs"],
      metric: "Number of clear learnings",
    },
  ];
}

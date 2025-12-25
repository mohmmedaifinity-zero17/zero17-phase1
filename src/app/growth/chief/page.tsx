// src/app/growth/chief/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Brain,
  LineChart,
  Sparkles,
  Users,
  ArrowLeft,
  Target,
  Rocket,
} from "lucide-react";

type PlanDay = {
  day: number;
  title: string;
  summary: string;
  channels: string[];
  metric: string;
};

type PerfConfig = {
  goal: string;
  icp: string;
  offer: string;
  budget: number;
  metric: string;
  updatedAt: string;
  lastPlan?: PlanDay[];
};

export default function GrowthChiefPage() {
  const [config, setConfig] = useState<PerfConfig | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("z17_perfConfig");
      if (!raw) return;
      const parsed = JSON.parse(raw) as PerfConfig;
      setConfig(parsed);
    } catch {
      // ignore parse errors
    }
  }, []);

  const hasPlan = !!config?.lastPlan && config.lastPlan.length > 0;

  return (
    <div className="min-h-[calc(100vh-56px)]">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/growth"
            className="inline-flex items-center gap-1 text-xs text-slate-200 hover:text-white"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Growth OS
          </Link>
          <div className="text-[11px] uppercase text-slate-100">
            Growth Chief • Console
          </div>
        </div>

        {/* Hero card */}
        <section className="rounded-3xl bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 text-white px-5 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide opacity-80">
                Zero17 • Growth Chief
              </div>
              <div className="text-lg font-semibold mt-1">
                Your personal VP of Growth, watching every move.
              </div>
              <p className="text-[11px] mt-2 text-purple-50 max-w-xl">
                Growth Chief reads your Performance Lab setup and turns it into
                one concrete move for today, one for this week and one for the
                next 30 days. No dashboards, just decisions.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 text-right">
            <Link
              href="/growth/performance"
              className="inline-flex items-center gap-2 rounded-full bg-white text-purple-700 px-3 py-1.5 text-[11px] font-semibold shadow-sm hover:bg-purple-50"
            >
              <LineChart className="w-3 h-3" />
              Open Performance Lab
            </Link>
            <Link
              href="/agents"
              className="inline-flex items-center gap-2 rounded-full bg-purple-900/60 text-purple-50 px-3 py-1.5 text-[11px] font-semibold hover:bg-purple-900/80 border border-white/20"
            >
              <Users className="w-3 h-3" />
              Open Agent hub
            </Link>
            <div className="text-[10px] text-purple-100 max-w-xs">
              Later, agents will execute parts of the plan automatically. For
              now, this console shows you exactly what to do next.
            </div>
          </div>
        </section>

        {/* Main content */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* LEFT: current configuration */}
          <div className="md:col-span-2 space-y-4">
            <section className="z17-card bg-white/90 p-4 space-y-2">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-600" />
                  <div className="text-sm font-semibold">
                    Current growth configuration
                  </div>
                </div>
                <Link
                  href="/growth/performance"
                  className="text-[11px] text-slate-500 hover:text-black"
                >
                  Edit in Performance Lab →
                </Link>
              </div>

              {!config ? (
                <p className="text-[11px] text-slate-600">
                  Growth Chief doesn&apos;t see a Performance Lab setup yet.
                  Open{" "}
                  <span className="font-semibold">
                    Growth → Performance Lab
                  </span>
                  , define your goal, ICP, offer and budget, then generate a
                  7-day plan. That snapshot will appear here.
                </p>
              ) : (
                <div className="grid md:grid-cols-2 gap-3 text-[11px] text-slate-700">
                  <div className="space-y-1">
                    <div className="font-semibold text-slate-900">Goal</div>
                    <p>{config.goal}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold text-slate-900">
                      Primary metric
                    </div>
                    <p>{config.metric}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold text-slate-900">
                      Ideal customer
                    </div>
                    <p>{config.icp}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold text-slate-900">
                      Offer in play
                    </div>
                    <p>{config.offer}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold text-slate-900">
                      Monthly test budget
                    </div>
                    <p>₹{config.budget.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold text-slate-900">
                      Last updated
                    </div>
                    <p>{new Date(config.updatedAt).toLocaleString() || "—"}</p>
                  </div>
                </div>
              )}
            </section>

            {/* Day-by-day plan summary */}
            <section className="z17-card bg-white/90 p-4 space-y-2">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-emerald-600" />
                  <div className="text-sm font-semibold">7-day sprint map</div>
                </div>
                <div className="text-[11px] text-slate-500">
                  Today, this week, this month.
                </div>
              </div>

              {!config || !hasPlan ? (
                <p className="text-[11px] text-slate-600">
                  No saved plan yet. Generate a 7-day plan in Performance Lab so
                  Growth Chief can turn it into concrete moves.
                </p>
              ) : (
                <div className="space-y-2 text-[11px] text-slate-700">
                  {config.lastPlan!.slice(0, 3).map((day) => (
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
                      <p className="text-[11px] text-slate-600">
                        {day.summary}
                      </p>
                      <div className="text-[10px] text-slate-500">
                        Focus metric:{" "}
                        <span className="font-semibold">{day.metric}</span>
                      </div>
                    </div>
                  ))}

                  <p className="text-[10px] text-slate-500">
                    Full 7-day details live in{" "}
                    <Link
                      href="/growth/performance"
                      className="underline underline-offset-2"
                    >
                      Performance Lab
                    </Link>
                    .
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* RIGHT: Next best moves + agents suggestion */}
          <div className="space-y-4">
            <section className="z17-card bg-white/90 p-4 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <div className="text-sm font-semibold">Next best moves</div>
              </div>

              {!config || !hasPlan ? (
                <ul className="text-[11px] text-slate-700 list-disc pl-4 space-y-1">
                  <li>Open Growth → Performance Lab.</li>
                  <li>
                    Define{" "}
                    <span className="font-semibold">goal + ICP + offer</span>.
                  </li>
                  <li>
                    Click{" "}
                    <span className="font-semibold">
                      Generate 7-day performance plan
                    </span>
                    .
                  </li>
                  <li>
                    Come back here – Growth Chief will turn that into a daily
                    checklist.
                  </li>
                </ul>
              ) : (
                <ul className="text-[11px] text-slate-700 list-disc pl-4 space-y-1">
                  <li>
                    <span className="font-semibold">Today:</span>{" "}
                    {config.lastPlan![0]?.title ||
                      "Run the first item of your plan in Performance Lab."}
                  </li>
                  <li>
                    <span className="font-semibold">This week:</span> complete
                    at least 4 of the 7 planned moves and log basic results.
                  </li>
                  <li>
                    <span className="font-semibold">Next 30 days:</span> repeat
                    the 7-day loop 3–4 times, each time attacking a different
                    bottleneck (offer, angle, audience, follow-up).
                  </li>
                </ul>
              )}
            </section>

            <section className="z17-card bg-white/90 p-4 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-purple-600" />
                <div className="text-sm font-semibold">
                  Recommended agent setup
                </div>
              </div>
              <p className="text-[11px] text-slate-700 mb-1">
                As you formalise the agent system, Growth Chief will suggest a
                minimal team that can run most of this plan for you:
              </p>
              <ul className="text-[11px] text-slate-700 list-disc pl-4 space-y-1">
                <li>1 × Performance Agent (ads + analytics)</li>
                <li>1 × Content Agent (threads, posts, emails)</li>
                <li>1 × Outreach Agent (DMs, follow-ups, call booking)</li>
              </ul>
              <Link
                href="/agents"
                className="inline-flex items-center gap-1 mt-2 text-[11px] text-purple-700 font-semibold hover:underline underline-offset-2"
              >
                <Sparkles className="w-3 h-3" />
                Design these agents in the Agent hub →
              </Link>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

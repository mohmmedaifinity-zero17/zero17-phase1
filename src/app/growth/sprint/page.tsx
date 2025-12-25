// src/app/growth/sprint/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Rocket, CheckSquare, Zap } from "lucide-react";

type DayKey = "day1" | "day2" | "day3" | "day4" | "day5" | "day6" | "day7";

type Task = {
  id: string;
  label: string;
};

const SPRINT_TASKS: Record<DayKey, Task[]> = {
  day1: [
    { id: "d1_t1", label: "Sharpen offer (ICP + problem + promise)" },
    { id: "d1_t2", label: "Run Masterbrain once" },
  ],
  day2: [
    { id: "d2_t1", label: "Create 1–2 proof pieces (screenshots, mini case)" },
    { id: "d2_t2", label: "Draft 1 short social post" },
  ],
  day3: [
    { id: "d3_t1", label: "Do 10–20 warm DMs / emails" },
    { id: "d3_t2", label: "Log replies in your notes" },
  ],
  day4: [
    { id: "d4_t1", label: "Run 1 small experiment (landing, DM script etc.)" },
    { id: "d4_t2", label: "Note what looked promising" },
  ],
  day5: [
    { id: "d5_t1", label: "Double down on the best mini-win" },
    { id: "d5_t2", label: "Capture proof (screenshot or quote)" },
  ],
  day6: [
    { id: "d6_t1", label: "Clean up your main asset (page/profile)" },
    { id: "d6_t2", label: "Prepare 1 launch or mini-drop" },
  ],
  day7: [
    { id: "d7_t1", label: "Review week: what worked / failed" },
    { id: "d7_t2", label: "Ask Growth Chief for next week’s focus" },
  ],
};

export default function SprintPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  function toggle(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="min-h-[calc(100vh-56px)]">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
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
            <Rocket className="w-5 h-5 text-emerald-500" />
            <h1 className="text-xl font-semibold">7-Day Sprint Engine</h1>
          </div>
          <p className="text-[11px] text-slate-600 max-w-3xl">
            Simple weekly plan: each day has 1–2 tiny tasks. If you just tick
            these boxes, you are doing more real growth work than 90% of
            startups.
          </p>
        </section>

        {/* Quick legend */}
        <section className="grid md:grid-cols-3 gap-2 text-[11px]">
          <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-2">
            <div className="font-semibold text-emerald-700 mb-1">
              How to use
            </div>
            <p className="text-slate-600">
              Each day: do the small tasks, tick the boxes. It&apos;s okay if
              you miss a day — just continue.
            </p>
          </div>
          <div className="rounded-2xl bg-sky-50 border border-sky-100 p-2">
            <div className="font-semibold text-sky-700 mb-1">Best order</div>
            <p className="text-slate-600">
              Day 1–2 = offer + proof. Day 3–4 = outreach + experiments. Day 5–7
              = double down + clean up + review.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-2 text-slate-50">
            <div className="font-semibold text-emerald-300 mb-1">
              Optional: agents
            </div>
            <p className="text-slate-100">
              If one task repeats every week (like DMs), promote it to an Agent
              employee later.
            </p>
          </div>
        </section>

        {/* Days grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {(
            [
              [
                "day1",
                "Day 1 — Foundation",
                "bg-emerald-50 border-emerald-100",
              ],
              ["day2", "Day 2 — Proof", "bg-sky-50 border-sky-100"],
              ["day3", "Day 3 — Outreach", "bg-amber-50 border-amber-100"],
              ["day4", "Day 4 — Experiment", "bg-violet-50 border-violet-100"],
              ["day5", "Day 5 — Double down", "bg-lime-50 border-lime-100"],
              ["day6", "Day 6 — Polish", "bg-slate-50 border-slate-200"],
              [
                "day7",
                "Day 7 — Review",
                "bg-slate-900 border-slate-800 text-white",
              ],
            ] as const
          ).map(([key, title, bg]) => {
            const dayKey = key as DayKey;
            const tasks = SPRINT_TASKS[dayKey];

            const dark = bg.includes("slate-900");

            return (
              <section
                key={dayKey}
                className={`rounded-2xl border ${bg} p-4 space-y-2`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <CheckSquare
                    className={`w-4 h-4 ${
                      dark ? "text-emerald-300" : "text-emerald-600"
                    }`}
                  />
                  <div
                    className={`text-sm font-semibold ${
                      dark ? "text-slate-50" : "text-slate-800"
                    }`}
                  >
                    {title}
                  </div>
                </div>
                <ul className="space-y-1">
                  {tasks.map((task) => (
                    <li key={task.id} className="flex items-start gap-2">
                      <button
                        type="button"
                        onClick={() => toggle(task.id)}
                        className={`mt-[1px] w-3 h-3 rounded-[4px] border flex items-center justify-center ${
                          checked[task.id]
                            ? dark
                              ? "bg-emerald-400 border-emerald-400"
                              : "bg-emerald-500 border-emerald-500"
                            : dark
                              ? "border-slate-500 bg-slate-900"
                              : "border-slate-300 bg-white"
                        }`}
                      >
                        {checked[task.id] && (
                          <span className="block w-2 h-2 rounded-[3px] bg-white" />
                        )}
                      </button>
                      <span
                        className={`text-[11px] leading-snug ${
                          dark ? "text-slate-50" : "text-slate-700"
                        }`}
                      >
                        {task.label}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className={`mt-1 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold ${
                    dark
                      ? "bg-emerald-400 text-slate-900 hover:bg-emerald-300"
                      : "bg-slate-900 text-white hover:bg-black"
                  }`}
                >
                  <Zap className="w-3 h-3" />
                  Make this day 10× stronger
                </button>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

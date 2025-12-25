// src/app/growth/performance/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  LineChart,
  Target,
  DollarSign,
  Rocket,
  Loader2,
} from "lucide-react";

type PerformanceResponse = {
  ok: boolean;
  summary?: string;
  channels?: string[];
  dailyPlan?: string[];
  risks?: string[];
  angles?: string[];
};

export default function PerformancePage() {
  const [goal, setGoal] = useState("");
  const [budget, setBudget] = useState("");
  const [primaryChannel, setPrimaryChannel] = useState("meta");
  const [secondaryChannel, setSecondaryChannel] = useState("none");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PerformanceResponse | null>(null);

  async function runPlan() {
    if (!goal.trim() || !budget.trim()) return;
    try {
      setLoading(true);
      setResult(null);

      const res = await fetch("/api/z17/growth/performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal,
          budget,
          primaryChannel,
          secondaryChannel,
        }),
      });

      const json = (await res.json()) as PerformanceResponse;
      setResult(json || null);
    } catch {
      setResult({
        ok: false,
        summary:
          "Something went wrong while building your performance plan. Try again later.",
      });
    } finally {
      setLoading(false);
    }
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
            <LineChart className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-semibold">Performance Lab</h1>
          </div>
          <p className="text-[11px] text-slate-600 max-w-3xl">
            Tell Zero17 your simple goal, budget and channels. It returns a
            small, clear plan: how much to spend, what creatives to run and what
            &quot;good&quot; results look like.
          </p>
        </section>

        {/* Inputs */}
        <div className="grid md:grid-cols-2 gap-6">
          <section className="z17-card bg-white/90 p-4 space-y-3">
            <div className="space-y-1 text-[11px]">
              <label className="font-semibold text-slate-700 flex items-center gap-1">
                <Target className="w-3 h-3 text-emerald-500" />
                What is your main goal?
              </label>
              <textarea
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-emerald-100"
                placeholder="Example: Get 30 demo calls or 50 trials in the next 30 days."
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
            </div>

            <div className="space-y-1 text-[11px]">
              <label className="font-semibold text-slate-700 flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-emerald-500" />
                What is your total budget for this test?
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-emerald-100"
                placeholder="Example: ₹20,000 or $500"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>

            <div className="space-y-1 text-[11px]">
              <label className="font-semibold text-slate-700">
                Pick your main channel
              </label>
              <div className="flex flex-wrap gap-1">
                {[
                  ["meta", "Instagram / Facebook"],
                  ["google", "Google search"],
                  ["linkedin", "LinkedIn"],
                  ["tiktok", "TikTok / Reels"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPrimaryChannel(key)}
                    className={`px-2 py-1 rounded-full text-[11px] border ${
                      primaryChannel === key
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1 text-[11px]">
              <label className="font-semibold text-slate-700">
                Optional: second channel
              </label>
              <div className="flex flex-wrap gap-1">
                {[
                  ["none", "None"],
                  ["email", "Email"],
                  ["dm", "DM / outbound"],
                  ["retarget", "Retargeting only"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSecondaryChannel(key)}
                    className={`px-2 py-1 rounded-full text-[11px] border ${
                      secondaryChannel === key
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              disabled={loading || !goal.trim() || !budget.trim()}
              onClick={runPlan}
              className="inline-flex items-center gap-1 rounded-full bg-emerald-500 text-white px-4 py-1.5 text-[11px] font-semibold hover:bg-emerald-600 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Rocket className="w-3 h-3" />
              )}
              Build simple performance plan
            </button>
          </section>

          {/* Output */}
          <section className="z17-card bg-slate-950 text-white p-4 space-y-3">
            <div className="flex items-center gap-2">
              <LineChart className="w-4 h-4 text-emerald-300" />
              <div className="text-sm font-semibold">Your plan</div>
            </div>

            {!result && (
              <p className="text-[11px] text-slate-100">
                After you click the button, Zero17 will show: (1) a simple
                summary, (2) which channels to use, (3) what to do each week,
                and (4) what good numbers look like.
              </p>
            )}

            {result?.summary && (
              <p className="text-[11px] text-slate-50">{result.summary}</p>
            )}

            {result?.channels && result.channels.length > 0 && (
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-emerald-300">
                  Focus channels
                </div>
                <ul className="list-disc pl-4 text-[10px] text-slate-50 space-y-0.5">
                  {result.channels.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {result?.dailyPlan && result.dailyPlan.length > 0 && (
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-sky-300">
                  Weekly routine
                </div>
                <ul className="list-disc pl-4 text-[10px] text-slate-50 space-y-0.5">
                  {result.dailyPlan.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            )}

            {result?.risks && result.risks.length > 0 && (
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-red-300">
                  Risks / watch this
                </div>
                <ul className="list-disc pl-4 text-[10px] text-slate-50 space-y-0.5">
                  {result.risks.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {result?.angles && result.angles.length > 0 && (
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-purple-300">
                  Creative angles to test
                </div>
                <ul className="list-disc pl-4 text-[10px] text-slate-50 space-y-0.5">
                  {result.angles.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

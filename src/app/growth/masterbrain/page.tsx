// src/app/growth/masterbrain/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Brain, Loader2, ClipboardList } from "lucide-react";

type MasterbrainResponse = {
  ok: boolean;
  summary?: string;
  icp?: string;
  stage?: string;
  priorities?: string[];
};

type HelixMovePayload = {
  source: "masterbrain";
  summary: string;
  createdAt: string;
};

function broadcastHelixMove(summary: string) {
  if (typeof window === "undefined") return;
  const payload: HelixMovePayload = {
    source: "masterbrain",
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

export default function MasterbrainPage() {
  const [idea, setIdea] = useState("");
  const [icp, setIcp] = useState("");
  const [stage, setStage] = useState("prelaunch");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MasterbrainResponse | null>(null);

  async function runMasterbrain() {
    if (!idea.trim()) return;
    try {
      setLoading(true);
      setResult(null);

      const res = await fetch("/api/z17/growth/masterbrain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, icp, stage }),
      });

      const json = (await res.json()) as MasterbrainResponse;
      setResult(json || null);

      if (json?.summary) {
        broadcastHelixMove(json.summary.slice(0, 200));
      }
    } catch {
      setResult({
        ok: false,
        summary:
          "Something went wrong while running Masterbrain. Try again in a moment.",
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
            <Brain className="w-5 h-5 text-sky-500" />
            <h1 className="text-xl font-semibold">Growth Masterbrain</h1>
          </div>
          <p className="text-[11px] text-slate-600 max-w-3xl">
            One page of truth for growth. Masterbrain reads your idea, ICP and
            stage, then proposes a brutal, focused growth model with 3–5
            priorities. HELIX and Growth Chief read the same signal so your next
            moves stay aligned.
          </p>
        </section>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Input */}
          <div className="z17-card bg-white/90 p-4 space-y-3">
            <div className="space-y-1 text-[11px]">
              <label className="font-semibold text-slate-700">
                Describe your product or idea
              </label>
              <textarea
                rows={5}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-sky-100"
                placeholder="Example: Zero17 is a founder OS that takes an idea to launch-ready AI MVP + growth engine in days."
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
              />
            </div>

            <div className="space-y-1 text-[11px]">
              <label className="font-semibold text-slate-700">
                Who is your main ICP?
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-sky-100"
                placeholder="Example: Solo AI founders / small SaaS teams / agency owners"
                value={icp}
                onChange={(e) => setIcp(e.target.value)}
              />
            </div>

            <div className="space-y-1 text-[11px]">
              <label className="font-semibold text-slate-700">
                Stage of your product
              </label>
              <div className="flex flex-wrap gap-1">
                {[
                  ["prelaunch", "Pre-launch / idea"],
                  ["beta", "Beta with first users"],
                  ["mrr", "Live with paying users"],
                  ["scale", "Scaling hard"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setStage(key)}
                    className={`px-2 py-1 rounded-full text-[11px] border ${
                      stage === key
                        ? "bg-sky-600 text-white border-sky-600"
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
              disabled={loading || !idea.trim()}
              onClick={runMasterbrain}
              className="inline-flex items-center gap-1 rounded-full bg-sky-500 text-white px-4 py-1.5 text-[11px] font-semibold hover:bg-sky-600 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Brain className="w-3 h-3" />
              )}
              Run Masterbrain
            </button>
          </div>

          {/* Output */}
          <div className="z17-card bg-slate-950 text-white p-4 space-y-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-sky-300" />
              <div className="text-sm font-semibold">Masterbrain model</div>
            </div>

            {!result && (
              <p className="text-[11px] text-slate-100">
                You&apos;ll see a short growth model, ICP snapshot and 3–5
                brutal priorities once you run Masterbrain.
              </p>
            )}

            {result?.summary && (
              <p className="text-[11px] text-slate-50">{result.summary}</p>
            )}

            {result?.icp && (
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-sky-300">
                  ICP focus
                </div>
                <p className="text-[10px] text-slate-50">{result.icp}</p>
              </div>
            )}

            {result?.priorities && result.priorities.length > 0 && (
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-sky-300">
                  Top priorities
                </div>
                <ol className="list-decimal pl-4 text-[10px] text-slate-50 space-y-0.5">
                  {result.priorities.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

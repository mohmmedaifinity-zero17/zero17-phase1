// src/app/growth/oracle/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  AlertTriangle,
  Compass,
} from "lucide-react";

type OracleResponse = {
  ok: boolean;
  opportunities?: string[];
  threats?: string[];
  angles?: string[];
  summary?: string;
};

type HelixMovePayload = {
  source: "oracle";
  summary: string;
  createdAt: string;
};

function broadcastHelixMove(summary: string) {
  if (typeof window === "undefined") return;
  const payload: HelixMovePayload = {
    source: "oracle",
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

export default function OraclePage() {
  const [idea, setIdea] = useState("");
  const [stage, setStage] = useState("prelaunch");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OracleResponse | null>(null);

  async function runOracle() {
    if (!idea.trim()) return;
    try {
      setLoading(true);
      setResult(null);

      const res = await fetch("/api/z17/growth/oracle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, stage }),
      });
      const json = (await res.json()) as OracleResponse;
      setResult(json || null);

      if (json?.summary) {
        broadcastHelixMove(json.summary.slice(0, 200));
      }
    } catch {
      setResult({
        ok: false,
        summary: "Something went wrong while querying the Oracle.",
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
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-semibold">Growth Oracle</h1>
          </div>
          <p className="text-[11px] text-slate-600 max-w-3xl">
            Ask the Oracle to surface hidden opportunities, threats, channels
            and future-proof angles for your product. It behaves like a panel of
            top VCs + operators compressed into a single answer.
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
                rows={6}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-amber-100"
                placeholder="Example: Zero17 is a founder OS that takes an idea to launch-ready AI MVP + growth engine in days."
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
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
              disabled={loading || !idea.trim()}
              onClick={runOracle}
              className="inline-flex items-center gap-1 rounded-full bg-amber-400 text-slate-900 px-4 py-1.5 text-[11px] font-semibold hover:bg-amber-300 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Compass className="w-3 h-3" />
              )}
              Ask the Oracle
            </button>
          </div>

          {/* Output */}
          <div className="z17-card bg-slate-950 text-white p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <div className="text-sm font-semibold">Oracle response</div>
            </div>

            {!result && (
              <p className="text-[11px] text-slate-100">
                You&apos;ll get a short strategic summary, 3–5 opportunities,
                2–3 threats and some future-proof angles once you ask the
                Oracle.
              </p>
            )}

            {result?.summary && (
              <p className="text-[11px] text-slate-50">{result.summary}</p>
            )}

            {result?.opportunities && result.opportunities.length > 0 && (
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-emerald-300">
                  Opportunities
                </div>
                <ul className="list-disc pl-4 text-[10px] text-slate-50 space-y-0.5">
                  {result.opportunities.map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
              </div>
            )}

            {result?.threats && result.threats.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-red-300">
                  <AlertTriangle className="w-3 h-3" />
                  Threats
                </div>
                <ul className="list-disc pl-4 text-[10px] text-slate-50 space-y-0.5">
                  {result.threats.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            )}

            {result?.angles && result.angles.length > 0 && (
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-purple-300">
                  Future-proof angles
                </div>
                <ul className="list-disc pl-4 text-[10px] text-slate-50 space-y-0.5">
                  {result.angles.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

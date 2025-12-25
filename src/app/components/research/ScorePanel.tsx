"use client";
import React, { useState } from "react";
import type { ScoreResponse } from "@/types/slm";

type Props = {
  idea: string;
  persona?: string;
  goal?: string;
  mustHaves?: string[];
};

export default function ScorePanel({ idea, persona, goal, mustHaves }: Props) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ScoreResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runScore() {
    if (!idea || idea.length < 10) {
      setError("Please provide a longer idea (≥ 10 chars).");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/slm/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, persona, goal, mustHaves }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      const j = (await res.json()) as ScoreResponse;
      setData(j);
    } catch (e: any) {
      setError(e.message ?? "Scoring failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border p-4 md:p-6 bg-white/50 dark:bg-zinc-900/40">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-semibold">Smart Scores</h3>
        <button
          onClick={runScore}
          className="px-3 py-2 rounded-lg border text-sm hover:bg-black hover:text-white transition"
          disabled={loading}
        >
          {loading ? "Scoring…" : "Run Score"}
        </button>
      </div>

      {error && (
        <div className="mt-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {!data ? (
        <p className="mt-3 text-sm text-zinc-600">
          Click <b>Run Score</b> to see risk, opportunity, channels, copy
          angles, and more.
        </p>
      ) : (
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card
            title="Risk"
            big={data.scores.risk}
            sub={`Churn: ${data.scores.churnRisk}`}
          />
          <Card
            title="Opportunity"
            big={data.scores.opportunity}
            sub={`TTFV: ${data.scores.ttfvDays} days`}
          />
          <Card
            title="Confidence"
            big={data.scores.confidence}
            sub={data.meta.model}
          />

          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            <Panel title="Channel Guess" items={data.inferences.channelGuess} />
            <Panel title="Copy Angle" items={data.inferences.copyAngle} />
            <Panel title="Pulse" items={data.pulse} />
          </div>

          {(data.redFlags.length > 0 || data.mirror.length > 0) && (
            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              <Panel title="Red Flags" items={data.redFlags} tone="warn" />
              <Panel title="Success-Story Mirror" items={data.mirror} />
            </div>
          )}

          <div className="md:col-span-3 rounded-xl border p-3">
            <div className="text-xs uppercase text-zinc-500 mb-1">
              Explain Why
            </div>
            <div className="text-sm leading-relaxed">{data.rationale}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({
  title,
  big,
  sub,
}: {
  title: string;
  big: number | string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border p-3">
      <div className="text-xs uppercase text-zinc-500">{title}</div>
      <div className="text-2xl font-bold">{big}</div>
      {sub && <div className="text-xs mt-1 text-zinc-500">{sub}</div>}
    </div>
  );
}

function Panel({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone?: "warn" | "default";
}) {
  const base = "rounded-xl border p-3 text-sm leading-relaxed";
  const warn =
    "bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-700";
  const def = "bg-white/40 dark:bg-zinc-900/30";
  return (
    <div className={`${base} ${tone === "warn" ? warn : def}`}>
      <div className="text-xs uppercase text-zinc-500 mb-1">{title}</div>
      {items.length ? (
        <ul className="list-disc pl-5 space-y-1">
          {items.map((x, i) => (
            <li key={`${title}-${i}`}>{x}</li>
          ))}
        </ul>
      ) : (
        <div className="text-zinc-500">—</div>
      )}
    </div>
  );
}

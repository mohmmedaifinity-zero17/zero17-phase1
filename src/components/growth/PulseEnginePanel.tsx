// src/components/growth/PulseEnginePanel.tsx
"use client";

import { useState } from "react";
import type { GrowthSnapshot, PulseEvent } from "@/lib/growth/types";

type Props = {
  snapshot: GrowthSnapshot | null;
  events: PulseEvent[];
  onEventsChangeAction: (events: PulseEvent[]) => void;
  onSnapshotChangeAction: (snap: GrowthSnapshot | null) => void;
  onStepChangeAction: (s: 1 | 2 | 3) => void;
};

export default function PulseEnginePanel({
  snapshot,
  events,
  onEventsChangeAction,
  onSnapshotChangeAction,
  onStepChangeAction,
}: Props) {
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [type, setType] = useState<PulseEvent["type"]>("experiment");
  const [impact, setImpact] = useState<PulseEvent["impact"]>("neutral");

  const addEvent = () => {
    if (!title.trim() || !detail.trim()) return;

    const newEvent: PulseEvent = {
      id: `pulse-${Date.now()}`,
      title: title.trim(),
      detail: detail.trim(),
      type,
      impact,
      createdAt: new Date().toISOString(),
    };

    onEventsChangeAction([newEvent, ...events]);
    setTitle("");
    setDetail("");
  };

  const setFocusFromEvent = (ev: PulseEvent) => {
    // Softly nudge snapshot focus based on an event
    if (!snapshot) return;
    onSnapshotChangeAction({
      ...snapshot,
      focusNarrative: `${snapshot.focusNarrative}\n\nNew pulse: ${ev.title} — ${ev.detail}`,
    });
    onStepChangeAction(3);
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-sky-50/40 to-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-100">
              STEP 3.1 · PULSE & PROOF ENGINE
            </span>
          </div>
          <h3 className="mt-2 text-sm font-semibold text-slate-900">
            Turn your sprint into a living heartbeat instead of a static plan.
          </h3>
          <p className="mt-1 text-[11px] text-slate-600">
            Log real signals — experiments, metric bumps, user stories, good/bad
            news — and let Growth Chief keep a reality-anchored narrative of
            where things truly stand.
          </p>
        </div>
      </div>

      {/* Snapshot summary */}
      {snapshot && (
        <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] text-[11px]">
          <div className="rounded-xl border border-slate-200 bg-white/90 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">
              Current snapshot
            </p>
            <p className="mt-1 text-[10px] font-semibold text-slate-800">
              Stage: {snapshot.buildStageLabel}
            </p>
            <p className="mt-1 text-[10px] text-slate-700">
              Growth temperature:{" "}
              <span className="font-semibold">
                {snapshot.growthTemperature.toUpperCase()}
              </span>
            </p>
            {snapshot.riskFlags.length > 0 && (
              <div className="mt-1">
                <p className="text-[10px] font-semibold text-rose-700">
                  Risk flags
                </p>
                <ul className="mt-0.5 list-disc pl-4 text-[10px] text-slate-700">
                  {snapshot.riskFlags.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
            {snapshot.strengths.length > 0 && (
              <div className="mt-1">
                <p className="text-[10px] font-semibold text-emerald-700">
                  Strengths
                </p>
                <ul className="mt-0.5 list-disc pl-4 text-[10px] text-slate-700">
                  {snapshot.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="mt-2 whitespace-pre-wrap text-[10px] text-slate-700">
              {snapshot.focusNarrative}
            </p>
          </div>

          {/* New event form */}
          <div className="rounded-xl border border-slate-200 bg-white/95 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">
              Log a new pulse
            </p>
            <div className="mt-2 flex flex-col gap-2">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Short title (e.g. 3 new demos booked)"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] text-slate-800 outline-none focus:ring-1 focus:ring-slate-400"
              />
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="What actually happened? Keep it specific."
                rows={3}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] text-slate-800 outline-none focus:ring-1 focus:ring-slate-400"
              />
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={type}
                  onChange={(e) =>
                    setType(e.target.value as PulseEvent["type"])
                  }
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px]"
                >
                  <option value="experiment">Experiment</option>
                  <option value="metric_change">Metric change</option>
                  <option value="user_story">User story</option>
                  <option value="good_news">Good news</option>
                  <option value="bad_news">Bad news</option>
                </select>
                <select
                  value={impact}
                  onChange={(e) =>
                    setImpact(e.target.value as PulseEvent["impact"])
                  }
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px]"
                >
                  <option value="positive">Positive</option>
                  <option value="neutral">Neutral</option>
                  <option value="negative">Negative</option>
                </select>
                <button
                  type="button"
                  onClick={addEvent}
                  className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-slate-50 shadow-sm hover:bg-slate-800"
                >
                  Add pulse event
                </button>
              </div>
              <p className="text-[10px] text-slate-500">
                These entries become the “proof log” Growth Chief uses when
                advising you and when you export updates to investors or
                collaborators.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Event list */}
      {events.length > 0 && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white/95 p-3 text-[11px]">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">
            Recent pulses
          </p>
          <div className="mt-1 max-h-52 space-y-1.5 overflow-y-auto">
            {events.map((ev) => (
              <button
                key={ev.id}
                type="button"
                onClick={() => setFocusFromEvent(ev)}
                className="flex w-full flex-col items-start rounded-lg border border-slate-100 bg-slate-50 px-2 py-1.5 text-left hover:bg-slate-100"
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold text-slate-800">
                    {ev.title}
                  </span>
                  <span className="text-[9px] text-slate-500">
                    {new Date(ev.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="mt-0.5 text-[10px] text-slate-700">{ev.detail}</p>
                <p className="mt-0.5 text-[9px] text-slate-500">
                  {ev.type} · {ev.impact}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

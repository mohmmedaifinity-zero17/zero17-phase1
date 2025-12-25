// src/components/helix/HelixRoot.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useHelix } from "@/lib/helix/context";
import type { HelixLane } from "@/lib/helix/types";
import { Sparkles, Compass, Hammer, Rocket, LineChart, X } from "lucide-react";

const lanes: {
  id: HelixLane;
  label: string;
  icon: React.ComponentType<any>;
}[] = [
  { id: "lab", label: "Research Lab", icon: Compass },
  { id: "builder", label: "Builder Lab", icon: Hammer },
  { id: "launch", label: "Launch Engine", icon: Rocket },
  { id: "growth", label: "Growth OS", icon: LineChart },
];

export default function HelixRoot() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { state, setLane, computeNextAction } = useHelix();

  const nextAction = computeNextAction();

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <>
      {/* Floating Pill */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 h-12 px-4 rounded-full shadow-xl border border-white/30 
          bg-gradient-to-br from-purple-600 via-violet-500 to-fuchsia-500 text-white flex items-center gap-2 
          text-sm font-semibold hover:scale-105 active:scale-95 transition-transform"
      >
        <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
          <Sparkles size={16} />
        </span>
        <span>HELIX</span>
      </button>

      {/* Slide-out Panel */}
      {open && (
        <div className="fixed inset-0 z-40 flex justify-end">
          {/* click-away */}
          <div className="flex-1" onClick={() => setOpen(false)} />

          <aside className="w-full max-w-sm h-full bg-white/95 border-l border-slate-200 shadow-2xl p-5 flex flex-col gap-4">
            {/* Header */}
            <header className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase text-slate-500">
                  Co-founder
                </div>
                <div className="text-lg font-semibold">HELIX Compass</div>
                <div className="text-[11px] text-slate-500">
                  Lane:{" "}
                  <span className="font-semibold">
                    {lanes.find((l) => l.id === state.lane)?.label ??
                      "Research Lab"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-1 hover:bg-slate-100 text-slate-500"
              >
                <X size={16} />
              </button>
            </header>

            {/* Lane selector */}
            <section className="z17-card p-3 space-y-2">
              <div className="text-[11px] uppercase text-slate-500 mb-1">
                Focus lane
              </div>
              <div className="flex flex-wrap gap-2">
                {lanes.map((lane) => {
                  const Icon = lane.icon;
                  const active = lane.id === state.lane;
                  return (
                    <button
                      key={lane.id}
                      onClick={() => {
                        setLane(lane.id);
                        if (lane.id === "lab") go("/lab");
                        if (lane.id === "builder") go("/builder");
                        if (lane.id === "launch") go("/launch");
                        if (lane.id === "growth") go("/growth");
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs flex items-center gap-1 border transition ${
                        active
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <Icon size={14} />
                      <span>{lane.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Next Best Move */}
            <section className="z17-card p-3 space-y-2">
              <div className="text-[11px] uppercase text-slate-500 mb-1">
                Next best move
              </div>
              <div className="text-sm font-semibold">{nextAction.title}</div>
              <p className="text-xs text-slate-600">{nextAction.description}</p>
              <button
                onClick={() => go(nextAction.href)}
                className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium 
                  bg-slate-900 text-white hover:bg-white hover:text-slate-900 hover:border-slate-900 border border-slate-900 transition"
              >
                {nextAction.ctaLabel} →
              </button>
            </section>

            {/* Quick Actions (stubs to be wired later) */}
            <section className="z17-card p-3 space-y-2">
              <div className="text-[11px] uppercase text-slate-500 mb-1">
                Quick actions
              </div>
              <button
                className="w-full text-left text-xs px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50"
                onClick={() => go("/lab")}
              >
                Explain where I am in the flow
              </button>
              <button
                className="w-full text-left text-xs px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50"
                onClick={() => go("/growth/offer")}
              >
                Help me design an offer this week
              </button>
              <button
                className="w-full text-left text-xs px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50"
                onClick={() => go("/builder/arena")}
              >
                Summarize my current build state
              </button>
            </section>

            {/* Footer */}
            <div className="mt-auto text-[10px] text-slate-400">
              Zero17 HELIX v1 • As you wire in real progress markers from Lab /
              Builder / Launch / Growth, this panel will feel like a true
              co-founder watching your pipeline.
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

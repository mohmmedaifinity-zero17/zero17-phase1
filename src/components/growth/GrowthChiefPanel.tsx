// src/components/growth/GrowthChiefPanel.tsx
"use client";

import { useEffect, useState } from "react";
import { Brain, Sparkles, ChevronRight } from "lucide-react";

type GrowthMove = {
  source: string;
  summary: string;
  createdAt: string;
};

export function GrowthChiefPanel() {
  const [lastMove, setLastMove] = useState<GrowthMove | null>(null);

  useEffect(() => {
    // Read any saved move from localStorage (Masterbrain / Oracle)
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("z17_last_growth_move");
      if (raw) {
        setLastMove(JSON.parse(raw));
      }
    } catch {
      // ignore
    }

    function handler(e: Event) {
      const detail = (e as CustomEvent).detail as GrowthMove | undefined;
      if (detail?.summary) {
        setLastMove(detail);
      }
    }

    window.addEventListener("z17:helixNextMove", handler as EventListener);
    return () =>
      window.removeEventListener("z17:helixNextMove", handler as EventListener);
  }, []);

  return (
    <section className="rounded-3xl bg-gradient-to-r from-slate-800 via-slate-900 to-slate-950 text-white px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-md">
      <div className="flex items-start gap-3 max-w-xl">
        <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/20 border border-violet-400/60">
          <Brain className="w-4 h-4 text-violet-200" />
        </div>
        <div className="space-y-1">
          <div className="text-[11px] uppercase tracking-wide text-violet-300">
            Growth Chief — today&apos;s focus
          </div>
          {lastMove?.summary ? (
            <>
              <p className="text-[11px] text-slate-50">{lastMove.summary}</p>
              <p className="text-[10px] text-slate-300">
                Source:{" "}
                <span className="font-semibold">
                  {lastMove.source === "oracle"
                    ? "Growth Oracle"
                    : "Growth Masterbrain"}
                </span>{" "}
                • {new Date(lastMove.createdAt).toLocaleString()}
              </p>
            </>
          ) : (
            <p className="text-[11px] text-slate-100">
              Run <span className="font-semibold">Masterbrain</span> or ask the{" "}
              <span className="font-semibold">Oracle</span>, then Growth Chief
              will show a single next focus for this week.
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-col items-start md:items-end gap-2 text-[11px]">
        <div className="inline-flex items-center gap-1 rounded-full bg-violet-500/90 text-white px-4 py-1.5 font-semibold shadow hover:bg-violet-400">
          <Sparkles className="w-3 h-3" />
          Recommended: 1 move per week
        </div>
        <p className="text-[10px] text-slate-200 flex items-center gap-1">
          <ChevronRight className="w-3 h-3" />
          Finish this move → log result in Experiments → then ask Oracle again.
        </p>
      </div>
    </section>
  );
}

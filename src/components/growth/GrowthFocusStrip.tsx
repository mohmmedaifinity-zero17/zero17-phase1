// src/components/growth/GrowthFocusStrip.tsx
"use client";

import { useEffect, useState } from "react";
import { LineChart, Target } from "lucide-react";
import {
  loadResearchSnapshot,
  ResearchSnapshot,
} from "@/components/research/researchSnapshot";

export function GrowthFocusStrip() {
  const [snapshot, setSnapshot] = useState<ResearchSnapshot | null>(null);

  useEffect(() => {
    setSnapshot(loadResearchSnapshot());
  }, []);

  if (!snapshot) return null;

  const title =
    snapshot.blueprintHeadline?.trim() ||
    (snapshot.idea ? truncate(snapshot.idea, 100) : "Untitled project");

  return (
    <div className="mb-4 rounded-2xl border border-sky-300/60 bg-gradient-to-r from-sky-900 via-slate-900 to-slate-950 px-4 py-3 text-[11px] text-sky-50 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-inner">
      <div className="flex items-start gap-2">
        <LineChart className="w-4 h-4 mt-0.5 text-sky-300" />
        <div>
          <div className="text-[10px] uppercase tracking-wide text-sky-300">
            Growth focus
          </div>
          <div className="text-[11px] font-semibold text-sky-50">{title}</div>
          {snapshot.icp && (
            <div className="mt-0.5 text-[10px] text-sky-200">
              <span className="font-semibold">ICP:</span> {snapshot.icp}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 text-[10px] text-sky-200">
        <Target className="w-3 h-3 text-emerald-300" />
        <span>
          Growth OS will design sprints, loops and campaigns around this exact
          thesis.
        </span>
      </div>
    </div>
  );
}

function truncate(text: string, max: number) {
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + "…";
}

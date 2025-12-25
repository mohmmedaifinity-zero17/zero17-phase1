// src/components/builder/BuilderResearchBanner.tsx
"use client";

import { useEffect, useState } from "react";
import { Beaker, Lightbulb } from "lucide-react";
import {
  loadResearchSnapshot,
  ResearchSnapshot,
} from "@/components/research/researchSnapshot";

export function BuilderResearchBanner() {
  const [snapshot, setSnapshot] = useState<ResearchSnapshot | null>(null);

  useEffect(() => {
    setSnapshot(loadResearchSnapshot());
  }, []);

  if (!snapshot) return null;

  const title =
    snapshot.blueprintHeadline?.trim() ||
    (snapshot.idea ? truncate(snapshot.idea, 90) : "Untitled project");

  return (
    <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-[11px] text-slate-800 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Beaker className="w-3.5 h-3.5 text-emerald-600" />
        <div className="font-semibold">Powered by Research Lab</div>
      </div>
      <div className="text-[10px] text-slate-700">
        <span className="font-semibold">Project thesis:</span> {title}
      </div>
      {snapshot.icp && (
        <div className="flex items-center gap-1 text-[10px] text-slate-700">
          <Lightbulb className="w-3 h-3 text-amber-500" />
          <span>
            <span className="font-semibold">ICP:</span> {snapshot.icp}
          </span>
        </div>
      )}
      <div className="text-[9px] text-slate-500">
        Generated from QIE + Blueprint. Keep your build aligned with this
        contract.
      </div>
    </div>
  );
}

function truncate(text: string, max: number) {
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + "…";
}

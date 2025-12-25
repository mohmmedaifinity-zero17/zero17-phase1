// src/components/growth/GrowthMirrorPanel.tsx
"use client";

import { motion } from "framer-motion";

export type GrowthMirrorMatch = {
  id: string;
  createdAt: string;
  label: string;
  similarityNote: string;
  decision?: string | null;
  outcomeSummary?: string | null;
};

export type GrowthMirror = {
  headline: string;
  summary: string;
  matches: GrowthMirrorMatch[];
  chiefAdvice: string;
};

type Props = {
  mirror: GrowthMirror | null;
  loading: boolean;
  error: string | null;
  onRunMirrorAction: () => void;
};

export default function GrowthMirrorPanel({
  mirror,
  loading,
  error,
  onRunMirrorAction,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 shadow-2xl"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Mirror emblem */}
          <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 via-emerald-300 to-amber-300 text-[11px] font-black text-slate-950 shadow-md">
            GM
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300">
              Growth Mirror
            </p>
            <p className="text-[11px] text-slate-100">
              See how this bet rhymes with your past runs.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRunMirrorAction}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-xl bg-slate-50/95 px-3 py-1.5 text-[10px] font-semibold text-slate-900 shadow-sm hover:bg-white disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? "Scanning memory…" : "Run Growth Mirror"}
        </button>
      </div>

      {mirror ? (
        <div className="mt-3 space-y-2 text-[11px] text-slate-100">
          <p className="text-xs font-semibold text-slate-50">
            {mirror.headline}
          </p>
          <p className="text-[11px] text-slate-200">{mirror.summary}</p>

          {mirror.matches.length > 0 && (
            <div className="mt-1 space-y-1.5">
              {mirror.matches.map((m) => (
                <div
                  key={m.id}
                  className="rounded-lg border border-slate-700 bg-slate-950/80 px-2.5 py-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] font-semibold text-slate-50">
                      {m.label || "Unnamed sprint"}
                    </p>
                    <p className="text-[9px] text-slate-400">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-200">
                    {m.similarityNote}
                  </p>
                  {m.outcomeSummary && (
                    <p className="mt-0.5 text-[10px] text-slate-300">
                      <span className="font-semibold">Outcome:</span>{" "}
                      {m.outcomeSummary}
                    </p>
                  )}
                  {m.decision && (
                    <p className="mt-0.5 text-[9px] uppercase tracking-wide text-slate-400">
                      Decision: {m.decision}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          <p className="mt-1 text-[11px] text-slate-200">
            {mirror.chiefAdvice}
          </p>
        </div>
      ) : (
        <p className="mt-2 text-[11px] text-slate-300">
          Once you’ve saved a few Growth Runs, I’ll start calling out patterns:
          bets you keep repeating, channels that never convert, and moves that
          quietly worked. Use this as your pattern-recognition layer, not as
          another dashboard.
        </p>
      )}

      {error && <p className="mt-2 text-[11px] text-rose-400">{error}</p>}
    </motion.div>
  );
}

// src/components/growth/GrowthChiefRail.tsx
"use client";

import { motion } from "framer-motion";
import GrowthMirrorPanel, { GrowthMirror } from "./GrowthMirrorPanel";

type Props = {
  activeStep: 1 | 2 | 3;
  onJumpToStepAction: (step: 1 | 2 | 3) => void;
  mirror: GrowthMirror | null;
  mirrorLoading: boolean;
  mirrorError: string | null;
  onRunMirrorAction: () => void;
};

export default function GrowthChiefRail({
  activeStep,
  onJumpToStepAction,
  mirror,
  mirrorLoading,
  mirrorError,
  onRunMirrorAction,
}: Props) {
  const stepLabel =
    activeStep === 1
      ? "Diagnosis & Foundation"
      : activeStep === 2
        ? "DNA & Sprint Design"
        : "Monetization, Loops & Objections";

  const headline =
    activeStep === 1
      ? "Let’s define one honest growth game to win."
      : activeStep === 2
        ? "Strip your sprint down until it actually ships."
        : "Now we turn this into money, compounding, and fewer no’s.";

  const microAdvice =
    activeStep === 1
      ? "Be shamelessly specific about who you serve, what you sell, and your primary growth engine. If your ICP sounds like a conference tagline, narrow it until it sounds like a DM you could send today."
      : activeStep === 2
        ? "Your sprint should fit on a napkin: 1–2 channels, one primary metric, a concrete bet you can measure in 7–14 days. Anything more is a strategy deck pretending to be work."
        : "You don’t need ten channels. You need one loop that compounds, one pricing shape that feels obvious to your ICP, and one objection playbook you can say half-asleep.";

  return (
    <aside className="space-y-4">
      {/* Growth Chief */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-slate-800/60 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 shadow-2xl"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 via-amber-300 to-yellow-400 text-sm font-bold text-slate-900 shadow-md">
              👑
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                Growth Chief
              </p>
              <p className="text-[11px] text-slate-100">
                Your ruthless, calm growth cofounder.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-slate-800 bg-slate-950/60 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Current focus
          </p>
          <p className="mt-1 text-[11px] font-semibold text-slate-50">
            {stepLabel}
          </p>
          <p className="mt-1 text-[11px] text-slate-200">{headline}</p>
        </div>

        <p className="mt-2 text-[11px] text-slate-200">{microAdvice}</p>

        <div className="mt-3 flex flex-col gap-1.5 text-[10px]">
          <p className="font-semibold uppercase tracking-[0.14em] text-slate-400">
            Flight shortcuts
          </p>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => onJumpToStepAction(1)}
              className={`inline-flex items-center justify-center rounded-full border px-2.5 py-1 text-[10px] cursor-pointer ${
                activeStep === 1
                  ? "border-sky-400 bg-sky-500/10 text-sky-100"
                  : "border-slate-700 bg-slate-900 text-slate-200 hover:border-sky-500/60"
              }`}
            >
              1 · Masterbrain
            </button>
            <button
              type="button"
              onClick={() => onJumpToStepAction(2)}
              className={`inline-flex items-center justify-center rounded-full border px-2.5 py-1 text-[10px] cursor-pointer ${
                activeStep === 2
                  ? "border-emerald-400 bg-emerald-500/10 text-emerald-100"
                  : "border-slate-700 bg-slate-900 text-slate-200 hover:border-emerald-500/60"
              }`}
            >
              2 · DNA & Sprint
            </button>
            <button
              type="button"
              onClick={() => onJumpToStepAction(3)}
              className={`inline-flex items-center justify-center rounded-full border px-2.5 py-1 text-[10px] cursor-pointer ${
                activeStep === 3
                  ? "border-amber-400 bg-amber-500/10 text-amber-100"
                  : "border-slate-700 bg-slate-900 text-slate-200 hover:border-amber-500/60"
              }`}
            >
              3 · Money & Loops
            </button>
          </div>
        </div>
      </motion.div>

      {/* Growth Mirror under Chief */}
      <GrowthMirrorPanel
        mirror={mirror}
        loading={mirrorLoading}
        error={mirrorError}
        onRunMirrorAction={onRunMirrorAction}
      />
    </aside>
  );
}

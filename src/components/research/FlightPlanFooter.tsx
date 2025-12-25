// src/components/research/FlightPlanFooter.tsx
"use client";

interface Props {
  currentStep: number; // 0–5
  onStepClick?: (id: number) => void;
}

const steps = [
  { id: 1, label: "Describe & Clarify", sub: "Origin Frame · Insight" },
  { id: 2, label: "Scan Reality", sub: "Demand receipts · Competitors" },
  { id: 3, label: "Fuse & Invent", sub: "Synthesis Zone · Matrix" },
  { id: 4, label: "Score & Risk", sub: "Buildability · Risk Radar" },
  { id: 5, label: "Commit & Export", sub: "Blueprint · Memory · Export" },
];

export default function FlightPlanFooter({ currentStep, onStepClick }: Props) {
  return (
    <section className="mt-2 rounded-3xl border border-slate-200 bg-white/90 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <h3 className="text-[11px] font-semibold text-slate-900">
            Research Flight Plan
          </h3>
          <p className="text-[10px] text-slate-600">
            One clean path from spark → reality check → build-ready bet.
          </p>
        </div>
        <span className="rounded-full bg-slate-900 px-3 py-[4px] text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-50">
          {currentStep === 0 ? "NOT STARTED" : `STEP ${currentStep} / 5`}
        </span>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch sm:justify-between">
        {steps.map((step) => {
          const isActive = currentStep === step.id;
          const isDone = currentStep > step.id;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepClick?.(step.id)}
              className={[
                "group flex-1 rounded-2xl border px-3 py-2 text-left text-[10px] transition-all",
                isActive
                  ? "border-sky-500 bg-sky-50 shadow-sm"
                  : isDone
                    ? "border-emerald-500/70 bg-emerald-50"
                    : "border-slate-200 bg-slate-50 hover:border-slate-300",
              ].join(" ")}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 bg-white text-[9px] font-semibold text-slate-700">
                    {step.id}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-900">
                    {step.label}
                  </span>
                </div>
                {isDone && (
                  <span className="text-[10px] text-emerald-600">✓</span>
                )}
                {isActive && (
                  <span className="rounded-full bg-sky-500 px-2 py-[1px] text-[9px] font-semibold text-slate-950">
                    ACTIVE
                  </span>
                )}
              </div>
              <div className="text-[9px] text-slate-600">{step.sub}</div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

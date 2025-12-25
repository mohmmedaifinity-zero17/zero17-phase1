// src/components/growth/GrowthFlightPlanFooter.tsx
"use client";

type Props = {
  activeStep: 1 | 2 | 3;
  onStepChangeAction: (s: 1 | 2 | 3) => void;
};

const steps: {
  id: 1 | 2 | 3;
  label: string;
  description: string;
  anchor: string;
}[] = [
  {
    id: 1,
    label: "Diagnose & Aim",
    description: "Growth Masterbrain · Archetype · Engine · North star",
    anchor: "#growth-step-1",
  },
  {
    id: 2,
    label: "Sprint & Execute",
    description: "7-day survival sprint · daily punches",
    anchor: "#growth-step-2",
  },
  {
    id: 3,
    label: "Proof & Pulse",
    description: "Log conversations · build traction pulse",
    anchor: "#growth-step-3",
  },
];

export default function GrowthFlightPlanFooter({
  activeStep,
  onStepChangeAction,
}: Props) {
  const scrollTo = (anchor: string, id: 1 | 2 | 3) => {
    onStepChangeAction(id);
    if (typeof window !== "undefined") {
      const el = document.querySelector(anchor);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <footer className="mt-6 rounded-2xl border border-slate-200 bg-white/90 p-4 text-[11px] text-slate-700 shadow-sm">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        Growth flight plan
      </p>
      <div className="flex flex-wrap gap-2">
        {steps.map((step) => {
          const isActive = step.id === activeStep;
          return (
            <button
              key={step.id}
              onClick={() => scrollTo(step.anchor, step.id)}
              className={`flex flex-1 min-w-[180px] flex-col items-start rounded-xl border px-3 py-2 text-left transition ${
                isActive
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-slate-200 bg-slate-50 hover:bg-slate-100"
              }`}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                {step.id}. {step.label}
              </span>
              <span className="mt-0.5 text-[11px] text-slate-600">
                {step.description}
              </span>
            </button>
          );
        })}
      </div>
    </footer>
  );
}

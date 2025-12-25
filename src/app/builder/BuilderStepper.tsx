// src/app/builder/BuilderStepper.tsx

"use client";

type Step = {
  id: number;
  key:
    | "intent"
    | "spec"
    | "architecture"
    | "build"
    | "refine"
    | "test"
    | "scan"
    | "deploy"
    | "handoff";
  label: string;
  description: string;
};

const STEPS: Step[] = [
  {
    id: 1,
    key: "intent",
    label: "Intent",
    description: "Choose build type, source (Research Lab vs raw idea).",
  },
  {
    id: 2,
    key: "spec",
    label: "Multi-Lens Spec",
    description: "Founder, Architect, QA, Client, Agent lenses in sync.",
  },
  {
    id: 3,
    key: "architecture",
    label: "Architecture Map",
    description: "Screens, entities, APIs, infra – one coherent blueprint.",
  },
  {
    id: 4,
    key: "build",
    label: "Build Engine",
    description: "Scaffold full-stack app from the blueprint.",
  },
  {
    id: 5,
    key: "refine",
    label: "Refine & Preview Surgery",
    description: "Chat changes + visual edits → real code diffs.",
  },
  {
    id: 6,
    key: "test",
    label: "Build Factory",
    description: "Generate tests, run, auto-fix, produce QA report.",
  },
  {
    id: 7,
    key: "scan",
    label: "Global Standards Scan",
    description: "UX, a11y, perf, security, SEO – world-class polish.",
  },
  {
    id: 8,
    key: "deploy",
    label: "Deploy",
    description: "Preview & production deploy, repo + environment wiring.",
  },
  {
    id: 9,
    key: "handoff",
    label: "Handoff & Client Pack",
    description: "Build Contract, docs, Proof-of-Work pack, agent docs.",
  },
];

interface BuilderStepperProps {
  activeProject: boolean;
}

export default function BuilderStepper({ activeProject }: BuilderStepperProps) {
  return (
    <ol className="grid gap-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {STEPS.map((step) => (
        <li
          key={step.id}
          className="group flex flex-col rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs transition-colors hover:border-slate-600 hover:bg-slate-900/80"
        >
          <div className="mb-1 flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] text-slate-400">
              {step.id}
            </span>
            <span className="font-medium text-slate-100">{step.label}</span>
          </div>
          <p className="text-[11px] leading-snug text-slate-400">
            {step.description}
          </p>
          {!activeProject && (
            <p className="mt-1 text-[10px] text-slate-500">
              Select or create a project to activate this rail.
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}

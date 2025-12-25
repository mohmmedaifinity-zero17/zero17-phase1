// src/components/growth/AgentPipeline.tsx
"use client";

import { useState } from "react";
import {
  Users,
  Brain,
  Target,
  Sparkles,
  LineChart,
  Repeat,
  Activity,
  Zap,
} from "lucide-react";

type Stage = {
  id: string;
  label: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: { id: string; name: string; description: string }[];
};

const STAGES: Stage[] = [
  {
    id: "foundation",
    label: "Stage 1 — Foundation",
    color: "text-sky-600",
    icon: Brain,
    roles: [
      {
        id: "icp-architect",
        name: "ICP Architect",
        description: "Defines who you serve and what hurts them the most.",
      },
      {
        id: "offer-scientist",
        name: "Offer Scientist",
        description: "Turns your skills into clear, irresistible offers.",
      },
    ],
  },
  {
    id: "creative-proof",
    label: "Stage 2 — Creative & Proof",
    color: "text-amber-600",
    icon: Sparkles,
    roles: [
      {
        id: "angle-mutator",
        name: "Angle Mutator",
        description: "Finds 10x better story angles and hooks.",
      },
      {
        id: "proof-producer",
        name: "Proof Producer",
        description:
          "Turns your work into screenshots, stories and case studies.",
      },
    ],
  },
  {
    id: "performance",
    label: "Stage 3 — Performance",
    color: "text-emerald-600",
    icon: Target,
    roles: [
      {
        id: "performance-strategist",
        name: "Performance Strategist",
        description: "Chooses channels and budgets with simple math.",
      },
      {
        id: "campaign-engineer",
        name: "Campaign Engineer",
        description: "Builds ads, landing pages and runs tests.",
      },
    ],
  },
  {
    id: "loops",
    label: "Stage 4 — PLG & Loops",
    color: "text-violet-600",
    icon: Repeat,
    roles: [
      {
        id: "activation-scientist",
        name: "Activation Scientist",
        description: "Helps users hit the aha moment as fast as possible.",
      },
      {
        id: "flywheel-architect",
        name: "Flywheel Architect",
        description: "Designs compounding loops for your product.",
      },
    ],
  },
  {
    id: "review",
    label: "Stage 5 — Review & Chief",
    color: "text-slate-900",
    icon: Activity,
    roles: [
      {
        id: "growth-analyst",
        name: "Growth Analyst",
        description: "Reads numbers and suggests small weekly fixes.",
      },
      {
        id: "growth-chief",
        name: "Growth Chief",
        description: "Acts like VP Growth and coordinates all the others.",
      },
    ],
  },
];

export function AgentPipeline() {
  const [activeRoleId, setActiveRoleId] = useState<string | null>(null);

  const activeRole =
    STAGES.flatMap((s) => s.roles).find((r) => r.id === activeRoleId) ?? null;

  return (
    <section
      id="agent-pipeline"
      className="z17-card bg-white/90 p-4 space-y-3 border border-slate-200"
    >
      <div className="flex items-center gap-2 mb-1">
        <Users className="w-4 h-4 text-purple-600" />
        <div className="text-sm font-semibold">Growth team pipeline</div>
      </div>
      <p className="text-[11px] text-slate-600">
        This is what a &quot;perfect growth team&quot; looks like. In future
        versions you will click a role to instantly spin up a real agent with
        tools, memory and runbooks.
      </p>

      <div className="space-y-3 mt-1">
        {STAGES.map((stage) => (
          <div key={stage.id} className="space-y-1">
            <div className="flex items-center gap-2">
              <stage.icon className={`w-3 h-3 ${stage.color}`} />
              <div className="text-[11px] font-semibold text-slate-700">
                {stage.label}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              {stage.roles.map((role) => {
                const active = activeRoleId === role.id;
                return (
                  <button
                    type="button"
                    key={role.id}
                    onClick={() =>
                      setActiveRoleId((prev) =>
                        prev === role.id ? null : role.id
                      )
                    }
                    className={`text-left rounded-2xl border px-3 py-2 text-[11px] transition ${
                      active
                        ? "border-purple-600 bg-purple-50"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="font-semibold text-slate-800">
                        {role.name}
                      </span>
                      {active && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-purple-700">
                          <Zap className="w-3 h-3" />
                          selected
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-600">
                      {role.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-slate-900 text-slate-50 p-3 mt-1 space-y-1">
        <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-300">
          <Zap className="w-3 h-3" />
          What happens when you click?
        </div>
        <p className="text-[10px] text-slate-100">
          Right now it just helps you think like a team. Later, clicking a role
          will open a &quot;Make this an agent&quot; panel with ready specs
          connected to your current project.
        </p>
        {activeRole && (
          <p className="text-[10px] text-slate-100 mt-1">
            Selected role:{" "}
            <span className="font-semibold">{activeRole.name}</span>.
          </p>
        )}
      </div>
    </section>
  );
}

// src/app/agents/page.tsx
"use client";

import Link from "next/link";
import { ArrowLeft, Users, Brain, Zap } from "lucide-react";
import { AgentPipeline } from "@/components/growth/AgentPipeline";

export default function AgentsPage() {
  return (
    <div className="min-h-[calc(100vh-56px)]">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/growth"
            className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-black"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Growth OS
          </Link>
        </div>

        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            <h1 className="text-xl font-semibold">Agent employees hub</h1>
          </div>
          <p className="text-[11px] text-slate-600 max-w-3xl">
            A full growth department in one place. Each role — ICP Architect,
            Offer Scientist, Angle Mutator, Proof Producer, Performance
            Strategist, Flywheel Architect and more — can become a Zero17 agent
            that executes work for you.
          </p>
        </section>

        {/* Short explainer cards */}
        <div className="grid md:grid-cols-2 gap-4">
          <section className="z17-card bg-white/90 p-4 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Brain className="w-4 h-4 text-sky-600" />
              <div className="text-sm font-semibold">How this hub works</div>
            </div>
            <p className="text-[11px] text-slate-600">
              First, use Growth Masterbrain and Offer / Social / Performance
              Labs to define your ICP, offers and experiments. Then promote
              specific roles into agents that own parts of your growth loop —
              prospecting, creative, proof, performance or loops.
            </p>
          </section>

          <section className="z17-card bg-slate-900 text-white p-4 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-amber-300" />
              <div className="text-sm font-semibold">Next step</div>
            </div>
            <p className="text-[11px] text-slate-100">
              For v1, Zero17 shows you the ideal team structure and how each
              role plugs into Growth OS. In later versions, clicking a role will
              generate a full agent spec (tools, memory, runbook) wired to your
              current project.
            </p>
          </section>
        </div>

        {/* Full pipeline */}
        <AgentPipeline />
      </div>
    </div>
  );
}

// src/components/growth/GrowthOverview.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Rocket } from "lucide-react";

import GrowthChiefRail from "./GrowthChiefRail";
import GrowthMasterbrainPanel from "./GrowthMasterbrainPanel";
import GrowthSprintPanel from "./GrowthSprintPanel";
import PulseEnginePanel from "./PulseEnginePanel";
import GrowthDNAEnginePanel from "./GrowthDNAEnginePanel";
import MonetizationFoundryPanel from "./MonetizationFoundryPanel";
import LoopBuilderPanel from "./LoopBuilderPanel";
import ObjectionEnginePanel from "./ObjectionEnginePanel";
import GrowthFlightPlanFooter from "./GrowthFlightPlanFooter";

import type {
  GrowthMasterbrainInput,
  GrowthMasterbrainOutput,
  GrowthDNAPlan,
  GrowthSprintPlan,
  GrowthSnapshot,
  PulseEvent,
  MonetizationPlan,
  LoopDesignPlan,
  ObjectionPlaybook,
} from "@/lib/growth/types";
import type { GrowthMirror } from "./GrowthMirrorPanel";

export default function GrowthOverview() {
  // Core state for Growth OS engines
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  // You can expand these later (DNA, monetization, loops, objections)
  const [input, setInput] = useState<GrowthMasterbrainInput | null>(null);
  const [masterbrain, setMasterbrain] =
    useState<GrowthMasterbrainOutput | null>(null);
  const [dna, setDna] = useState<GrowthDNAPlan | null>(null);
  const [sprint, setSprint] = useState<GrowthSprintPlan | null>(null);
  const [snapshot, setSnapshot] = useState<GrowthSnapshot | null>(null);
  const [pulseEvents, setPulseEvents] = useState<PulseEvent[]>([]);
  const [monetization, setMonetization] = useState<MonetizationPlan | null>(
    null
  );
  const [loops, setLoops] = useState<LoopDesignPlan | null>(null);
  const [objections, setObjections] = useState<ObjectionPlaybook | null>(null);
  const [mirror, setMirror] = useState<GrowthMirror | null>(null);
  const [mirrorLoading, setMirrorLoading] = useState(false);
  const [mirrorError, setMirrorError] = useState<string | null>(null);

  const handleGrowthCockpitClick = () => {
    // Simple but visible behaviour so it “feels alive”
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-8">
      {/* HERO */}
      <section className="rounded-3xl bg-white/80 p-6 shadow-sm ring-1 ring-slate-200/60 backdrop-blur">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          {/* Left: copy + cockpit pill */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-medium text-slate-100 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>ZERO17 • GROWTH OS</span>
              <span className="text-slate-400">v6.0</span>
            </div>

            <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Growth OS — Turn survival mode into compounding dominance.
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              One cockpit for truth, experiments, and real growth. No vanity
              dashboards. No fake wins. Just actions, signals, and compounding
              proof.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {/* “Growth cockpit ready” now acts like a real button */}
              <button
                type="button"
                onClick={handleGrowthCockpitClick}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-400/70 bg-slate-900 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-100 hover:bg-slate-800"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>Growth cockpit ready</span>
              </button>
            </div>
          </div>

          {/* Right: Builder ←→ Growth wiring strip */}
          <div className="w-full max-w-xs space-y-3">
            <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Builder ↔ Growth wiring
            </div>
            <div className="grid gap-2">
              <Link
                href="/builder"
                className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-900 px-3 py-2 text-xs text-slate-100 shadow-sm hover:bg-slate-800"
              >
                <div className="flex flex-col">
                  <span className="font-semibold">Open Builder Lab</span>
                  <span className="text-[11px] text-slate-300">
                    Jump to Prompt → MVP Builder
                  </span>
                </div>
                <Rocket className="h-4 w-4 opacity-80 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>

              <Link
                href="/projects"
                className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm hover:bg-slate-50"
              >
                <div className="flex flex-col">
                  <span className="font-semibold">View Projects</span>
                  <span className="text-[11px] text-slate-500">
                    See saved builds & Growth runs
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN GRID */}
      <motion.div
        className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,0.9fr)]"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* LEFT: core flow */}
        <div className="space-y-6">
          {/* Step 1 – Masterbrain + DNA */}
          <div className="space-y-6">
            <GrowthMasterbrainPanel
              input={input}
              masterbrain={masterbrain}
              onMasterbrainChangeAction={setMasterbrain}
              onInputChangeAction={setInput}
              onStepChangeAction={setActiveStep}
            />

            <GrowthDNAEnginePanel
              input={input}
              masterbrain={masterbrain}
              dna={dna}
              onDnaChangeAction={setDna}
              onStepChangeAction={setActiveStep}
            />
          </div>

          {/* Step 2 – Sprint */}
          <GrowthSprintPanel
            input={input}
            masterbrain={masterbrain}
            dna={dna}
            sprint={sprint}
            snapshot={snapshot}
            onSprintChange={setSprint}
            onSnapshotChange={setSnapshot}
            onStepChange={setActiveStep}
          />

          {/* Step 3 – Signals, money, loops, objections */}
          <PulseEnginePanel
            snapshot={snapshot}
            events={pulseEvents}
            onEventsChangeAction={setPulseEvents}
            onSnapshotChangeAction={setSnapshot}
            onStepChangeAction={setActiveStep}
          />

          <MonetizationFoundryPanel
            input={input}
            masterbrain={masterbrain}
            plan={monetization}
            onChangeAction={setMonetization}
            onStepChangeAction={setActiveStep}
          />

          <LoopBuilderPanel
            input={input}
            masterbrain={masterbrain}
            plan={loops}
            onChangeAction={setLoops}
            onStepChangeAction={setActiveStep}
          />

          <ObjectionEnginePanel
            input={input}
            masterbrain={masterbrain}
            playbook={objections}
            onChangeAction={setObjections}
            onStepChangeAction={setActiveStep}
          />
        </div>

        {/* RIGHT: Chief rail */}
        <div className="space-y-4">
          <GrowthChiefRail
            activeStep={activeStep}
            onJumpToStepAction={setActiveStep}
            mirror={mirror}
            mirrorLoading={mirrorLoading}
            mirrorError={mirrorError}
            onRunMirrorAction={async () => {
              setMirrorLoading(true);
              setMirrorError(null);
              try {
                // TODO: Implement actual API call
                // const res = await fetch("/api/growth/mirror", { method: "POST" });
                // if (!res.ok) throw new Error("Failed to run Growth Mirror");
                // const data = await res.json();
                // setMirror(data);
                setMirror(null); // Placeholder
              } catch (err: any) {
                setMirrorError(err.message || "Failed to run Growth Mirror");
              } finally {
                setMirrorLoading(false);
              }
            }}
          />
        </div>
      </motion.div>

      {/* Flight plan footer (step navigator) */}
      <GrowthFlightPlanFooter
        activeStep={activeStep}
        onStepChangeAction={setActiveStep}
      />
    </div>
  );
}

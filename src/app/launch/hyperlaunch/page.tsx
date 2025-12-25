// src/app/launch/hyperlaunch/page.tsx
"use client";

import { useState } from "react";
import {
  Zap,
  ShieldCheck,
  Rocket,
  Globe,
  FileCheck,
  Hash,
  Megaphone,
  CheckCircle2,
} from "lucide-react";

type Step = {
  id: string;
  label: string;
  description: string;
  status: "pending" | "running" | "done";
};

export default function HyperLaunchPage() {
  const [steps, setSteps] = useState<Step[]>([
    {
      id: "preflight",
      label: "Preflight Radar",
      description:
        "Scan performance, accessibility, security and env variables.",
      status: "pending",
    },
    {
      id: "fixes",
      label: "Auto Fix & Harden",
      description: "Apply recommended fixes to configs and launch settings.",
      status: "pending",
    },
    {
      id: "deploy",
      label: "Deploy Preview",
      description: "Push a build and verify preview endpoint is live.",
      status: "pending",
    },
    {
      id: "domain",
      label: "Domain & SSL",
      description: "Prepare DNS and SSL plan for your chosen domain.",
      status: "pending",
    },
    {
      id: "proof",
      label: "Proof-of-Work Pack",
      description: "Generate your launch dossier and artifacts summary.",
      status: "pending",
    },
    {
      id: "ledger",
      label: "Truth Ledger Hash",
      description: "Mint a SHA-256 hash of your launch contract.",
      status: "pending",
    },
    {
      id: "gtm",
      label: "GTM Launch Kit",
      description: "Draft launch posts, emails and early adopter outreach.",
      status: "pending",
    },
  ]);

  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function runHyperLaunch() {
    if (running) return;
    setRunning(true);
    setResult(null);

    // optimistic: mark all as running then done after API
    setSteps((prev) => prev.map((s) => ({ ...s, status: "running" })));

    const res = await fetch("/api/launch/hyperlaunch", { method: "POST" });
    const json = await res.json();

    setResult(json);

    // update steps from response if present, else mark done
    if (json?.steps) {
      setSteps(
        json.steps.map((s: any) => ({
          id: s.id,
          label: s.label,
          description: s.description,
          status: "done" as const,
        }))
      );
    } else {
      setSteps((prev) => prev.map((s) => ({ ...s, status: "done" })));
    }

    setRunning(false);
  }

  return (
    <div className="min-h-[calc(100vh-56px)]">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-3 py-1 text-[11px] font-semibold">
            <Zap size={14} />
            <span>HyperLaunch Arena</span>
            <span className="px-2 py-0.5 rounded-full bg-white/15 text-[9px] uppercase">
              God Mode
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            One button to orchestrate your entire launch.
          </h1>
          <p className="text-sm md:text-[13px] text-slate-600 max-w-2xl">
            HyperLaunch chains together preflight checks, auto-fixes, deploy,
            domain setup, Proof-of-Work pack, ledger hashing and GTM kit
            generation — turning a solo founder into a full launch team.
          </p>
        </header>

        {/* Controls + Summary */}
        <section className="z17-card p-5 bg-white/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold mb-1">
              HyperLaunch pipeline
            </div>
            <div className="text-xs text-slate-500 max-w-md">
              This run is simulated for now — no destructive actions, just an
              end-to-end dry-run of your launch pipeline with a structured
              output you can inspect.
            </div>
          </div>
          <button
            onClick={runHyperLaunch}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-900 bg-slate-900 text-white px-4 py-2 text-sm font-semibold hover:bg-white hover:text-black transition disabled:opacity-60"
          >
            {running ? "Running HyperLaunch…" : "Run HyperLaunch"}
          </button>
        </section>

        {/* Steps timeline */}
        <section className="z17-card p-5 bg-white/90">
          <div className="text-xs uppercase text-slate-500 mb-3">
            Pipeline steps
          </div>
          <ol className="space-y-3">
            {steps.map((step, index) => (
              <li key={step.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-semibold ${
                      step.status === "done"
                        ? "bg-emerald-500 text-white"
                        : step.status === "running"
                          ? "bg-slate-900 text-white"
                          : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {step.status === "done" ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 w-px bg-slate-200 mt-1" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold">{step.label}</div>
                  <p className="text-xs text-slate-500">{step.description}</p>
                  <div className="mt-1 text-[10px] uppercase text-slate-400">
                    Status:{" "}
                    {step.status === "pending"
                      ? "Pending"
                      : step.status === "running"
                        ? "Running"
                        : "Done"}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Result JSON */}
        {result && (
          <section className="z17-card p-5 bg-white/90">
            <div className="text-xs uppercase text-slate-500 mb-2">
              HyperLaunch result (summary)
            </div>
            <pre className="bg-slate-100 rounded-lg p-3 text-[11px] overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </section>
        )}

        {/* Legend / Mapping */}
        <section className="z17-card p-5 bg-white/90">
          <div className="text-xs uppercase text-slate-500 mb-2">
            What HyperLaunch will do in future
          </div>
          <div className="grid md:grid-cols-3 gap-4 text-xs text-slate-600">
            <div>
              <div className="flex items-center gap-1 font-semibold mb-1">
                <ShieldCheck size={14} className="text-emerald-600" /> Preflight
                + Fix
              </div>
              <p>
                Call the Preflight Radar, analyze critical issues, then
                auto-apply fix suggestions where safe.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1 font-semibold mb-1">
                <Rocket size={14} className="text-orange-600" /> Deploy + Domain
              </div>
              <p>
                Trigger a deployment and construct a domain + SSL plan, ready
                for your approval and DNS update.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1 font-semibold mb-1">
                <FileCheck size={14} className="text-emerald-700" /> Proof +
                Ledger + GTM
              </div>
              <p>
                Generate Proof-of-Work Pack, mint a ledger hash and draft launch
                posts & outreach sequences.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

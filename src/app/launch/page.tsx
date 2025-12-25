// src/app/launch/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Rocket,
  Globe,
  ShieldCheck,
  FileCheck,
  Hash,
  Users,
  Megaphone,
  Activity,
  Zap,
} from "lucide-react";

export default function LaunchEnginePage() {
  const [preflight, setPreflight] = useState<any>(null);
  const [powPack, setPowPack] = useState<any>(null);
  const [ledger, setLedger] = useState<any>(null);
  const [loading, setLoading] = useState<
    null | "preflight" | "proof" | "ledger"
  >(null);

  async function runPreflight() {
    setLoading("preflight");
    setPreflight(null);
    const res = await fetch("/api/launch/preflight", { method: "POST" });
    const json = await res.json();
    setPreflight(json);
    setLoading(null);
  }

  async function generateProof() {
    setLoading("proof");
    setPowPack(null);
    const res = await fetch("/api/launch/proof", { method: "POST" });
    const json = await res.json();
    setPowPack(json);
    setLoading(null);
  }

  async function generateLedger() {
    setLoading("ledger");
    setLedger(null);
    const res = await fetch("/api/launch/ledger", { method: "POST" });
    const json = await res.json();
    setLoading(null);
    setLedger(json);
  }

  const isBusy = loading !== null;

  return (
    <div className="min-h-[calc(100vh-56px)]">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <header className="space-y-2">
          <div className="text-xs uppercase text-slate-500">
            Pillar 3 • Launch Engine
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Launch like a top 0.1% team — in one arena.
          </h1>
          <p className="text-sm md:text-base text-slate-600 max-w-2xl">
            Preflight, domains, deploy, Proof-of-Work, Truth Ledger, launch
            mentors, GTM kit, live Launch Room and HyperLaunch
            auto-orchestration — all wired into a single flow.
          </p>
        </header>

        {/* HERO: HyperLaunch */}
        <section className="grid lg:grid-cols-3 gap-5 items-stretch">
          <div className="lg:col-span-2">
            <div className="relative overflow-hidden rounded-3xl border border-violet-300/70 bg-gradient-to-br from-violet-600 via-fuchsia-500 to-orange-400 text-white p-6 shadow-xl">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-black/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide">
                    <Zap size={14} />
                    <span>HyperLaunch</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/15 text-[9px] uppercase">
                      God Mode
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold">
                    One button. Full launch pipeline.
                  </h2>
                  <p className="text-sm md:text-[13px] text-white/90 max-w-lg">
                    HyperLaunch runs preflight, fixes, deploy, domain mapping,
                    Proof-of-Work pack, ledger hash and GTM launch kit in one
                    orchestrated run — so a solo founder can launch like a
                    full-stack team.
                  </p>
                  <Link
                    href="/launch/hyperlaunch"
                    className="inline-flex items-center gap-2 mt-2 rounded-xl bg-white text-slate-900 px-4 py-2 text-sm font-semibold shadow-md hover:bg-slate-100 transition"
                  >
                    Enter HyperLaunch Arena →
                  </Link>
                </div>
                <div className="hidden md:flex flex-col items-end text-right text-xs text-white/80">
                  <div className="text-[10px] uppercase mb-1">
                    Pipeline snapshot
                  </div>
                  <ul className="space-y-1">
                    <li>✓ Preflight Radar</li>
                    <li>✓ Auto-fix & Deploy</li>
                    <li>✓ Domain + SSL</li>
                    <li>✓ PoW Pack + Ledger</li>
                    <li>✓ GTM & Social blast</li>
                  </ul>
                </div>
              </div>
              <div className="pointer-events-none absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
            </div>
          </div>

          {/* Compact overview */}
          <div className="z17-card p-4 bg-white/85 flex flex-col justify-between">
            <div className="text-xs uppercase text-slate-500 mb-2">
              Launch flow overview
            </div>
            <ol className="space-y-1 text-xs text-slate-700">
              <li>1. Run Preflight Radar</li>
              <li>2. Fix critical warnings</li>
              <li>3. Deploy & connect domain</li>
              <li>4. Generate Proof-of-Work Pack</li>
              <li>5. Mint Truth Ledger hash</li>
              <li>6. Spin up Launch Room dashboard</li>
              <li>7. Blast GTM assets & social posts</li>
            </ol>
            <div className="mt-3 text-[10px] text-slate-500">
              HyperLaunch stitches these steps together. You can still use each
              tool independently below.
            </div>
          </div>
        </section>

        {/* Launch tools grid */}
        <section className="grid md:grid-cols-2 gap-5">
          {/* Preflight */}
          <div className="z17-card p-5 space-y-3 bg-white/90">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-emerald-600" />
              <div>
                <div className="text-sm font-semibold">Preflight Radar</div>
                <div className="text-xs text-slate-500">
                  Performance, accessibility, security, privacy & env sanity.
                </div>
              </div>
            </div>
            <button
              onClick={runPreflight}
              disabled={isBusy}
              className="px-3 py-2 rounded-lg border text-xs font-medium hover:bg-black hover:text-white transition disabled:opacity-50"
            >
              {loading === "preflight" ? "Running…" : "Run Preflight"}
            </button>
            {preflight && (
              <pre className="bg-slate-100 rounded-lg p-3 text-[11px] overflow-x-auto">
                {JSON.stringify(preflight, null, 2)}
              </pre>
            )}
          </div>

          {/* Domain Wizard */}
          <div className="z17-card p-5 space-y-3 bg-white/90">
            <div className="flex items-center gap-2">
              <Globe className="text-blue-600" />
              <div>
                <div className="text-sm font-semibold">Domain Wizard</div>
                <div className="text-xs text-slate-500">
                  Get DNS records & best-practice subdomain map in seconds.
                </div>
              </div>
            </div>
            <Link
              href="/launch/domain"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium hover:bg-black hover:text-white transition"
            >
              Configure domain →
            </Link>
          </div>

          {/* Deploy Engine */}
          <div className="z17-card p-5 space-y-3 bg-white/90">
            <div className="flex items-center gap-2">
              <Rocket className="text-orange-600" />
              <div>
                <div className="text-sm font-semibold">Deploy Engine</div>
                <div className="text-xs text-slate-500">
                  Fire a deployment and inspect preview URLs from one place.
                </div>
              </div>
            </div>
            <Link
              href="/launch/deploy"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium hover:bg-black hover:text-white transition"
            >
              Open Deploy →
            </Link>
          </div>

          {/* Proof-of-Work Pack */}
          <div className="z17-card p-5 space-y-3 bg-white/90">
            <div className="flex items-center gap-2">
              <FileCheck className="text-emerald-700" />
              <div>
                <div className="text-sm font-semibold">Proof-of-Work Pack</div>
                <div className="text-xs text-slate-500">
                  Generate a launch dossier you can show to clients, users, or
                  investors.
                </div>
              </div>
            </div>
            <button
              onClick={generateProof}
              disabled={isBusy}
              className="px-3 py-2 rounded-lg border text-xs font-medium hover:bg-black hover:text-white transition disabled:opacity-50"
            >
              {loading === "proof" ? "Generating…" : "Generate Proof Pack"}
            </button>
            {powPack && (
              <pre className="bg-slate-100 rounded-lg p-3 text-[11px] overflow-x-auto">
                {JSON.stringify(powPack, null, 2)}
              </pre>
            )}
          </div>

          {/* Truth Ledger */}
          <div className="z17-card p-5 space-y-3 bg-white/90">
            <div className="flex items-center gap-2">
              <Hash className="text-purple-700" />
              <div>
                <div className="text-sm font-semibold">Truth Ledger</div>
                <div className="text-xs text-slate-500">
                  Mint a hash of your launch contract for future verification.
                </div>
              </div>
            </div>
            <button
              onClick={generateLedger}
              disabled={isBusy}
              className="px-3 py-2 rounded-lg border text-xs font-medium hover:bg-black hover:text-white transition disabled:opacity-50"
            >
              {loading === "ledger" ? "Hashing…" : "Generate Ledger Hash"}
            </button>
            {ledger && (
              <pre className="bg-slate-100 rounded-lg p-3 text-[11px] overflow-x-auto">
                {JSON.stringify(ledger, null, 2)}
              </pre>
            )}
          </div>

          {/* Launch Mentor Squad */}
          <div className="z17-card p-5 space-y-3 bg-white/90">
            <div className="flex items-center gap-2">
              <Users className="text-sky-700" />
              <div>
                <div className="text-sm font-semibold">Launch Mentor Squad</div>
                <div className="text-xs text-slate-500">
                  A virtual CTO, CMO, Product lead & Legal sentry reviewing your
                  launch.
                </div>
              </div>
            </div>
            <Link
              href="/launch/mentors"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium hover:bg-black hover:text-white transition"
            >
              Open Mentor Squad →
            </Link>
          </div>

          {/* Launch GTM Kit */}
          <div className="z17-card p-5 space-y-3 bg-white/90">
            <div className="flex items-center gap-2">
              <Megaphone className="text-pink-600" />
              <div>
                <div className="text-sm font-semibold">Launch GTM Kit</div>
                <div className="text-xs text-slate-500">
                  Templates for launch posts, emails, PR blurbs and early
                  adopter outreach.
                </div>
              </div>
            </div>
            <Link
              href="/launch/gtm"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium hover:bg-black hover:text-white transition"
            >
              Open GTM Kit →
            </Link>
          </div>

          {/* Launch Room */}
          <div className="z17-card p-5 space-y-3 bg-white/90">
            <div className="flex items-center gap-2">
              <Activity className="text-emerald-600" />
              <div>
                <div className="text-sm font-semibold">Launch Room</div>
                <div className="text-xs text-slate-500">
                  Live snapshot of your first traffic, response and failure
                  signals.
                </div>
              </div>
            </div>
            <Link
              href="/launch/room"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium hover:bg-black hover:text-white transition"
            >
              Open Launch Room →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

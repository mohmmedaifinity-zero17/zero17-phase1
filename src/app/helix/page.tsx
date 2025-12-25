// src/app/helix/page.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  History,
  Link as LinkIcon,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

type HelixStatus = {
  isSignedIn: boolean;
  lastResearch: { id: string; label: string; created_at: string } | null;
  lastGrowthRun: { id: string; label: string; created_at: string } | null;
  helixEvents: {
    id: string;
    source: string;
    kind: string;
    title: string;
    summary: string;
    next_move_summary?: string | null;
    created_at: string;
  }[];
};

export default function HelixPage() {
  const [status, setStatus] = useState<HelixStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/helix/status", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled) setStatus(data);
      } catch (err) {
        console.error("Helix status error", err);
        if (!cancelled) setStatus(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const lastResearchLabel =
    status?.lastResearch?.label ?? "No Research Lab runs yet.";
  const lastGrowthLabel =
    status?.lastGrowthRun?.label ?? "No Growth OS sprints saved yet.";

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-50 pb-16">
      <main className="max-w-6xl mx-auto px-4 pt-8 space-y-6">
        {/* HERO */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-slate-800/70 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-900 px-5 py-5 shadow-2xl shadow-slate-950/70"
        >
          <div className="flex flex-col gap-4">
            {/* Top chips */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 border border-white/10 px-3 py-1">
                <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-200">
                  Helix X · Live Co-Founder
                </span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/70 border border-slate-600/70 px-3 py-1">
                <Sparkles className="w-3 h-3 text-sky-200" />
                <span className="text-[10px] text-slate-100">
                  Reads your Research · Builder · Launch · Growth moves in real
                  time
                </span>
              </div>
            </div>

            {/* Title + copy + link row */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
              <div className="space-y-1.5 max-w-2xl">
                <h1 className="text-[19px] md:text-[21px] font-semibold leading-snug">
                  Helix X — the live co-founder that never forgets your next
                  best move.
                </h1>
                <p className="text-[11px] text-slate-200">
                  Helix watches every serious move you make in Zero17, stitches
                  it into a founder trail, then tells you exactly where to
                  validate, ship or sell next — without the fake productivity
                  theatre.
                </p>
              </div>
              <div className="flex flex-col items-start md:items-end gap-1 text-[10px]">
                <div className="inline-flex items-center gap-2 rounded-2xl border border-sky-400/40 bg-sky-500/15 px-3 py-2">
                  <Brain className="w-4 h-4 text-sky-200" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-50">
                      One brain across Research · Builder · Launch · Growth
                    </span>
                    <span className="text-[10px] text-slate-200/85">
                      Use the Helix pill in the corner during any workflow. This
                      page is your full command deck.
                    </span>
                  </div>
                </div>
                <Link
                  href="/"
                  className="text-[10px] text-slate-200/90 underline underline-offset-4 hover:text-white"
                >
                  Back to Command Deck
                </Link>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ROW 1: Decision Console + Helix Memory */}
        <section className="grid gap-4 md:grid-cols-[minmax(0,1.7fr)_minmax(0,1.1fr)]">
          {/* Decision console */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/60 p-4 shadow-xl shadow-emerald-900/35"
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-300/60 flex items-center justify-center">
                  <History className="w-4 h-4 text-emerald-200" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-semibold text-emerald-50">
                    Decision Console
                  </span>
                  <span className="text-[10px] text-emerald-100/80">
                    You don’t need 20 tasks. You need one honest move in the
                    right OS.
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-3 text-[11px]">
              <div className="rounded-2xl bg-slate-950/85 border border-sky-500/40 px-3 py-2.5 flex flex-col justify-between h-full">
                <div>
                  <p className="font-semibold text-sky-100 mb-0.5">Validate</p>
                  <p className="text-slate-200/90">
                    Unsure if the idea is real? Research Lab pushes you into
                    brutal truth mode.
                  </p>
                </div>
                <Link
                  href="/research?from=helix"
                  className="mt-2 inline-flex items-center gap-1 text-[10px] text-sky-100 hover:text-white"
                >
                  Open Research Lab
                  <LinkIcon className="w-3 h-3" />
                </Link>
              </div>

              <div className="rounded-2xl bg-slate-950/85 border border-emerald-500/40 px-3 py-2.5 flex flex-col justify-between h-full">
                <div>
                  <p className="font-semibold text-emerald-100 mb-0.5">Ship</p>
                  <p className="text-slate-200/90">
                    Too many features in your head? Builder Lab cuts down to a
                    skinny Phase 0 you can actually ship.
                  </p>
                </div>
                <Link
                  href="/builder/arena?from=helix"
                  className="mt-2 inline-flex items-center gap-1 text-[10px] text-emerald-100 hover:text-white"
                >
                  Open Builder Lab
                  <LinkIcon className="w-3 h-3" />
                </Link>
              </div>

              <div className="rounded-2xl bg-slate-950/85 border border-rose-500/40 px-3 py-2.5 flex flex-col justify-between h-full">
                <div>
                  <p className="font-semibold text-rose-100 mb-0.5">
                    Sell &amp; Grow
                  </p>
                  <p className="text-slate-200/90">
                    Silence in the inbox? Growth OS picks one channel, one offer
                    and one honest sprint.
                  </p>
                </div>
                <Link
                  href="/growth?from=helix"
                  className="mt-2 inline-flex items-center gap-1 text-[10px] text-rose-100 hover:text-white"
                >
                  Open Growth OS
                  <LinkIcon className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Helix Memory */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="rounded-3xl border border-violet-400/60 bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950/70 p-4 shadow-xl shadow-violet-900/40"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-violet-500/25 border border-violet-300/60 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-slate-950" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-semibold text-violet-50">
                    Helix Memory (last moves)
                  </span>
                  <span className="text-[10px] text-slate-200/80">
                    Recent serious actions across Research, Builder, Launch
                    &amp; Growth.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-1 rounded-full border border-violet-300/50 px-2 py-1 text-[10px] text-violet-100 hover:bg-violet-500/10"
              >
                <RefreshCw className="w-3 h-3" />
                Refresh
              </button>
            </div>

            <div className="mt-1 text-[10px] text-slate-300">
              {!status?.isSignedIn && (
                <p className="text-slate-300">
                  Not signed in. Use the Helix pill while you work to keep this
                  trail alive.
                </p>
              )}
              {status?.isSignedIn &&
                status.helixEvents.length === 0 &&
                !loading && (
                  <p className="text-slate-300">
                    No Helix memory yet. As you run Research Lab, Builder,
                    Launch and Growth sprints, Helix will stitch the latest
                    moves here.
                  </p>
                )}
              {loading && (
                <p className="text-slate-300">Reading your founder trail…</p>
              )}
            </div>

            {status?.helixEvents?.length ? (
              <div className="mt-2 max-h-52 overflow-y-auto space-y-1.5 pr-1 text-[10px]">
                {status.helixEvents.map((e) => (
                  <div
                    key={e.id}
                    className="rounded-2xl bg-slate-950/90 border border-slate-700/70 px-3 py-2"
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-semibold flex items-center gap-1">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            e.source === "research"
                              ? "bg-sky-400"
                              : e.source === "builder"
                                ? "bg-emerald-400"
                                : e.source === "launch"
                                  ? "bg-amber-400"
                                  : e.source === "growth"
                                    ? "bg-rose-400"
                                    : "bg-slate-400"
                          }`}
                        />
                        {e.title || e.kind || e.source.toUpperCase()}
                      </span>
                      <span className="text-[9px] text-slate-400">
                        {new Date(e.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-200 leading-snug">{e.summary}</p>
                    {e.next_move_summary && (
                      <p className="mt-1 text-[10px] text-slate-300">
                        <span className="font-semibold">Next move: </span>
                        {e.next_move_summary}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : null}
          </motion.div>
        </section>

        {/* ROW 2: Where Helix thinks you are + How to use */}
        <section className="grid gap-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.2fr)] text-[11px]">
          {/* Where Helix thinks you are */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl border border-slate-700/70 bg-slate-950/95 px-4 py-3 shadow-md shadow-slate-950/40"
          >
            <div className="flex items-center gap-2 mb-2">
              <History className="w-4 h-4 text-slate-200" />
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-slate-50">
                  Where Helix thinks you are right now
                </span>
                <span className="text-[10px] text-slate-300">
                  Rough snapshot from your last Research + Growth activity.
                </span>
              </div>
            </div>

            <div className="mt-1 grid gap-2 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-900/90 border border-sky-500/40 px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-sky-200 mb-1">
                  Research · last serious bet
                </p>
                <p className="text-slate-200">{lastResearchLabel}</p>
                <Link
                  href="/research"
                  className="mt-2 inline-flex items-center gap-1 text-[10px] text-sky-100 hover:text-white"
                >
                  Open Research Lab
                  <LinkIcon className="w-3 h-3" />
                </Link>
              </div>
              <div className="rounded-2xl bg-slate-900/90 border border-rose-500/40 px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-rose-200 mb-1">
                  Growth · last sprint
                </p>
                <p className="text-slate-200">{lastGrowthLabel}</p>
                <Link
                  href="/growth"
                  className="mt-2 inline-flex items-center gap-1 text-[10px] text-rose-100 hover:text-white"
                >
                  Open Growth OS
                  <LinkIcon className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* How to use Helix */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="rounded-3xl border border-slate-700/70 bg-slate-950/95 px-4 py-3 shadow-md shadow-slate-950/40"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-sky-200" />
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-slate-50">
                  How to use Helix in Zero17 (simple version)
                </span>
                <span className="text-[10px] text-slate-300">
                  Treat Helix like a ruthless co-founder that tracks your moves
                  and never forgets.
                </span>
              </div>
            </div>
            <ol className="list-decimal list-inside space-y-0.5 text-slate-200 text-[11px]">
              <li>Open the OS that matches your real bottleneck today.</li>
              <li>
                Do one full run only: idea → decision → spec → Phase 0 → sprint
                → honest outcome.
              </li>
              <li>Save the run so Helix can remember it.</li>
              <li>
                Use the Helix pill in the corner to get next-move guidance,
                stuck debugging, and your founder trail.
              </li>
              <li>
                Revisit this page when you feel lost — it will tell you where
                you really are, not where your brain wishes you were.
              </li>
            </ol>
          </motion.div>
        </section>
      </main>
    </div>
  );
}

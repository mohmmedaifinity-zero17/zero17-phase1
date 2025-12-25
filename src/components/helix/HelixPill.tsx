// src/components/helix/HelixPill.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Brain,
  Clock,
  History,
  Lightbulb,
  MessageCircleQuestion,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type HelixMovePayload = {
  source: "research" | "builder" | "launch" | "growth" | string;
  summary: string;
  createdAt: string;
};

type HelixTrailItem = HelixMovePayload & {
  kind: "idea" | "build" | "launch" | "growth" | "other";
};

type HelixTab = "now" | "stuck" | "trail";

const LAST_MOVE_KEY = "z17_last_growth_move";
const TRAIL_KEY = "z17_helix_trail";
const EVENT_NAME = "z17:helixNextMove";

function formatTimeAgo(iso?: string) {
  if (!iso) return "just now";
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function inferPillar(
  pathname: string
): "research" | "builder" | "launch" | "growth" | "home" {
  if (pathname.startsWith("/research")) return "research";
  if (pathname.startsWith("/builder")) return "builder";
  if (pathname.startsWith("/launch")) return "launch";
  if (pathname.startsWith("/growth")) return "growth";
  return "home";
}

function inferStage(pillar: string): "idea" | "mvp" | "launch" | "growth" {
  if (pillar === "research") return "idea";
  if (pillar === "builder") return "mvp";
  if (pillar === "launch") return "launch";
  if (pillar === "growth") return "growth";
  return "idea";
}

function inferBottleneck(pillar: string): string {
  switch (pillar) {
    case "research":
      return "demand proof";
    case "builder":
      return "shipping scope";
    case "launch":
      return "launch assets";
    case "growth":
      return "offers & loops";
    default:
      return "focus & decision";
  }
}

function classifyTrailKind(source: string): HelixTrailItem["kind"] {
  if (source === "research") return "idea";
  if (source === "builder") return "build";
  if (source === "launch") return "launch";
  if (source === "growth" || source === "flywheel") return "growth";
  return "other";
}

export default function HelixPill() {
  const pathname = usePathname() || "/";
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<HelixTab>("now");
  const [lastMove, setLastMove] = useState<HelixMovePayload | null>(null);
  const [trail, setTrail] = useState<HelixTrailItem[]>([]);
  const [stuckChoice, setStuckChoice] = useState<string | null>(null);

  const pillar = useMemo(() => inferPillar(pathname), [pathname]);
  const stage = useMemo(() => inferStage(pillar), [pillar]);
  const bottleneck = useMemo(() => inferBottleneck(pillar), [pillar]);

  const pillSubline = `In ${
    pillar === "home" ? "Command Deck" : pillar.toUpperCase()
  } · ${stage.toUpperCase()} · Bottleneck: ${bottleneck}`;

  // Load from localStorage + subscribe to HELIX events
  useEffect(() => {
    if (typeof window === "undefined") return;
    setMounted(true);

    try {
      const raw = window.localStorage.getItem(LAST_MOVE_KEY);
      if (raw) {
        setLastMove(JSON.parse(raw));
      }
    } catch {
      // ignore
    }

    try {
      const rawTrail = window.localStorage.getItem(TRAIL_KEY);
      if (rawTrail) {
        const items = JSON.parse(rawTrail) as HelixTrailItem[];
        setTrail(items);
      }
    } catch {
      // ignore
    }

    const handler = (e: Event) => {
      try {
        const detail = (e as CustomEvent).detail as HelixMovePayload;
        if (!detail || !detail.summary) return;

        const item: HelixTrailItem = {
          ...detail,
          kind: classifyTrailKind(detail.source),
        };

        setLastMove(detail);

        setTrail((prev) => {
          const next = [item, ...prev].slice(0, 12);
          try {
            window.localStorage.setItem(TRAIL_KEY, JSON.stringify(next));
            window.localStorage.setItem(LAST_MOVE_KEY, JSON.stringify(detail));
          } catch {
            // ignore
          }
          return next;
        });
      } catch {
        // ignore
      }
    };

    window.addEventListener(EVENT_NAME, handler as EventListener);
    return () =>
      window.removeEventListener(EVENT_NAME, handler as EventListener);
  }, []);

  if (!mounted) return null;

  const hideOnAuth =
    pathname.startsWith("/auth") ||
    pathname === "/login" ||
    pathname === "/signup";

  if (hideOnAuth) return null;

  const hasMove = !!lastMove?.summary;

  function gotoPillar(target: "research" | "builder" | "launch" | "growth") {
    setIsOpen(false);
    if (target === "research") router.push("/research?from=helix");
    if (target === "builder") router.push("/builder/arena?from=helix");
    if (target === "launch") router.push("/launch?from=helix");
    if (target === "growth") router.push("/growth?from=helix");
  }

  function clearTrail() {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(TRAIL_KEY);
        window.localStorage.removeItem(LAST_MOVE_KEY);
      }
    } catch {
      // ignore
    }
    setTrail([]);
    setLastMove(null);
  }

  const stuckOptions = [
    {
      id: "dont_know_what_to_write",
      label: "I don’t know what to write here",
    },
    {
      id: "too_many_options",
      label: "Too many options / confused",
    },
    {
      id: "scared_it_wont_work",
      label: "I’m scared this won’t work",
    },
    {
      id: "technical_issue",
      label: "It’s a technical / UI issue",
    },
  ];

  function getStuckDiagnosis(choice: string | null) {
    if (!choice) return null;

    if (pillar === "growth") {
      if (choice === "dont_know_what_to_write") {
        return {
          title: "You’re trying to grow without a sharp offer.",
          bullets: [
            "You don’t need perfect copy. You need one clear promise to one clear ICP.",
            "Pick one outcome (more revenue, time saved, fear removed).",
            "Then use Growth OS to turn that into a simple, testable message.",
          ],
          microSteps: [
            "Write: “I help [who] get [result] without [pain].”",
            "Select one channel where you already have some reach.",
            "Define success for this sprint: replies, calls, or cash.",
          ],
        };
      }
      if (choice === "too_many_options") {
        return {
          title: "You don’t have a growth problem. You have a focus problem.",
          bullets: [
            "Right now you only need one channel, one offer, one experiment.",
            "Multiple channels at tiny volume create zero signal and full anxiety.",
            "Helix will help you pick the smallest, highest leverage test.",
          ],
          microSteps: [
            "Choose ONE channel and ignore the rest for 7 days.",
            "Choose ONE clear outcome (e.g. 5 replies from ICP).",
            "Use Growth OS to start a single sprint and log the outcome.",
          ],
        };
      }
      if (choice === "scared_it_wont_work") {
        return {
          title:
            "You don’t know if it works because you haven’t given it a clean shot.",
          bullets: [
            "Fear is valid — but data is louder.",
            "Most founders quit before a single clean test is completed.",
            "Your job is not to be sure. Your job is to run one honest experiment.",
          ],
          microSteps: [
            "Commit to a micro sprint: 20 messages or 5 calls.",
            "Log the sprint honestly in Growth OS.",
            "Let Helix read the data and suggest the next move.",
          ],
        };
      }
      if (choice === "technical_issue") {
        return {
          title: "Don’t let a minor technical glitch block the whole sprint.",
          bullets: [
            "If a button or form is stuck, your growth shouldn’t be.",
            "Use a manual fallback (sheet, doc, simple DM) and keep moving.",
            "Log the glitch once, fix it scheduled, but don’t stop testing.",
          ],
          microSteps: [
            "Write your sprint details in a simple text area or sheet.",
            "Keep sending messages / doing calls while the bug is queued.",
            "Create a TODO in Builder or Projects to fix the UI later.",
          ],
        };
      }
    }

    if (pillar === "research") {
      return {
        title: "You don’t have an idea problem. You have a clarity problem.",
        bullets: [
          "If you can’t explain the idea in one sentence, Helix can’t validate it properly.",
          "Start with who you serve and what pain you remove — jargon comes last.",
          "Research Lab is built to refine a raw thought into a sharp bet.",
        ],
        microSteps: [
          "Write: “I want to help [who] with [pain] using [rough approach].”",
          "Feed that into Origin Frame in Research Lab.",
          "Run Quantum Insight and let Helix tell you what’s real vs fantasy.",
        ],
      };
    }

    if (pillar === "builder") {
      return {
        title: "You’re overbuilding mentally before you’ve scoped Phase 0.",
        bullets: [
          "Phase 0 is not the whole product. It’s the smallest thing that proves value.",
          "A clean spec beats a huge idea cloud every single time.",
          "Builder Lab is made to cut the fat — let it.",
        ],
        microSteps: [
          "List 3–5 core user actions you want in the first version.",
          "Mark everything else as Phase 1 or Phase 2.",
          "Use Builder Lab to generate the Phase 0 blueprint and stop there for now.",
        ],
      };
    }

    if (pillar === "launch") {
      return {
        title: "You’ve done the hard work, but nobody knows.",
        bullets: [
          "Launch is not a big bang; it’s a sequence of clear signals to a clear audience.",
          "You don’t need a perfect campaign. You need one concrete date and a small list.",
          "Helix will help you decide what ‘launch’ actually means for this product.",
        ],
        microSteps: [
          "Pick a launch date within the next 21 days.",
          "Define what ‘done’ means: a Loom, a landing page, or a live link.",
          "Use Launch Engine to create 3–5 proof-of-work assets you can share.",
        ],
      };
    }

    return {
      title: "You’re not stuck. You’re missing one clear decision.",
      bullets: [
        "Most ‘stuck’ moments are missing decisions, not missing talent.",
        "Helix can’t make you feel ready. It can make your next step obvious.",
        "Decide what you’re optimizing for this week: validate, ship, or sell.",
      ],
      microSteps: [
        "Pick ONE priority for this week (validate / ship / sell).",
        "Open the matching OS (Research / Builder / Growth).",
        "Let Helix suggest a single micro move and commit to it.",
      ],
    };
  }

  const diagnosis = getStuckDiagnosis(stuckChoice);

  const hideOverlayOnAuth = hideOnAuth;

  return (
    <>
      {/* Click-outside overlay */}
      <AnimatePresence>
        {isOpen && !hideOverlayOnAuth && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.32 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-md"
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-4 right-4 z-50">
        {/* Compact pill — hidden when dock open */}
        {!isOpen && (
          <motion.button
            type="button"
            onClick={() => {
              setIsOpen(true);
              setActiveTab("now");
            }}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="flex items-center gap-2 rounded-full 
              bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-800
              px-2 py-1.5 shadow-lg shadow-slate-900/60 border border-white/15
              backdrop-blur-xl text-[10px] text-white hover:shadow-xl
              hover:-translate-y-0.5 active:translate-y-0 focus:outline-none
              focus:ring-2 focus:ring-indigo-400/80 max-w-[160px]"
          >
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-black/30 border border-white/25 shadow-inner">
              <Sparkles className="w-3 h-3" />
            </div>
            <div className="flex flex-col text-left max-w-[110px]">
              <span
                className="text-[14px] font-extrabold leading-tight tracking-tight
                  bg-gradient-to-r from-slate-50 via-sky-100 to-indigo-100
                  bg-clip-text text-transparent"
              >
                HELIX X
              </span>
              <span className="text-[10px] font-semibold text-slate-100/90">
                LIVE CO-FOUNDER
              </span>
            </div>
          </motion.button>
        )}

        {/* Dock */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 8, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative z-50 mt-2 w-[360px] max-w-[calc(100vw-2rem)]
                rounded-2xl bg-slate-950/95 border border-violet-500/40 shadow-2xl
                shadow-violet-800/40 backdrop-blur-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="px-3.5 py-2.5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 via-fuchsia-400 to-sky-400 flex items-center justify-center shadow-md">
                    <Brain className="w-4 h-4 text-slate-950" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-slate-50 tracking-tight flex items-center gap-1">
                      Helix X
                      <span className="text-[9px] uppercase text-violet-100/90 bg-violet-500/25 px-1.5 py-0.5 rounded-full border border-violet-300/40">
                        Live co-founder
                      </span>
                    </span>
                    <span className="text-[10px] text-slate-300/90 line-clamp-1">
                      {pillSubline}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full hover:bg-white/10 text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="px-3.5 pt-2 flex items-center gap-1 text-[10px]">
                <button
                  type="button"
                  onClick={() => setActiveTab("now")}
                  className={`flex-1 rounded-full px-2 py-1.5 border text-center ${
                    activeTab === "now"
                      ? "border-violet-300/70 bg-violet-500/20 text-violet-100"
                      : "border-transparent text-slate-400 hover:bg-slate-900/80"
                  }`}
                >
                  Now
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("stuck")}
                  className={`flex-1 rounded-full px-2 py-1.5 border text-center ${
                    activeTab === "stuck"
                      ? "border-amber-300/70 bg-amber-500/15 text-amber-100"
                      : "border-transparent text-slate-400 hover:bg-slate-900/80"
                  }`}
                >
                  I’m stuck
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("trail")}
                  className={`flex-1 rounded-full px-2 py-1.5 border text-center ${
                    activeTab === "trail"
                      ? "border-sky-300/70 bg-sky-500/15 text-sky-100"
                      : "border-transparent text-slate-400 hover:bg-slate-900/80"
                  }`}
                >
                  Trail
                </button>
              </div>

              {/* Body */}
              <div className="px-3.5 py-3 space-y-3">
                {activeTab === "now" && (
                  <>
                    {/* Next move */}
                    <div className="rounded-xl bg-slate-900/90 border border-white/12 px-3 py-2.5 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-50">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
                          <span>Next best move</span>
                        </div>
                        {lastMove?.createdAt && (
                          <span className="flex items-center gap-1 text-[10px] text-slate-400">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(lastMove.createdAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-200 leading-snug">
                        {hasMove
                          ? lastMove!.summary
                          : "You haven’t committed a serious move yet. Start in Research, Builder or Growth — Helix will pin your sharpest next step here."}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (lastMove?.source === "research")
                              gotoPillar("research");
                            else if (lastMove?.source === "builder")
                              gotoPillar("builder");
                            else if (lastMove?.source === "launch")
                              gotoPillar("launch");
                            else if (lastMove?.source === "growth")
                              gotoPillar("growth");
                            else router.push("/helix");
                          }}
                          className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/90 text-[11px] font-semibold text-white px-3 py-1.5 hover:bg-violet-400"
                        >
                          Go execute
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab("stuck")}
                          className="inline-flex items-center gap-1 text-[10px] text-amber-100/90 hover:text-white"
                        >
                          <MessageCircleQuestion className="w-3 h-3" />
                          I’m stuck
                        </button>
                      </div>
                    </div>

                    {/* Compact Decision Console */}
                    <div className="rounded-xl bg-slate-950/95 border border-emerald-500/40 px-3 py-2.5 space-y-1.5 text-[10px]">
                      <div className="flex items-center gap-1.5 text-emerald-200">
                        <Target className="w-3.5 h-3.5" />
                        <span className="font-semibold">Decision console</span>
                      </div>
                      <p className="text-slate-300">
                        You don’t need 20 tasks. You need one honest move in the
                        right OS.
                      </p>
                      <ul className="space-y-0.5 text-slate-200">
                        <li>
                          • <span className="font-semibold">Validate?</span>{" "}
                          Open{" "}
                          <button
                            type="button"
                            onClick={() => gotoPillar("research")}
                            className="underline underline-offset-2 hover:text-emerald-200"
                          >
                            Research Lab
                          </button>{" "}
                          and lock one bet.
                        </li>
                        <li>
                          • <span className="font-semibold">Ship?</span> Open{" "}
                          <button
                            type="button"
                            onClick={() => gotoPillar("builder")}
                            className="underline underline-offset-2 hover:text-emerald-200"
                          >
                            Builder Lab
                          </button>{" "}
                          and define Phase 0 only.
                        </li>
                        <li>
                          • <span className="font-semibold">Sell?</span> Open{" "}
                          <button
                            type="button"
                            onClick={() => gotoPillar("growth")}
                            className="underline underline-offset-2 hover:text-emerald-200"
                          >
                            Growth OS
                          </button>{" "}
                          and start one sprint.
                        </li>
                      </ul>
                    </div>

                    {/* Rails to pillars */}
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <button
                        type="button"
                        onClick={() => gotoPillar("research")}
                        className="flex flex-col items-start gap-1 rounded-xl border border-sky-400/50 bg-sky-500/10 px-2.5 py-2 text-sky-100 hover:bg-sky-500/20"
                      >
                        <span className="font-semibold flex items-center gap-1">
                          Research Lab
                          <ArrowUpRight className="w-3 h-3" />
                        </span>
                        <span className="text-[10px] text-sky-100/80">
                          Sharpen the bet, score reality, save a blueprint.
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => gotoPillar("builder")}
                        className="flex flex-col items-start gap-1 rounded-xl border border-emerald-400/50 bg-emerald-500/10 px-2.5 py-2 text-emerald-100 hover:bg-emerald-500/20"
                      >
                        <span className="font-semibold flex items-center gap-1">
                          Builder Lab
                          <ArrowUpRight className="w-3 h-3" />
                        </span>
                        <span className="text-[10px] text-emerald-100/80">
                          Turn blueprint into a skinny, honest MVP.
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => gotoPillar("launch")}
                        className="flex flex-col items-start gap-1 rounded-xl border border-amber-400/50 bg-amber-500/10 px-2.5 py-2 text-amber-100 hover:bg-amber-500/20"
                      >
                        <span className="font-semibold flex items-center gap-1">
                          Launch Engine
                          <ArrowUpRight className="w-3 h-3" />
                        </span>
                        <span className="text-[10px] text-amber-100/80">
                          Turn work into a real launch and proof-of-work.
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => gotoPillar("growth")}
                        className="flex flex-col items-start gap-1 rounded-xl border border-rose-400/50 bg-rose-500/10 px-2.5 py-2 text-rose-100 hover:bg-rose-500/20"
                      >
                        <span className="font-semibold flex items-center gap-1">
                          Growth OS
                          <ArrowUpRight className="w-3 h-3" />
                        </span>
                        <span className="text-[10px] text-rose-100/80">
                          Design sprints, loops and real demand.
                        </span>
                      </button>
                    </div>

                    {/* Helix home + clear */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <Link
                        href="/helix"
                        className="inline-flex items-center gap-1 rounded-full px-2 py-1 hover:bg-slate-900/70 text-slate-200"
                      >
                        <Brain className="w-3 h-3" />
                        Open Helix home
                      </Link>
                      <button
                        type="button"
                        onClick={clearTrail}
                        className="inline-flex items-center gap-1 rounded-full px-2 py-1 hover:bg-slate-900/70 text-slate-300"
                      >
                        <History className="w-3 h-3" />
                        Clear memory
                      </button>
                    </div>
                  </>
                )}

                {activeTab === "stuck" && (
                  <>
                    <div className="rounded-xl bg-amber-500/10 border border-amber-400/40 px-3 py-2.5 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-100">
                        <MessageCircleQuestion className="w-3.5 h-3.5" />
                        <span>Okay, let’s debug this moment.</span>
                      </div>
                      <p className="text-[11px] text-amber-50/90 leading-snug">
                        Helix will look at where you are in the OS and turn “I’m
                        stuck” into one clear next micro-move.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-300">
                        Where do you feel stuck right now?
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {stuckOptions.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setStuckChoice(opt.id)}
                            className={`rounded-full px-2.5 py-1.5 text-[10px] border ${
                              stuckChoice === opt.id
                                ? "border-amber-300 bg-amber-500/20 text-amber-50"
                                : "border-slate-700 bg-slate-900/80 text-slate-200 hover:border-amber-300/60 hover:bg-slate-900"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {diagnosis && (
                      <div className="rounded-xl bg-slate-900/90 border border-white/10 px-3 py-2.5 space-y-1.5">
                        <div className="text-[11px] font-semibold text-slate-50">
                          {diagnosis.title}
                        </div>
                        <ul className="list-disc list-inside space-y-0.5 text-[10px] text-slate-300">
                          {diagnosis.bullets.map((b) => (
                            <li key={b}>{b}</li>
                          ))}
                        </ul>
                        <div className="mt-1 space-y-1">
                          <p className="text-[10px] font-semibold text-slate-200">
                            Do this now (3 tiny steps):
                          </p>
                          <ol className="list-decimal list-inside space-y-0.5 text-[10px] text-slate-300">
                            {diagnosis.microSteps.map((s) => (
                              <li key={s}>{s}</li>
                            ))}
                          </ol>
                        </div>
                        <p className="mt-1 text-[10px] text-slate-400">
                          In future, we’ll auto-fill these into the right fields
                          inside{" "}
                          {pillar === "home" ? "Zero17" : pillar.toUpperCase()}{" "}
                          for you. For now, treat this like a live co-founder
                          checklist.
                        </p>
                      </div>
                    )}
                  </>
                )}

                {activeTab === "trail" && (
                  <>
                    <div className="flex items-center justify-between text-[11px] text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <History className="w-3.5 h-3.5 text-sky-300" />
                        <span>Founder trail (last 12 moves)</span>
                      </div>
                      <button
                        type="button"
                        onClick={clearTrail}
                        className="text-[10px] text-slate-400 hover:text-slate-100"
                      >
                        Clear
                      </button>
                    </div>
                    {trail.length === 0 ? (
                      <p className="text-[10px] text-slate-400">
                        As you run research, builds, launch plans and growth
                        sprints, Helix will stitch them here into your timeline.
                      </p>
                    ) : (
                      <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                        {trail.map((item, idx) => (
                          <div
                            key={`${item.createdAt}-${idx}`}
                            className="rounded-lg bg-slate-900/85 border border-slate-700/70 px-2.5 py-2 text-[10px] text-slate-200"
                          >
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="font-semibold flex items-center gap-1">
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    item.kind === "idea"
                                      ? "bg-sky-400"
                                      : item.kind === "build"
                                        ? "bg-emerald-400"
                                        : item.kind === "launch"
                                          ? "bg-amber-400"
                                          : item.kind === "growth"
                                            ? "bg-rose-400"
                                            : "bg-slate-400"
                                  }`}
                                />
                                {item.source.toUpperCase()}
                              </span>
                              <span className="flex items-center gap-1 text-[9px] text-slate-400">
                                <Clock className="w-3 h-3" />
                                {formatTimeAgo(item.createdAt)}
                              </span>
                            </div>
                            <p className="text-[10px] leading-snug">
                              {item.summary}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <Link
                        href="/helix"
                        className="inline-flex items-center gap-1 rounded-full px-2 py-1 hover:bg-slate-900/70 text-slate-200"
                      >
                        <Brain className="w-3 h-3" />
                        Open full Cofounder X view
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

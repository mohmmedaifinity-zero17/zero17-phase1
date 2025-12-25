// src/components/research/ResearchLabShell.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Beaker,
  Sparkles,
  ListChecks,
  ShieldAlert,
  FileText,
  Lightbulb,
  ArrowRight,
  Wand2,
  FlaskConical,
  Rocket,
  Activity,
  RefreshCw,
  Calculator,
  Brain,
  TrendingUp,
} from "lucide-react";

import {
  loadResearchSnapshot,
  saveResearchSnapshot,
  clearResearchSnapshot,
  ResearchSnapshot,
} from "@/components/research/researchSnapshot";

export default function ResearchLabShell() {
  const [idea, setIdea] = useState("");
  const [icp, setIcp] = useState("");
  const [outcome, setOutcome] = useState("");
  const [mustHaves, setMustHaves] = useState("");
  const [tone, setTone] = useState("Practical");
  const [marketType, setMarketType] = useState("SMB");

  // QIE + star outputs
  const [qieSummary, setQieSummary] = useState("");
  const [qieVerdict, setQieVerdict] = useState("");
  const [opportunityMap, setOpportunityMap] = useState("");
  const [starFeatures, setStarFeatures] = useState("");
  const [narrative, setNarrative] = useState("");

  // Evidence / validation
  const [evidence, setEvidence] = useState("");

  // Improvement passes
  const [parityPass, setParityPass] = useState("");
  const [diffPass, setDiffPass] = useState("");
  const [inventPass, setInventPass] = useState("");
  const [activeImproveTab, setActiveImproveTab] = useState<
    "parity" | "diff" | "invent"
  >("parity");

  // Risk / feasibility / blueprint / synthesis
  const [riskSummary, setRiskSummary] = useState("");
  const [feasibility, setFeasibility] = useState("");
  const [buildabilityScore, setBuildabilityScore] = useState(0);
  const [buildabilityBreakdown, setBuildabilityBreakdown] = useState<
    { label: string; score: number }[]
  >([]);

  const [blueprint, setBlueprint] = useState("");
  const [ideaExplain, setIdeaExplain] = useState("");

  const [synthInput2, setSynthInput2] = useState("");
  const [synthInput3, setSynthInput3] = useState("");
  const [synthResult, setSynthResult] = useState("");

  // Loading flags
  const [loadingQie, setLoadingQie] = useState(false);
  const [loadingEvidence, setLoadingEvidence] = useState(false);
  const [loadingImprove, setLoadingImprove] = useState(false);
  const [loadingRisk, setLoadingRisk] = useState(false);
  const [loadingBlueprint, setLoadingBlueprint] = useState(false);
  const [loadingSynth, setLoadingSynth] = useState(false);
  const [loadingExplain, setLoadingExplain] = useState(false);
  const [loadingFeasibility, setLoadingFeasibility] = useState(false);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Scroll refs for mini-guide
  const heroRef = useRef<HTMLDivElement | null>(null);
  const qieRef = useRef<HTMLDivElement | null>(null);
  const intakeRef = useRef<HTMLDivElement | null>(null);
  const evidenceRef = useRef<HTMLDivElement | null>(null);
  const improveRef = useRef<HTMLDivElement | null>(null);
  const riskRef = useRef<HTMLDivElement | null>(null);
  const blueprintRef = useRef<HTMLDivElement | null>(null);
  const synthRef = useRef<HTMLDivElement | null>(null);

  const canRun = !!idea.trim();

  // Load snapshot on mount
  useEffect(() => {
    const snap = loadResearchSnapshot();
    if (snap) {
      setIdea(snap.idea || "");
      setIcp(snap.icp || "");
      setOutcome(snap.outcome || "");
      setMustHaves(snap.mustHaves || "");
      setTone(snap.tone || "Practical");
      setMarketType(snap.marketType || "SMB");
      setQieSummary(snap.lastQieSummary || "");
    }
  }, []);

  function scrollTo(ref: React.RefObject<HTMLDivElement>) {
    if (!ref.current) return;
    ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function persistSnapshot(stage: string, extra?: Partial<ResearchSnapshot>) {
    saveResearchSnapshot({
      idea,
      icp,
      outcome,
      mustHaves,
      tone,
      marketType,
      stage,
      blueprintHeadline: blueprintHeadlineFromIdea(idea, outcome),
      lastQieSummary: qieSummary,
      ...extra,
    });
  }

  // ---------- STAR FEATURE: QIE ----------

  async function runQie() {
    if (!canRun) return;
    setLoadingQie(true);
    setStatusMessage(null);
    await fakeDelay(1000);

    const baseOutcome = outcome || "a clear, measurable win for this ICP";

    const summary = [
      `• This idea targets ${marketType} users with outcome: ${baseOutcome}.`,
      `• ICP: ${icp || "not yet specified"} — sharpening this will multiply growth.`,
      "• Direction: OS-style tools that compress validation → build → launch → growth are experiencing strong tailwinds.",
      "",
      "QIE view:",
      "• This idea is strongest when framed as a 'founder operating system', not a generic AI assistant.",
      "• The moat lives in: orchestration, proof-of-work, and compounding loops — not just code generation.",
    ].join("\n");

    const opp = [
      "Opportunity map:",
      "",
      "• Short-term: solo founders and micro agencies who need to ship credible MVPs faster.",
      "• Mid-term: small teams who want repeatable launch & growth playbooks.",
      "• Long-term: becoming the default OS layer for building and monetizing new products.",
      "",
      "Heat zones:",
      "• Hot: AI-assisted building, launch automation, growth loops, proof-based trust.",
      "• Warm: generic coding copilots, undifferentiated project planners.",
    ].join("\n");

    const stars = [
      "Star feature directions (from QIE):",
      "",
      "1) Quantum Idea Engine → turn any prompt into a category-level thesis.",
      "2) Truth Ledger → notarise every build, test and growth experiment.",
      "3) Growth Oracle → forward-looking growth strategy, not just analytics.",
      "4) Agent Employees → plug-and-play expert roles for build + growth.",
      "",
      "Pick 1–2 to anchor the product story; others can come later.",
    ].join("\n");

    const story = [
      "Narrative positioning:",
      "",
      "• Category: 'Founder Operating System', not 'AI builder' or 'prompt tool'.",
      "• Frame: 'From idea → ₹1 crore faster — with proof at every step.'",
      "• Tagline: 'The business solar system for serious builders.'",
    ].join("\n");

    const worth =
      idea.length > 140 && outcome.trim() && icp.trim()
        ? "High potential — worth building with a tight, focused MVP."
        : "Promising, but sharpen ICP and outcome before heavy build investment.";

    setQieSummary(summary);
    setOpportunityMap(opp);
    setStarFeatures(stars);
    setNarrative(story);
    setQieVerdict(worth);

    persistSnapshot("QIE complete", {
      lastQieSummary: summary,
    });

    // also recompute buildability when QIE runs
    computeBuildability();
    setStatusMessage("QIE updated — HELIX and Builder now see this thesis.");
    setLoadingQie(false);
  }

  // ---------- Evidence / Validation ----------

  async function runEvidence() {
    if (!canRun) return;
    setLoadingEvidence(true);
    setStatusMessage(null);
    await fakeDelay(900);

    const text = [
      "Evidence & validation snapshot:",
      "",
      "• Mirror competitors:",
      "  - Expect several AI build tools, coding copilots, and launch helpers.",
      "  - Very few offer an integrated 'business OS' with research + build + growth + proof.",
      "",
      "• Market pulse:",
      "  - Strong pull for tools that compress time-to-first-customer.",
      "  - Founders are overwhelmed by fragmented stacks and generic AI answers.",
      "",
      "• Early adopters:",
      "  - People already using AI daily, who feel their workflows are chaotic.",
      "  - Builders who ship in public and care about proof, not theory.",
      "",
      "• Validation moves:",
      "  - 3–5 founder interviews asking 'What slows you between idea and paying users?'",
      "  - Run a waitlist with a focused promise: 'Launch a proof-backed MVP in 30 days.'",
    ].join("\n");

    setEvidence(text);
    setStatusMessage("Evidence + market pulse generated.");
    setLoadingEvidence(false);
  }

  // ---------- Improvement Engine ----------

  async function runImprovementPass(kind: "parity" | "diff" | "invent") {
    if (!canRun) return;
    setLoadingImprove(true);
    setStatusMessage(null);
    await fakeDelay(850);

    if (kind === "parity") {
      const text = [
        "Parity pass — catch up to world-class baseline:",
        "",
        "• Match core expectations:",
        "  - Clear onboarding that explains the OS in one screen.",
        "  - Obvious dashboards for 'Research', 'Build', 'Launch', 'Growth'.",
        "  - Simple pricing, no surprises.",
        "",
        `• Must-have coverage: ${mustHaves || "define at least technical, budget and risk constraints."}`,
        "",
        "• Benchmark yourself against 3–5 tools:",
        "  - Do they provide faster insight, faster build, faster launch, or just answers?",
      ].join("\n");
      setParityPass(text);
    } else if (kind === "diff") {
      const text = [
        "Differentiation pass — what makes this unmistakable:",
        "",
        `• For ${icp || "your ICP"}, what can you promise that no one credible can match?`,
        "  - e.g., 'From idea → live MVP + proof in under 7 days.'",
        "  - e.g., 'Each build produces a Proof Pack and Truth Ledger entry.'",
        "",
        "• Remove anything that doesn't strengthen that promise.",
        "• Your brand should feel like a cofounder, not a tool.",
      ].join("\n");
      setDiffPass(text);
    } else {
      const text = [
        "Invention pass — create never-seen star features:",
        "",
        "• Example star features:",
        "  - 'What-If Mode': instantly re-plan the product if ICP, pricing or loops change.",
        "  - 'Boardroom Simulation': see how CTO, CPO, VC, Growth lead would react.",
        "  - 'Infinite Loop Designer': design compounding growth loops visually, then simulate them.",
        "",
        "• Choose 1–2 inventions that fit your ICP and ignore the rest for v1.",
      ].join("\n");
      setInventPass(text);
    }

    setStatusMessage(
      "Improvement pass updated — refine idea, then re-run QIE if needed."
    );
    setLoadingImprove(false);
  }

  // ---------- Risk Engine ----------

  async function runRisk() {
    if (!canRun) return;
    setLoadingRisk(true);
    setStatusMessage(null);
    await fakeDelay(900);

    const text = [
      "Risk engine:",
      "",
      "• Compliance / data:",
      "  - Are you processing user data? What type? Where is it stored?",
      "  - Do you keep prompts or logs that contain secrets or PII?",
      "",
      "• Engineering:",
      "  - Over-building orchestration before you have 10–20 active users.",
      "  - Mixing too many external tools; risk of a fragile stack.",
      "",
      "• Market:",
      "  - Confusing message: 'AI everything' instead of 'specific outcome'.",
      "  - Category fatigue around generic 'AI builders'.",
      "",
      "• Churn:",
      "  - No clear 'I won' moment within days or weeks.",
      "  - Users don’t know what to do next after first success.",
      "",
      "Mitigation suggestions:",
      "  - Pick one ICP and one type of 'win' (e.g., 'launch MVP + first 5 users').",
      "  - Keep v1 architecture brutally simple.",
      "  - Make the proof-of-win visible as soon as possible.",
    ].join("\n");

    setRiskSummary(text);
    setStatusMessage(
      "Risk map generated — use this to shape scope and messaging."
    );
    setLoadingRisk(false);
  }

  // ---------- Feasibility + Buildability Score ----------

  async function runFeasibility() {
    if (!canRun) return;
    setLoadingFeasibility(true);
    setStatusMessage(null);
    await fakeDelay(900);

    const text = [
      "Feasibility & costing (v1, opinionated):",
      "",
      "• Suggested stack:",
      "  - Next.js 14 + Supabase + Vercel + ChatGPT + Cursor.",
      "  - Enough to ship Research + Builder + Launch + Growth for early users.",
      "",
      "• Build time (solo):",
      "  - 3–6 weeks for v1 if scope is sharp.",
      "",
      "• Infra cost (early stage):",
      "  - Mostly AI usage and some logging/monitoring.",
      "",
      "• Constraints:",
      "  - Avoid over-automating everything in v1 — let a few flows be manual.",
      "",
      "• Execution rule:",
      "  - Ship a 'proofable' version, not a 'complete' version.",
    ].join("\n");

    setFeasibility(text);
    computeBuildability();
    setStatusMessage("Feasibility + buildability updated.");
    setLoadingFeasibility(false);
  }

  function computeBuildability() {
    // very simple heuristic for now
    let score = 50;
    if (idea.length > 160) score += 10;
    if (icp.trim()) score += 10;
    if (outcome.trim()) score += 10;
    if (mustHaves.trim()) score += 5;
    if (marketType === "SMB" || marketType === "Prosumer") score += 5;

    if (score > 100) score = 100;

    const breakdown = [
      { label: "Problem certainty", score: clamp((idea.length / 200) * 100) },
      { label: "ICP clarity", score: clamp((icp.length / 80) * 100) },
      { label: "Outcome clarity", score: clamp((outcome.length / 80) * 100) },
      { label: "Category velocity", score: 80 },
      { label: "Technical feasibility", score: 75 },
      { label: "Data advantage", score: 60 },
      { label: "Competitive moat", score: 70 },
      { label: "Growth potential", score: 85 },
      { label: "Revenue shape", score: 70 },
      { label: "Execution fit (solo)", score: 65 },
    ];

    setBuildabilityScore(score);
    setBuildabilityBreakdown(breakdown);
  }

  // ---------- Blueprint ----------

  async function runBlueprint() {
    if (!canRun) return;
    setLoadingBlueprint(true);
    setStatusMessage(null);
    await fakeDelay(1100);

    const headline = blueprintHeadlineFromIdea(idea, outcome);

    const text = [
      `Blueprint: ${headline}`,
      "",
      "1) Core user & problem",
      `   • ICP: ${icp || "define segment, role, region, budget."}`,
      `   • Problem: they struggle to go from idea → live proof → revenue quickly.`,
      "",
      "2) Product shape",
      "   • Surfaces:",
      "     - Research Lab (this screen): from idea to thesis.",
      "     - Builder Lab: from blueprint to working product.",
      "     - Launch Engine: from product to public launch & ledger.",
      "     - Growth OS: from launch to repeatable revenue.",
      "",
      "   • Core loop:",
      "     - Input: idea + context.",
      "     - Process: QIE → improvement → risk → feasibility → blueprint.",
      "     - Output: clear build + growth plan with proof of thinking.",
      "",
      "3) Data model (v1 sketch)",
      "   • Project: id, name, status, icp, outcome, must_haves.",
      "   • ResearchSnapshot: qie_summary, risks, opportunities, star_features.",
      "   • BuildArtifact: repo_link, qa_report, ledger_hash.",
      "   • GrowthPlan: channels, loops, campaigns, metrics.",
      "",
      "4) Non-goals for v1",
      "   • No multi-team features.",
      "   • No complex billing plans.",
      "   • No infinite themeing; a few strong presets are enough.",
      "",
      "5) GTM seed plan",
      "   • Talk to 10–20 ICP-aligned founders and agencies.",
      "   • Ship one public case study: 'From idea → live MVP → first users'.",
      "   • Use Growth OS to design 7-day sprints and loops.",
    ].join("\n");

    setBlueprint(text);
    persistSnapshot("Blueprint ready", { blueprintHeadline: headline });
    setStatusMessage("Blueprint v2 generated — hooked into Builder & Growth.");
    setLoadingBlueprint(false);
  }

  // ---------- Explain idea ----------

  async function runExplainIdea() {
    if (!canRun) return;
    setLoadingExplain(true);
    setStatusMessage(null);
    await fakeDelay(750);

    const text = [
      "Plain-language explanation:",
      "",
      `• You want to help ${icp || "a specific type of builder"} go from idea → live proof → revenue faster.`,
      "• Instead of separate tools for research, building, launching and growth, you give them one OS.",
      `• The core promise is: ${outcome || "a sharply defined, measurable win."}`,
      "",
      `Tone: ${tone} • Market: ${marketType}`,
      "",
      "Goal: someone outside tech should understand this idea in under 30 seconds.",
    ].join("\n");

    setIdeaExplain(text);
    setStatusMessage("Idea explanation generated.");
    setLoadingExplain(false);
  }

  // ---------- Synthesis ----------

  async function runSynthesis() {
    if (!idea.trim() || !synthInput2.trim()) return;
    setLoadingSynth(true);
    setStatusMessage(null);
    await fakeDelay(1100);

    const text = [
      "Synthesis: merging ideas into one category-defining thesis",
      "",
      `• Idea A: ${truncate(idea, 80)}`,
      `• Idea B: ${truncate(synthInput2, 80)}`,
      synthInput3.trim() && `• Idea C: ${truncate(synthInput3, 80)}`,
      "",
      "Direction:",
      "   • Choose one primary ICP and one primary outcome that spans all ideas.",
      "   • Merge the strongest star features; remove anything that doesn't reinforce them.",
      "   • Shape one OS, not three disconnected tools.",
      "",
      "Suggestion:",
      "   • Call this a 'Business Solar System': research, build, launch and growth in one orbit.",
    ]
      .filter(Boolean)
      .join("\n");

    setSynthResult(text);
    setStatusMessage(
      "Synthesis result created — use this to lock your single best play."
    );
    setLoadingSynth(false);
  }

  // ---------- Reset ----------

  function handleResetLab() {
    setIdea("");
    setIcp("");
    setOutcome("");
    setMustHaves("");
    setTone("Practical");
    setMarketType("SMB");
    setQieSummary("");
    setQieVerdict("");
    setOpportunityMap("");
    setStarFeatures("");
    setNarrative("");
    setEvidence("");
    setParityPass("");
    setDiffPass("");
    setInventPass("");
    setRiskSummary("");
    setFeasibility("");
    setBuildabilityScore(0);
    setBuildabilityBreakdown([]);
    setBlueprint("");
    setIdeaExplain("");
    setSynthInput2("");
    setSynthInput3("");
    setSynthResult("");
    clearResearchSnapshot();
    setStatusMessage("Lab reset. HELIX will wait for your next thesis.");
  }

  // ---------- UI ----------

  return (
    <div className="space-y-6">
      {/* HERO */}
      <section
        ref={heroRef}
        className="rounded-3xl border border-sky-200 bg-gradient-to-br from-slate-900 via-slate-950 to-sky-900 px-5 py-5 text-slate-50 shadow-xl"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1 rounded-full bg-sky-500/20 border border-sky-400/70 px-2 py-0.5 text-[10px]">
              <Beaker className="w-3 h-3" />
              Research Lab • God-mode v4.0
            </div>
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
              Turn raw ideas into{" "}
              <span className="text-sky-200">
                validated, launch-ready blueprints
              </span>{" "}
              in one screen.
            </h1>
            <p className="text-[11px] text-slate-200">
              Built with patterns from top founders, VCs and product chiefs —
              but compressed into a single cockpit you can run in minutes.
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2 text-[10px] text-slate-200">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-sky-400/60 bg-slate-950/75 px-3 py-2">
              <Sparkles className="w-4 h-4 text-sky-200" />
              <div className="flex flex-col">
                <span className="font-semibold">Quantum Idea Engine</span>
                <span className="text-[9px] text-sky-100/80">
                  The crown jewel of the lab — run it once per idea.
                </span>
              </div>
            </div>
            {statusMessage && (
              <div className="text-[10px] text-emerald-200 max-w-xs text-right">
                {statusMessage}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* HOW TO USE */}
      <section className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <ListChecks className="w-3.5 h-3.5 text-slate-700" />
            <span className="text-[11px] font-semibold text-slate-900">
              How to use this lab in 5 moves
            </span>
          </div>
          <button
            type="button"
            onClick={handleResetLab}
            className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-2 py-0.5 text-[10px] text-slate-600 hover:border-rose-400 hover:text-rose-500"
          >
            <RefreshCw className="w-3 h-3" />
            Reset lab
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-[10px] text-slate-700">
          <StepChip
            label="1. Describe idea"
            icon={<Lightbulb className="w-3 h-3" />}
            onClick={() => scrollTo(intakeRef)}
          />
          <StepChip
            label="2. Run QIE"
            icon={<FlaskConical className="w-3 h-3" />}
            onClick={() => scrollTo(qieRef)}
          />
          <StepChip
            label="3. Improve & de-risk"
            icon={<ShieldAlert className="w-3 h-3" />}
            onClick={() => scrollTo(improveRef)}
          />
          <StepChip
            label="4. Evidence & buildability"
            icon={<Activity className="w-3 h-3" />}
            onClick={() => scrollTo(evidenceRef)}
          />
          <StepChip
            label="5. Generate blueprint"
            icon={<FileText className="w-3 h-3" />}
            onClick={() => scrollTo(blueprintRef)}
          />
        </div>
      </section>

      {/* STAR FEATURE: QIE */}
      <section
        ref={qieRef}
        className="rounded-2xl border border-sky-300 bg-gradient-to-br from-sky-500/15 via-indigo-500/15 to-slate-900 px-4 py-4 text-[11px] text-slate-50 shadow-md"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="space-y-1 max-w-xl">
            <div className="inline-flex items-center gap-1 rounded-full bg-sky-500/25 border border-sky-300 px-2 py-0.5 text-[10px] text-sky-50">
              <Sparkles className="w-3 h-3" />
              Star feature • Quantum Idea Engine
            </div>
            <div className="font-semibold">
              The most advanced idea evaluator on Earth — run it before you
              write a line of code.
            </div>
            <p className="text-[10px] text-sky-100/90">
              It maps opportunity, star features, narrative and feasibility in
              one shot — then feeds Builder and Growth.
            </p>
          </div>
          <button
            type="button"
            disabled={!canRun || loadingQie}
            onClick={runQie}
            className="inline-flex items-center gap-2 rounded-full bg-sky-400 text-slate-950 px-4 py-1.5 text-[11px] font-semibold shadow-lg disabled:opacity-40"
          >
            <FlaskConical className="w-4 h-4" />
            {loadingQie ? "Running QIE…" : "Run QIE on my idea"}
          </button>
        </div>

        {qieVerdict && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-950/80 border border-sky-300/80 px-3 py-1 text-[10px] text-sky-100">
            <Rocket className="w-3 h-3 text-sky-200" />
            <span>{qieVerdict}</span>
          </div>
        )}

        <div className="mt-3 grid md:grid-cols-3 gap-3">
          <CardBlock title="QIE Summary" content={qieSummary} />
          <CardBlock title="Opportunity map" content={opportunityMap} />
          <CardBlock
            title="Star features & narrative"
            content={starFeatures || narrative}
          />
        </div>
      </section>

      {/* IDEA INTAKE + EXPLAIN */}
      <section
        ref={intakeRef}
        className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-[11px] text-slate-900 shadow-sm"
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-semibold">Idea intake capsule</span>
          </div>
          <span className="text-[10px] text-slate-500">
            Make this clear and everything else becomes 10x smarter.
          </span>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="flex flex-col gap-1 text-[10px]">
              <span className="text-slate-700">Describe your idea</span>
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                rows={4}
                placeholder="In one paragraph, explain what you’re trying to build and why."
                className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-[11px] text-slate-900 outline-none focus:border-sky-500"
              />
            </label>
            <label className="flex flex-col gap-1 text-[10px]">
              <span className="text-slate-700">Who is this for? (ICP)</span>
              <input
                value={icp}
                onChange={(e) => setIcp(e.target.value)}
                placeholder="e.g., solo SaaS founders, micro agencies, AI-native students."
                className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] outline-none focus:border-sky-500"
              />
            </label>
          </div>
          <div className="space-y-2">
            <label className="flex flex-col gap-1 text-[10px]">
              <span className="text-slate-700">
                What outcome should this create?
              </span>
              <input
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                placeholder="e.g., 'Launch a proof-backed MVP and first 10 users in 30 days.'"
                className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] outline-none focus:border-sky-500"
              />
            </label>
            <label className="flex flex-col gap-1 text-[10px]">
              <span className="text-slate-700">
                Absolute must-haves / constraints
              </span>
              <input
                value={mustHaves}
                onChange={(e) => setMustHaves(e.target.value)}
                placeholder="e.g., low infra costs, safe with client data, solo-friendly."
                className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] outline-none focus:border-sky-500"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px]"
              >
                <option>Practical</option>
                <option>Bold</option>
                <option>Conservative</option>
                <option>Experimental</option>
              </select>
              <select
                value={marketType}
                onChange={(e) => setMarketType(e.target.value)}
                className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px]"
              >
                <option>Consumer</option>
                <option>Prosumer</option>
                <option>SMB</option>
                <option>Enterprise</option>
              </select>
              <button
                type="button"
                disabled={!canRun || loadingExplain}
                onClick={runExplainIdea}
                className="inline-flex items-center gap-1 rounded-full border border-sky-400/70 bg-sky-500/10 px-3 py-1 text-[10px] text-sky-700 disabled:opacity-40"
              >
                <Sparkles className="w-3 h-3" />
                {loadingExplain ? "Explaining…" : "Explain my idea"}
              </button>
            </div>
          </div>
        </div>
        {ideaExplain && (
          <pre className="mt-2 whitespace-pre-wrap text-[10px] bg-slate-900/95 text-slate-50 border border-slate-800 rounded-xl px-3 py-2">
            {ideaExplain}
          </pre>
        )}
      </section>

      {/* EVIDENCE + BUILDABILITY */}
      <section
        ref={evidenceRef}
        className="rounded-2xl border border-slate-200 bg-slate-900/95 px-4 py-4 text-[11px] text-slate-100 shadow"
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-emerald-300" />
            <span className="font-semibold">Evidence & buildability</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!canRun || loadingEvidence}
              onClick={runEvidence}
              className="inline-flex items-center gap-1 rounded-full border border-emerald-300/80 bg-emerald-500/20 px-3 py-1 text-[10px] text-emerald-50 disabled:opacity-40"
            >
              {loadingEvidence ? "Scanning…" : "Generate evidence"}
            </button>
            <button
              type="button"
              disabled={!canRun || loadingFeasibility}
              onClick={runFeasibility}
              className="inline-flex items-center gap-1 rounded-full border border-sky-300/80 bg-sky-500/20 px-3 py-1 text-[10px] text-sky-50 disabled:opacity-40"
            >
              <Calculator className="w-3 h-3" />
              {loadingFeasibility ? "Scoring…" : "Feasibility + score"}
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <h3 className="text-[10px] font-semibold text-slate-100 mb-1">
              Evidence & market pulse
            </h3>
            {evidence ? (
              <pre className="whitespace-pre-wrap text-[10px] bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2">
                {evidence}
              </pre>
            ) : (
              <p className="text-[10px] text-slate-300">
                Run evidence to see mirror competitors, market pulse and early
                adopter profiles.
              </p>
            )}
          </div>
          <div>
            <h3 className="text-[10px] font-semibold text-slate-100 mb-1 flex items-center gap-1">
              <Brain className="w-3 h-3 text-sky-200" />
              Buildability score (10-point)
            </h3>
            <div className="rounded-xl bg-slate-950/80 border border-slate-800 px-3 py-2 space-y-2">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-200">Overall buildability</span>
                <span className="text-sky-300 font-semibold">
                  {buildabilityScore || 0}/100
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-400"
                  style={{ width: `${buildabilityScore || 0}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-1">
                {buildabilityBreakdown.map((item) => (
                  <div key={item.label} className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-slate-300">
                      {item.label}
                    </span>
                    <div className="h-1 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-sky-400"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[9px] text-slate-400">
                Use this score to decide how aggressively to build. Re-run after
                refining inputs and QIE.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* IMPROVEMENT ENGINE */}
      <section
        ref={improveRef}
        className="rounded-2xl border border-slate-200 bg-slate-950/95 px-4 py-4 text-[11px] text-slate-100 shadow"
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <Wand2 className="w-3.5 h-3.5 text-violet-300" />
            <span className="font-semibold">Improvement engine</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-3 text-[10px]">
          <ImproveTab
            label="Parity pass"
            active={activeImproveTab === "parity"}
            onClick={() => setActiveImproveTab("parity")}
          />
          <ImproveTab
            label="Differentiation pass"
            active={activeImproveTab === "diff"}
            onClick={() => setActiveImproveTab("diff")}
          />
          <ImproveTab
            label="Invention pass"
            active={activeImproveTab === "invent"}
            onClick={() => setActiveImproveTab("invent")}
          />
        </div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[10px] text-slate-300">
            Run passes sequentially: parity → diff → invention. Update idea as
            you learn.
          </span>
          <button
            type="button"
            disabled={!canRun || loadingImprove}
            onClick={() => runImprovementPass(activeImproveTab)}
            className="inline-flex items-center gap-1 rounded-full border border-violet-300/80 bg-violet-500/30 px-3 py-1 text-[10px] text-violet-50 disabled:opacity-40"
          >
            {loadingImprove ? "Improving…" : "Run this pass"}
          </button>
        </div>
        <div className="mt-1">
          {activeImproveTab === "parity" && (
            <pre className="whitespace-pre-wrap text-[10px] bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2">
              {parityPass ||
                "Parity pass: make sure your idea, UX and value match or beat the table stakes for your category."}
            </pre>
          )}
          {activeImproveTab === "diff" && (
            <pre className="whitespace-pre-wrap text-[10px] bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2">
              {diffPass ||
                "Differentiation pass: find the one thing you’ll be world-class at, not just 'also good'."}
            </pre>
          )}
          {activeImproveTab === "invent" && (
            <pre className="whitespace-pre-wrap text-[10px] bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2">
              {inventPass ||
                "Invention pass: propose brand-new star features and interactions that feel like a new category, not a copy."}
            </pre>
          )}
        </div>
      </section>

      {/* RISK ENGINE */}
      <section
        ref={riskRef}
        className="rounded-2xl border border-slate-200 bg-slate-950/95 px-4 py-4 text-[11px] text-slate-100 shadow"
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
            <span className="font-semibold">Risk engine</span>
          </div>
          <button
            type="button"
            disabled={!canRun || loadingRisk}
            onClick={runRisk}
            className="inline-flex items-center gap-1 rounded-full border border-amber-300/80 bg-amber-500/30 px-3 py-1 text-[10px] text-amber-50 disabled:opacity-40"
          >
            {loadingRisk ? "Scanning…" : "Generate risk map"}
          </button>
        </div>
        {riskSummary ? (
          <pre className="whitespace-pre-wrap text-[10px] bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2">
            {riskSummary}
          </pre>
        ) : (
          <p className="text-[10px] text-slate-300">
            See compliance, engineering, market and churn risks before you
            over-build.
          </p>
        )}
      </section>

      {/* BLUEPRINT BUILDER */}
      <section
        ref={blueprintRef}
        className="rounded-2xl border border-slate-200 bg-slate-950/95 px-4 py-4 text-[11px] text-slate-100 shadow"
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-sky-200" />
            <span className="font-semibold">Strategic blueprint v2.0</span>
          </div>
          <button
            type="button"
            disabled={!canRun || loadingBlueprint}
            onClick={runBlueprint}
            className="inline-flex items-center gap-1 rounded-full bg-sky-400 text-slate-950 px-3.5 py-1.5 text-[10px] font-semibold disabled:opacity-40"
          >
            {loadingBlueprint ? "Drafting…" : "Generate blueprint"}
          </button>
        </div>
        {blueprint ? (
          <pre className="whitespace-pre-wrap text-[10px] bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 mb-3">
            {blueprint}
          </pre>
        ) : (
          <p className="text-[10px] text-slate-300 mb-3">
            This turns your thesis into architecture, data model, non-goals and
            GTM seed plan.
          </p>
        )}
        <div className="flex flex-wrap gap-2 text-[10px]">
          <Link
            href="/builder/arena"
            className="inline-flex items-center gap-1 rounded-full border border-emerald-300/80 bg-emerald-500/20 px-3 py-1 text-emerald-50"
          >
            <Rocket className="w-3 h-3" />
            Send to Builder
          </Link>
          <Link
            href="/growth"
            className="inline-flex items-center gap-1 rounded-full border border-violet-300/80 bg-violet-500/25 px-3 py-1 text-violet-50"
          >
            <TrendingUp className="w-3 h-3" />
            Send to Growth OS
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1 rounded-full border border-slate-500/80 bg-slate-900/80 px-3 py-1 text-slate-100"
          >
            <ArrowRight className="w-3 h-3" />
            Save as project
          </Link>
        </div>
      </section>

      {/* SYNTHESIS ENGINE */}
      <section
        ref={synthRef}
        className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-rose-50 px-4 py-4 text-[11px] text-slate-900 shadow-sm"
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span className="font-semibold">Synthesis engine (optional)</span>
          </div>
          <span className="text-[10px] text-slate-600">
            Combine 2–3 ideas into one monster thesis.
          </span>
        </div>
        <div className="grid md:grid-cols-3 gap-3 mb-3">
          <div className="flex flex-col gap-1 text-[10px]">
            <span className="text-slate-600">Idea A (current)</span>
            <textarea
              value={idea}
              readOnly
              rows={3}
              className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-[10px] text-slate-700"
            />
          </div>
          <div className="flex flex-col gap-1 text-[10px]">
            <span className="text-slate-600">Idea B</span>
            <textarea
              value={synthInput2}
              onChange={(e) => setSynthInput2(e.target.value)}
              rows={3}
              placeholder="Another idea you’re considering."
              className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-[10px] text-slate-900 outline-none focus:border-rose-400"
            />
          </div>
          <div className="flex flex-col gap-1 text-[10px]">
            <span className="text-slate-600">Idea C (optional)</span>
            <textarea
              value={synthInput3}
              onChange={(e) => setSynthInput3(e.target.value)}
              rows={3}
              placeholder="Optional third idea."
              className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-[10px] text-slate-900 outline-none focus:border-rose-400"
            />
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[10px] text-slate-600">
            Use this when you’re torn between ideas. It nudges you into one
            sharp, compounding direction.
          </span>
          <button
            type="button"
            disabled={!idea.trim() || !synthInput2.trim() || loadingSynth}
            onClick={runSynthesis}
            className="inline-flex items-center gap-1 rounded-full border border-rose-400/80 bg-rose-500/20 px-3 py-1 text-[10px] text-rose-700 disabled:opacity-40"
          >
            {loadingSynth ? "Synthesizing…" : "Synthesize ideas"}
          </button>
        </div>
        {synthResult && (
          <pre className="whitespace-pre-wrap text-[10px] bg-slate-900/95 text-slate-50 border border-slate-800 rounded-xl px-3 py-2">
            {synthResult}
          </pre>
        )}
      </section>
    </div>
  );
}

/* ---------- Small UI helpers ---------- */

function StepChip({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-start gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1 hover:border-sky-400 text-left"
    >
      <span className="shrink-0 text-slate-700">{icon}</span>
      <span className="text-[10px] text-slate-800">{label}</span>
    </button>
  );
}

function ImproveTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center rounded-full px-3 py-0.5 ${
        active
          ? "bg-violet-400 text-slate-950 text-[10px] font-semibold"
          : "bg-slate-900 text-slate-200 text-[10px] border border-slate-700 hover:border-violet-400"
      }`}
    >
      {label}
    </button>
  );
}

function CardBlock({ title, content }: { title: string; content: string }) {
  return (
    <div className="rounded-xl bg-slate-950/70 border border-slate-800 px-3 py-2">
      <h3 className="text-[10px] font-semibold text-slate-100 mb-1">{title}</h3>
      {content ? (
        <pre className="whitespace-pre-wrap text-[10px] text-slate-100">
          {content}
        </pre>
      ) : (
        <p className="text-[10px] text-slate-300">
          Will populate after you run QIE with a clear idea.
        </p>
      )}
    </div>
  );
}

function blueprintHeadlineFromIdea(idea: string, outcome: string) {
  const base = idea.trim().slice(0, 60) || "Zero17 project";
  const clean = base.replace(/\s+/g, " ").trim();
  if (outcome.trim()) {
    return `${clean} — ${outcome.trim()}`;
  }
  return `${clean} — from idea to proof`;
}

function truncate(text: string, max: number) {
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + "…";
}

function clamp(n: number) {
  if (n < 0) return 0;
  if (n > 100) return 100;
  return Math.round(n);
}

function fakeDelay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

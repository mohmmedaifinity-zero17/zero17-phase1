// src/app/builder/page.tsx
"use client";

import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Hammer,
  Rocket,
  Beaker,
  Loader2,
  FileCode2,
  Cpu,
  BarChart3,
  Workflow,
  TerminalSquare,
  ShieldCheck,
  Upload,
  Boxes,
  UserCircle2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Image as ImageIcon,
  Palette,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Core types                                                                */
/* -------------------------------------------------------------------------- */

type BuildType = "app" | "agent" | "dashboard" | "workflow";

/* ---- Multi-lens spec ---- */

interface FounderLens {
  problem: string;
  desiredOutcome: string;
  coreUsers: string;
}

interface ProductLens {
  keyFeatures: string;
  nonGoals: string;
}

interface TechLens {
  stack: string;
  dataModel: string;
  constraints: string;
}

interface UxLens {
  primaryFlows: string;
  tone: string;
}

interface LaunchLens {
  pricing: string;
  successMetric: string;
}

interface MultiLensSpec {
  founder: FounderLens;
  product: ProductLens;
  tech: TechLens;
  ux: UxLens;
  launch: LaunchLens;
}

/* ---- Architecture + Agents ---- */

type ArchitectureEntityKind =
  | "data"
  | "service"
  | "external"
  | "workspace"
  | "artifact"
  | "queue"
  | "integration";

interface ArchitectureEntity {
  id: string;
  name: string;
  description: string;
  kind: ArchitectureEntityKind;
  notes?: string;
  tags?: string[];
}

interface AgentDefinition {
  id: string;
  name: string;
  mission: string;
  persona?: string;
  tools: string | string[];
  handoffs?: string;
  model?: string;
  temperature?: number;
  role?: string;
  inputs?: string[];
  outputs?: string[];
}

/* ---- Branding / logo ---- */

interface BrandingConfig {
  accentColor: string;
  tagline: string;
  logoDataUrl?: string;
  logoScale: number;
}

/* ---- Builder projects ---- */

export interface BuilderProject {
  id: string;
  title: string;
  description?: string;
  buildType: BuildType;
  createdAt: string;
  updatedAt: string;
  status?: "idle" | "built" | "tested" | "deploy_ready";
  lastBuildDir?: string;

  rawIdea?: string;
  spec?: MultiLensSpec;

  architecture?: ArchitectureEntity[];
  agents?: AgentDefinition[];

  branding?: BrandingConfig;
}

/* ---- Tests + Deploy ---- */

type TestCaseStatus = "pass" | "fail";

interface TestCase {
  id: string;
  title: string;
  status: TestCaseStatus;
  detail: string;
}

interface TestReport {
  total: number;
  passed: number;
  failed: number;
  cases: TestCase[];
}

interface DeployStep {
  id: string;
  label: string;
  detail: string;
}

interface DeployPlan {
  targetEnv: string;
  steps: DeployStep[];
  summary: string;
}

/* ---- Agent runtime (client-side + live) ---- */

interface AgentNodeConfig {
  id: string;
  name: string;
  mission: string;
  persona: string;
  tools: string;
  handoffs: string;
  model?: string;
  temperature?: number;
}

interface AgentEdgeConfig {
  fromId: string;
  toId: string;
  reason: string;
}

interface AgentRuntimeConfigClient {
  nodes: AgentNodeConfig[];
  edges: AgentEdgeConfig[];
}

interface AgentRunStep {
  id: string;
  agentId: string;
  agentName: string;
  input: string;
  output: string;
}

interface AgentRunTrace {
  input: string;
  steps: AgentRunStep[];
}

/* ---- Quality scan + docs ---- */

type QualityLevel = "ok" | "warning" | "risk";

interface QualityScanSection {
  id: string;
  title: string;
  level: QualityLevel;
  summary: string;
  recommendations: string[];
}

interface DocsBundle {
  readme: string;
  architecture: string;
  runbook: string;
}

interface QualityScanResult {
  sections: QualityScanSection[];
  docs: DocsBundle;
}

/* -------------------------------------------------------------------------- */
/*  Local storage helpers                                                     */
/* -------------------------------------------------------------------------- */

const STORAGE_KEY = "zero17_builder_projects_v1";

function loadProjects(): BuilderProject[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as BuilderProject[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveProjects(projects: BuilderProject[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch {
    // ignore
  }
}

/* -------------------------------------------------------------------------- */
/*  Defaults                                                                  */
/* -------------------------------------------------------------------------- */

function defaultSpecFromIdea(
  project: Pick<BuilderProject, "title" | "buildType">,
  rawIdea: string
): MultiLensSpec {
  const trimmed = rawIdea.trim();
  const short =
    trimmed.length > 220 ? trimmed.slice(0, 217).trimEnd() + "..." : trimmed;

  const userLabel =
    project.buildType === "agent"
      ? "operators and knowledge workers"
      : project.buildType === "dashboard"
        ? "founders and teams"
        : project.buildType === "workflow"
          ? "operators and automators"
          : "founders and makers";

  return {
    founder: {
      problem:
        short ||
        `Describe the core pain this ${project.buildType} solves for ${userLabel}.`,
      desiredOutcome: `A working ${project.buildType} that meaningfully reduces this pain for ${userLabel}.`,
      coreUsers: userLabel,
    },
    product: {
      keyFeatures:
        "List 3–7 features that truly move the needle. Ruthlessly cut nice-to-haves.",
      nonGoals:
        "Explicitly list what this v1 will NOT do. Protect scope, speed, and clarity.",
    },
    tech: {
      stack:
        "Likely: Next.js + TypeScript + Tailwind + Supabase (auth + DB) + vector store for agents, plus integrations.",
      dataModel:
        "Sketch 3–5 core entities and relationships (workspace, user, task, agent, run, event, etc.).",
      constraints:
        "Note infra constraints: budget, latency, compliance, existing systems that must be respected.",
    },
    ux: {
      primaryFlows:
        "Write 3 main flows end-to-end (e.g., capture → triage → act; draft → review → ship; ingest → analyze → alert).",
      tone: "How should this feel? Calm/tactical? Energetic? Analyst-like? Concierge? Define tone + voice here.",
    },
    launch: {
      pricing:
        "Draft the first pricing guess: free, one-time, subscription, seat-based, usage-based, or hybrid.",
      successMetric:
        "What is the single clearest success metric (e.g., time saved, revenue added, DAU, retention)?",
    },
  };
}

function defaultBranding(): BrandingConfig {
  return {
    accentColor: "#22c55e", // emerald-500
    tagline: "",
    logoDataUrl: undefined,
    logoScale: 1,
  };
}
/* -------------------------------------------------------------------------- */
/*  Minimal built-in blueprints (template library)                            */
/* -------------------------------------------------------------------------- */

interface BuilderBlueprintTemplate {
  id: string;
  label: string;
  description: string;
  project: {
    buildType: BuildType;
    description: string;
    rawIdea: string;
    spec: MultiLensSpec;
    branding: BrandingConfig;
    architecture: ArchitectureEntity[];
    agents: AgentDefinition[];
  };
}

const BUILDER_BLUEPRINT_TEMPLATES: BuilderBlueprintTemplate[] = [
  {
    id: "founder-os-saas",
    label: "Founder OS – early-stage SaaS",
    description:
      "Control room for a SaaS founder: metrics, fires, execution stack, calendar, and investor rhythm.",
    project: {
      buildType: "dashboard",
      description:
        "Daily operating system for a B2B SaaS founder (0–1M ARR): metrics, fires, meetings, inbox, and bets.",
      rawIdea:
        "I want a Founder OS that acts like a chief-of-staff for an early-stage SaaS founder: one cockpit for metrics, fires, meetings, inbox triage, and execution. It should feel like a calm tactical war-room, not a noisy dashboard.",
      spec: defaultSpecFromIdea(
        { title: "Founder OS – early-stage SaaS", buildType: "dashboard" },
        "Founder OS for early-stage SaaS: one cockpit where a founder starts the day, sees metrics and fires, reviews a ranked task stack, and lets agents defend the calendar and inbox."
      ),
      branding: {
        ...defaultBranding(),
        accentColor: "#22c55e",
        tagline: "A calm tactical war-room for SaaS founders.",
      },
      architecture: [
        {
          id: "founder-hq",
          kind: "workspace",
          name: "Founder HQ",
          description:
            "Single cockpit where the founder starts the day: metrics, fires, meetings, inbox triage, and focus blocks.",
          tags: ["founder", "hq", "dashboard"],
        },
        {
          id: "metrics-lake",
          kind: "artifact",
          name: "Metrics lake",
          description:
            "Daily metrics snapshot: MRR, churn, pipeline, active users, core feature usage.",
          tags: ["metrics", "kpis"],
        },
        {
          id: "fires-queue",
          kind: "queue",
          name: "Fires queue",
          description:
            "Structured queue of risks/issues from support, incidents, churn interviews, and product bugs.",
          tags: ["fires", "issues"],
        },
        {
          id: "calendar-stream",
          kind: "integration",
          name: "Calendar stream",
          description:
            "Events feed from Google Calendar / similar, tagged by type (internal, customer, investor, deep work).",
          tags: ["calendar", "events"],
        },
        {
          id: "inbox-stream",
          kind: "integration",
          name: "Inbox stream",
          description:
            "Important email / DM stream, filtered for customers, investors, and team leadership.",
          tags: ["inbox", "communication"],
        },
      ],
      agents: [
        {
          id: "chief-of-staff-agent",
          name: "Chief-of-Staff",
          mission:
            "Turn metrics, fires, and calendar into a ruthless but calm daily battle plan for the founder.",
          role: "Chief-of-Staff OS agent",
          model: "gpt-4.1-mini",
          temperature: 0.2,
          inputs: [
            "Metrics lake",
            "Fires queue",
            "Calendar stream",
            "Inbox stream",
          ],
          outputs: [
            "Daily brief",
            "Priority stack",
            "Reshuffled calendar suggestions",
          ],
          tools: ["calendar", "tasks"],
        },
        {
          id: "metrics-analyst-agent",
          name: "Metrics Analyst",
          mission:
            "Scan metrics to detect trends, anomalies, and leading indicators that matter for runway and growth.",
          role: "Analytics OS agent",
          model: "gpt-4.1-mini",
          temperature: 0.1,
          inputs: ["Metrics lake"],
          outputs: ["Metrics summary", "Alerts", "Opportunities"],
          tools: ["analytics"],
        },
        {
          id: "fires-triage-agent",
          name: "Fires Triage",
          mission:
            "Cluster and rank issues so the founder sees the 3–5 fires that truly matter today.",
          role: "Issue triage agent",
          model: "gpt-4.1-mini",
          temperature: 0.3,
          inputs: ["Fires queue"],
          outputs: ["Ranked fires list", "Suggested owners/actions"],
          tools: ["tasks"],
        },
        {
          id: "investor-brief-agent",
          name: "Investor Brief",
          mission:
            "Draft a tight weekly update for investors based on metrics and fires, with a clear narrative.",
          role: "Investor comms agent",
          model: "gpt-4.1-mini",
          temperature: 0.5,
          inputs: ["Metrics lake", "Fires queue"],
          outputs: ["Investor update draft"],
          tools: ["docs"],
        },
      ],
    },
  },
  {
    id: "creator-os",
    label: "Creator OS – content + offers",
    description:
      "Daily cockpit for a solo creator: ideas, hooks, scripts, slots, signals, and offers.",
    project: {
      buildType: "dashboard",
      description:
        "Creator OS that runs ideas → hooks → scripts → scheduled slots → signals, all tied to offers and funnels.",
      rawIdea:
        "I want a Creator OS that turns raw ideas and audience signals into a daily content machine: hooks, scripts, scheduled posts, and offers. It should help me grow audience and revenue without burning out.",
      spec: defaultSpecFromIdea(
        { title: "Creator OS – content + offers", buildType: "dashboard" },
        "Creator OS that manages content ideas, hooks, scripts, publishing slots, audience signals, and offers in one cockpit."
      ),
      branding: {
        ...defaultBranding(),
        accentColor: "#38bdf8",
        tagline: "Turn ideas and signals into a daily content machine.",
      },
      architecture: [
        {
          id: "ideas-inbox",
          kind: "workspace",
          name: "Ideas inbox",
          description:
            "Raw idea capture from notes, tweets, comments, and audience questions.",
          tags: ["ideas", "inbox"],
        },
        {
          id: "hooks-board",
          kind: "artifact",
          name: "Hooks board",
          description:
            "Refined hooks and angles mapped to platforms and audiences.",
          tags: ["hooks", "copy"],
        },
        {
          id: "scripts-library",
          kind: "artifact",
          name: "Scripts library",
          description:
            "Shorts / reels / threads / email scripts ready to record or publish.",
          tags: ["scripts", "content"],
        },
        {
          id: "slots-calendar",
          kind: "integration",
          name: "Publishing slots",
          description:
            "Weekly publishing slots across channels (X, IG, YT, newsletter).",
          tags: ["schedule"],
        },
        {
          id: "signals-stream",
          kind: "integration",
          name: "Signals stream",
          description:
            "Engagement, replies, saves, clicks, and DMs feeding back into what works.",
          tags: ["signals", "feedback"],
        },
        {
          id: "offers-stack",
          kind: "artifact",
          name: "Offers stack",
          description:
            "Courses, consulting, products, and funnels mapped to content themes.",
          tags: ["offers", "funnel"],
        },
      ],
      agents: [
        {
          id: "ideas-curator-agent",
          name: "Ideas Curator",
          mission:
            "Turn raw brain-dump + audience noise into a clean list of sharp content ideas.",
          role: "Idea refinement agent",
          model: "gpt-4.1-mini",
          temperature: 0.4,
          inputs: ["Ideas inbox", "Signals stream"],
          outputs: ["Refined idea list"],
          tools: ["docs"],
        },
        {
          id: "hooks-smith-agent",
          name: "Hooks Smith",
          mission:
            "Forge scroll-stopping hooks mapped to channels and audiences.",
          role: "Hooks generation agent",
          model: "gpt-4.1-mini",
          temperature: 0.7,
          inputs: ["Refined idea list"],
          outputs: ["Hooks board"],
          tools: ["copywriting"],
        },
        {
          id: "scripts-writer-agent",
          name: "Scripts Writer",
          mission:
            "Turn hooks into ready-to-record scripts for short-form, long-form, and email.",
          role: "Scriptwriting agent",
          model: "gpt-4.1-mini",
          temperature: 0.65,
          inputs: ["Hooks board", "Offers stack"],
          outputs: ["Scripts library"],
          tools: ["docs"],
        },
        {
          id: "slots-planner-agent",
          name: "Slots Planner",
          mission:
            "Fill the weekly publishing slots with a balanced mix of content that ladders into offers.",
          role: "Scheduling agent",
          model: "gpt-4.1-mini",
          temperature: 0.35,
          inputs: ["Scripts library", "Slots calendar"],
          outputs: ["Publishing queue"],
          tools: ["calendar"],
        },
      ],
    },
  },
];

/* -------------------------------------------------------------------------- */
/*  Main page                                                                 */
/* -------------------------------------------------------------------------- */

export default function BuilderPage() {
  const [projects, setProjects] = useState<BuilderProject[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [buildType, setBuildType] = useState<BuildType>("app");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const existing = loadProjects();
    setProjects(existing);
    if (existing.length > 0) {
      setActiveId(existing[0].id);
    }
  }, []);

  function updateProjectMeta(id: string, patch: Partial<BuilderProject>) {
    setProjects((prev) => {
      const next = prev.map((p) =>
        p.id === id
          ? {
              ...p,
              ...patch,
              updatedAt: new Date().toISOString(),
            }
          : p
      );
      saveProjects(next);
      return next;
    });
  }

  function handleCreateProject(e: FormEvent) {
    e.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Give this build a title so you recognize it later.");
      return;
    }

    setError(null);
    setCreating(true);

    try {
      const now = new Date().toISOString();
      const newProject: BuilderProject = {
        id: `builder_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        title: trimmedTitle,
        description: description.trim() || undefined,
        buildType,
        createdAt: now,
        updatedAt: now,
        status: "idle",
        rawIdea: "",
        architecture: [],
        agents: [],
        branding: defaultBranding(),
      };

      const next = [newProject, ...projects];
      setProjects(next);
      saveProjects(next);
      setActiveId(newProject.id);

      setTitle("");
      setDescription("");
      setBuildType("app");
    } finally {
      setCreating(false);
    }
  }

  function cloneProject(sourceId: string) {
    const src = projects.find((p) => p.id === sourceId);
    if (!src) return;

    const now = new Date().toISOString();
    const clonedId = `builder_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    const cloned: BuilderProject = {
      ...src,
      id: clonedId,
      title: src.title + " (clone)",
      createdAt: now,
      updatedAt: now,
      status: "idle",
      lastBuildDir: undefined,
    };

    const next = [cloned, ...projects];
    setProjects(next);
    saveProjects(next);
    setActiveId(clonedId);
  }

  const activeProject = projects.find((p) => p.id === activeId) ?? null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-100 via-rose-50 to-slate-100 text-slate-900">
      {/* Outer Shell - Builder Lab capsule */}
      <div className="mt-4 rounded-3xl border border-slate-200 bg-white/80 px-4 py-4 md:px-6 md:py-6 shadow-xl backdrop-blur">
        {/* Header */}
        <header className="relative border-b border-slate-200 bg-white/90 px-6 py-4 flex items-center justify-between">
          <div className="pointer-events-none absolute -top-8 -right-10 w-32 h-32 rounded-full bg-sky-200/60 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-4 w-36 h-36 rounded-full bg-amber-200/70 blur-3xl" />
          <div className="flex items-center gap-3">
            <div className="relative rounded-3xl border border-slate-200 bg-white/90 shadow-sm px-4 py-4 md:px-6 md:py-6">
              <Hammer className="w-4 h-4 text-sky-600" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-sky-600 font-semibold">
                Zero17 • Builder Lab
              </div>
              <div className="text-sm font-semibold text-slate-900">
                Intent → Branding → Spec → Architecture → Agents → Code → Tests
                → Deploy → Run → Scan & Docs → OS cockpit → Blueprint →
                Diagnostics
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <Link
              href="/research"
              className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-sky-600 hover:bg-sky-100"
            >
              <Beaker className="w-3.5 h-3.5" />
              Back to Research Lab
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-amber-600 hover:bg-amber-100"
            >
              <Rocket className="w-3.5 h-3.5" />
              All Projects
            </Link>
          </div>
        </header>

        {/* Body */}
        <div className="flex">
          {/* Left rail */}
          <aside className="w-80 rounded-2xl border border-slate-200 bg-slate-50/90 px-3 py-3 shadow-sm flex flex-col gap-4">
            {/* New Build */}
            <section className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm px-3.5 py-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-sky-600" />
                  <span className="text-[11px] font-semibold text-slate-900">
                    New build
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">
                  Arch + agents
                </span>
              </div>

              <form className="space-y-2.5" onSubmit={handleCreateProject}>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500">
                    Title <span className="text-sky-600">*</span>
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Founder OS dashboard v1"
                    className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[11px] text-slate-900 outline-none focus:border-sky-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500">
                    Short description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    placeholder="What are you trying to ship in this run?"
                    className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[11px] text-slate-900 outline-none focus:border-sky-400 resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500">
                    Build type
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                    <BuildTypeChip
                      label="App / MVP"
                      icon={FileCode2}
                      value="app"
                      current={buildType}
                      onSelect={setBuildType}
                    />
                    <BuildTypeChip
                      label="Agent"
                      icon={Cpu}
                      value="agent"
                      current={buildType}
                      onSelect={setBuildType}
                    />
                    <BuildTypeChip
                      label="Dashboard"
                      icon={BarChart3}
                      value="dashboard"
                      current={buildType}
                      onSelect={setBuildType}
                    />
                    <BuildTypeChip
                      label="Workflow"
                      icon={Workflow}
                      value="workflow"
                      current={buildType}
                      onSelect={setBuildType}
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-[10px] text-amber-300 bg-amber-950/40 border border-amber-500/50 rounded-md px-2 py-1">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={creating || !title.trim()}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-sky-600 text-white px-3 py-1.5 text-[11px] font-semibold hover:bg-sky-500 disabled:opacity-60 disabled:hover:bg-sky-600"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating…</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create Builder Project</span>
                    </>
                  )}
                </button>
              </form>
            </section>

            {/* Existing projects */}
            <section className="space-y-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold text-slate-900">
                  Your builder projects
                </span>
                <span className="text-[10px] text-slate-500">
                  {projects.length} total
                </span>
              </div>

              {projects.length === 0 ? (
                <p className="text-[10px] text-slate-500">
                  No projects yet. Create your first build on the left — it will
                  appear here.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {projects.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setActiveId(p.id)}
                      className={`w-full text-left rounded-xl border px-2.5 py-2 text-[10px] ${
                        p.id === activeId
                          ? "border-emerald-400 bg-emerald-500/10"
                          : "border-slate-200 bg-white/90 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="font-semibold text-slate-900 truncate">
                          {p.title}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[9px] text-slate-600">
                          {iconForBuildType(p.buildType)}
                          <span className="capitalize">{p.buildType}</span>
                        </span>
                      </div>
                      {p.description && (
                        <p className="text-[9px] text-slate-600 line-clamp-2">
                          {p.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-[8px] text-slate-500">
                          Created {new Date(p.createdAt).toLocaleString()}
                        </p>
                        {p.status && (
                          <span className="text-[8px] rounded-full border border-slate-300 px-1.5 py-0.5 text-slate-600">
                            {p.status}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </aside>

          {/* Center rail */}
          <section className="flex-1 bg-white/90 px-6 py-4">
            {!activeProject ? (
              <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center space-y-2">
                  <p className="text-[11px] text-slate-600">
                    Create a Builder project on the left to start the Build
                    Rail.
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Each project owns: branding, intent, spec, architecture,
                    agent employees, codegen, tests, deploy blueprint, agent
                    runs, quality scan + docs, cockpit, blueprint, and
                    diagnostics.
                  </p>
                </div>
              </div>
            ) : (
              <BuildRail
                project={activeProject}
                onProjectMetaUpdate={updateProjectMeta}
                onCloneProject={cloneProject}
              />
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*  Helper components                                                         */
/* -------------------------------------------------------------------------- */

interface BuildTypeChipProps {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  value: BuildType;
  current: BuildType;
  onSelect: (v: BuildType) => void;
}

function BuildTypeChip({
  label,
  icon: Icon,
  value,
  current,
  onSelect,
}: BuildTypeChipProps) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 ${
        active
          ? "border-emerald-400 bg-emerald-500/15 text-emerald-100"
          : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
      } text-[10px]`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </button>
  );
}

function iconForBuildType(type: BuildType) {
  if (type === "app") return <FileCode2 className="w-3 h-3" />;
  if (type === "agent") return <Cpu className="w-3 h-3" />;
  if (type === "dashboard") return <BarChart3 className="w-3 h-3" />;
  return <Workflow className="w-3 h-3" />;
}

/* -------------------------------------------------------------------------- */
/*  Build Rail                                                                */
/* -------------------------------------------------------------------------- */

function BuildRail({
  project,
  onProjectMetaUpdate,
  onCloneProject,
}: {
  project: BuilderProject;
  onProjectMetaUpdate: (id: string, patch: Partial<BuilderProject>) => void;
  onCloneProject: (id: string) => void;
}): JSX.Element {
  /* ---- Intent + spec state ---- */

  const [rawIdea, setRawIdea] = useState(project.rawIdea ?? "");
  const [spec, setSpec] = useState<MultiLensSpec | null>(project.spec ?? null);
  const [specError, setSpecError] = useState<string | null>(null);

  /* ---- Architecture + agents ---- */

  const [entities, setEntities] = useState<ArchitectureEntity[]>(
    project.architecture ?? []
  );
  const [agents, setAgents] = useState<AgentDefinition[]>(
    (project.agents ?? []).map((a) => ({
      model: "gpt-4.1-mini",
      temperature: 0.2,
      ...a,
    }))
  );

  /* ---- Branding ---- */

  const [branding, setBranding] = useState<BrandingConfig>(
    project.branding ?? defaultBranding()
  );

  /* ---- Build / tests / deploy ---- */

  const [buildLoading, setBuildLoading] = useState(false);
  const [buildDir, setBuildDir] = useState<string | null>(
    project.lastBuildDir ?? null
  );
  const [buildFiles, setBuildFiles] = useState<string[]>([]);

  const [testsLoading, setTestsLoading] = useState(false);
  const [testReport, setTestReport] = useState<TestReport | null>(null);

  const [deployLoading, setDeployLoading] = useState(false);
  const [deployPlan, setDeployPlan] = useState<DeployPlan | null>(null);

  /* ---- Agent runtime ---- */

  const [runMode, setRunMode] = useState<"sim" | "live">("sim");
  const [runInput, setRunInput] = useState("");
  const [runStartingAgentId, setRunStartingAgentId] = useState<string>("auto");
  const [runLoading, setRunLoading] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [runTrace, setRunTrace] = useState<AgentRunTrace | null>(null);

  /* ---- Quality scan & docs ---- */

  const [qualityLoading, setQualityLoading] = useState(false);
  const [qualityError, setQualityError] = useState<string | null>(null);
  const [qualityResult, setQualityResult] = useState<QualityScanResult | null>(
    null
  );
  const [qualityMode, setQualityMode] = useState<"offline" | "online" | null>(
    null
  );
  const [exportingDocs, setExportingDocs] = useState(false);

  /* ---- Blueprint export ---- */

  const [blueprintJson, setBlueprintJson] = useState<string>("");
  const [blueprintImportText, setBlueprintImportText] = useState<string>("");

  /* ---- Reset when project changes ---- */

  useEffect(() => {
    setRawIdea(project.rawIdea ?? "");
    setSpec(project.spec ?? null);
    setSpecError(null);

    setEntities(project.architecture ?? []);
    setAgents(
      (project.agents ?? []).map((a) => ({
        model: "gpt-4.1-mini",
        temperature: 0.2,
        ...a,
      }))
    );

    setBranding(project.branding ?? defaultBranding());

    setBuildDir(project.lastBuildDir ?? null);
    setBuildFiles([]);
    setTestReport(null);
    setDeployPlan(null);

    setRunMode("sim");
    setRunInput("");
    setRunStartingAgentId("auto");
    setRunLoading(false);
    setRunError(null);
    setRunTrace(null);

    setQualityLoading(false);
    setQualityError(null);
    setQualityResult(null);
    setQualityMode(null);
    setExportingDocs(false);

    setBlueprintJson("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id]);

  /* ---- Spec handling ---- */

  function handleGenerateSpec() {
    const trimmed = rawIdea.trim();
    if (!trimmed) {
      setSpecError(
        "Describe the build first — what are you really trying to ship?"
      );
      return;
    }
    setSpecError(null);
    const generated = defaultSpecFromIdea(
      { title: project.title, buildType: project.buildType },
      trimmed
    );
    setSpec(generated);
    onProjectMetaUpdate(project.id, { rawIdea: trimmed, spec: generated });
  }

  function handleSpecFieldChange<K extends keyof MultiLensSpec>(
    lens: K,
    patch: Partial<MultiLensSpec[K]>
  ) {
    setSpec((prev) => {
      if (!prev) return prev;
      const next: MultiLensSpec = {
        ...prev,
        [lens]: {
          ...(prev[lens] as any),
          ...patch,
        },
      };
      onProjectMetaUpdate(project.id, { spec: next, rawIdea });
      return next;
    });
  }

  /* ---- Branding handlers ---- */

  function updateBranding(patch: Partial<BrandingConfig>) {
    setBranding((prev) => {
      const next = { ...prev, ...patch };
      onProjectMetaUpdate(project.id, { branding: next });
      return next;
    });
  }

  function handleLogoFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      updateBranding({ logoDataUrl: dataUrl });
    };
    reader.readAsDataURL(file);
  }

  /* ---- Architecture helpers ---- */

  function addEntity() {
    const newEntity: ArchitectureEntity = {
      id: `ent_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: "",
      description: "",
      kind: "data",
      notes: "",
    };
    setEntities((prev) => {
      const next = [...prev, newEntity];
      onProjectMetaUpdate(project.id, { architecture: next });
      return next;
    });
  }

  function updateEntityField(
    id: string,
    key: keyof ArchitectureEntity,
    value: string
  ) {
    setEntities((prev) => {
      const next = prev.map((e) =>
        e.id === id
          ? {
              ...e,
              [key]: key === "kind" ? (value as ArchitectureEntityKind) : value,
            }
          : e
      );
      onProjectMetaUpdate(project.id, { architecture: next });
      return next;
    });
  }

  /* ---- Agent helpers ---- */

  function addAgent() {
    const newAgent: AgentDefinition = {
      id: `agent_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: "",
      mission: "",
      persona: "",
      tools: "",
      handoffs: "",
      model: "gpt-4.1-mini",
      temperature: 0.2,
    };
    setAgents((prev) => {
      const next = [...prev, newAgent];
      onProjectMetaUpdate(project.id, { agents: next });
      return next;
    });
  }

  function updateAgentField(
    id: string,
    key: keyof AgentDefinition,
    value: string | number
  ) {
    setAgents((prev) => {
      const next = prev.map((a) =>
        a.id === id
          ? {
              ...a,
              [key]:
                key === "temperature"
                  ? typeof value === "number"
                    ? value
                    : parseFloat(value as string)
                  : value,
            }
          : a
      );
      onProjectMetaUpdate(project.id, { agents: next });
      return next;
    });
  }

  /* ---- Daily OS templates ---- */

  function loadFounderDailyOsTemplate() {
    const baseEntities: ArchitectureEntity[] = [
      {
        id: "tpl_founder_workspace",
        name: "Founder workspace",
        description:
          "Top-level container for a founder's company, products, and operating system.",
        kind: "data",
        notes:
          "Holds references to products, boards, dashboards, and default agent settings.",
      },
      {
        id: "tpl_founder_task",
        name: "Execution task",
        description:
          "Atomic unit of work across product, growth, ops, and capital.",
        kind: "data",
        notes: "Supports tags like 'needle-mover', 'admin', 'fire', and 'bet'.",
      },
      {
        id: "tpl_founder_inbox_event",
        name: "Inbox event",
        description:
          "Normalized stream of emails, DMs, calendar invites, docs, and alerts.",
        kind: "data",
        notes:
          "Used by triage agents to decide: ignore, archive, reply, escalate, or schedule.",
      },
      {
        id: "tpl_founder_meeting",
        name: "Meeting snapshot",
        description:
          "Structured record of a meeting: participants, decisions, follow-ups, sentiment.",
        kind: "data",
        notes: "Feeds briefing and recap agents; syncs with calendar.",
      },
      {
        id: "tpl_founder_metric",
        name: "Metric snapshot",
        description:
          "Time-series of core metrics: revenue, activation, retention, cash, burn.",
        kind: "data",
        notes:
          "Feeds daily briefings and alerts when metrics cross thresholds.",
      },
      {
        id: "tpl_founder_focus_block",
        name: "Focus block",
        description:
          "Protected, AI-defended time windows for deep work on top priorities.",
        kind: "data",
        notes:
          "Used by calendar + inbox agents to shield time and auto-reschedule collisions.",
      },
      {
        id: "tpl_founder_integrations",
        name: "Integration connection",
        description:
          "Connection details to tools like Gmail, Slack, Notion, HubSpot, Stripe.",
        kind: "external",
        notes: "Tokens, scopes, and per-workspace integration settings.",
      },
      {
        id: "tpl_founder_brain",
        name: "Strategic context service",
        description:
          "Central narrative: company thesis, bet stack, red lines, and non-negotiables.",
        kind: "service",
        notes:
          "Read-only for most agents. Updated explicitly by the founder or research lab.",
      },
    ];

    const baseAgents: AgentDefinition[] = [
      {
        id: "tpl_agent_founder_brief",
        name: "Daily Briefing Chief of Staff",
        mission:
          "Every morning, deliver a concise, prioritized briefing of what truly matters today: metrics, fires, leverage, and bets.",
        persona:
          "Calm, ruthless about signal vs noise, never sensational. Speaks in bullets and trade-offs.",
        tools:
          "Metric snapshot store, inbox events, meeting snapshots, integrations to product analytics and finance.",
        handoffs:
          "Hands off concrete follow-up tasks to Execution Ranger; escalates strategic conflicts to the founder with 2–3 options.",
        model: "gpt-4.1",
        temperature: 0.2,
      },
      {
        id: "tpl_agent_founder_ranger",
        name: "Execution Ranger",
        mission:
          "Turn briefings and decisions into a clean, ranked task stack across product, growth, hiring, and capital.",
        persona:
          "Obsessed with focus and sequencing. Kills vanity tasks, chunks big rocks, groups related work.",
        tools:
          "Execution task store, focus blocks, calendar API for scheduling, task sync integrations.",
        handoffs:
          "Feeds the Calendar Guardian to schedule focus blocks; returns status and blockers back to the Briefing Chief.",
        model: "gpt-4.1-mini",
        temperature: 0.35,
      },
      {
        id: "tpl_agent_founder_calendar",
        name: "Calendar Guardian",
        mission:
          "Defend the founder’s calendar from chaos while aligning time with the real priorities.",
        persona:
          "Polite but firm gatekeeper. Prefers consolidation, batching, and defaults to 'no' unless strong reason.",
        tools:
          "Calendar API, focus blocks, inbox events (invites), meeting snapshot generator.",
        handoffs:
          "Hands off meeting notes to Meeting Scribe; escalates unclear invites to the founder with a recommendation.",
        model: "gpt-4.1-mini",
        temperature: 0.25,
      },
      {
        id: "tpl_agent_founder_scribe",
        name: "Meeting Scribe",
        mission:
          "Convert messy meetings into crisp decisions, owners, and next actions—no fluff.",
        persona:
          "Brutally clear, low-drama, cares about commitments and timelines, not small talk.",
        tools:
          "Meeting snapshots, transcription provider, execution task store, metric snapshot store.",
        handoffs:
          "Sends tasks to Execution Ranger; surfaces strategic changes to Strategic Context service.",
        model: "gpt-4.1-mini",
        temperature: 0.3,
      },
      {
        id: "tpl_agent_founder_inbox",
        name: "Inbound Intel Triage",
        mission:
          "Turn inbound noise (emails/DMs) into categorized intel: fires, leverage, admin, or ignore.",
        persona:
          "Pattern-matcher, risk-aware, protective of attention. Tags and routes instead of replying blindly.",
        tools:
          "Inbox events, integration connections, founder preferences from Strategic Context.",
        handoffs:
          "Sends fires to Briefing Chief; low-level admin to Execution Ranger; low-signal to archive with a polite auto-reply.",
        model: "gpt-4.1-mini",
        temperature: 0.25,
      },
    ];

    setEntities(baseEntities);
    setAgents(baseAgents);
    onProjectMetaUpdate(project.id, {
      architecture: baseEntities,
      agents: baseAgents,
    });
  }

  function loadCreatorDailyOsTemplate() {
    const baseEntities: ArchitectureEntity[] = [
      {
        id: "tpl_creator_workspace",
        name: "Creator workspace",
        description:
          "Container for a creator’s brands, platforms, offers, and content systems.",
        kind: "data",
        notes:
          "Multi-brand support; connects to YouTube, Instagram, X, podcasts, newsletters.",
      },
      {
        id: "tpl_creator_idea",
        name: "Content idea",
        description:
          "Raw and semi-structured ideas tagged by topic, format, and potential impact.",
        kind: "data",
        notes:
          "Tracks origin (audience question, trend, personal story) and maps to offers or funnels.",
      },
      {
        id: "tpl_creator_draft",
        name: "Content draft",
        description:
          "Draft units for threads, scripts, carousels, shorts, and long-form posts.",
        kind: "data",
        notes:
          "Supports status (idea → outline → draft → polished → scheduled → posted).",
      },
      {
        id: "tpl_creator_slot",
        name: "Content slot",
        description:
          "Scheduled publishing slots on each platform, linked to drafts and campaigns.",
        kind: "data",
        notes:
          "Drives cadence and ensures mix of value, narrative, and offers.",
      },
      {
        id: "tpl_creator_channel",
        name: "Distribution channel",
        description:
          "Representation of each platform account (YouTube channel, IG page, X profile, newsletter list).",
        kind: "external",
        notes:
          "Stores handles, API tokens, and posting rules for each platform.",
      },
      {
        id: "tpl_creator_signal",
        name: "Audience signal",
        description:
          "Analytics events: watch time, saves, shares, replies, click-throughs, purchases.",
        kind: "data",
        notes: "Feeds back into new ideas, hooks, and offer tuning for the OS.",
      },
      {
        id: "tpl_creator_offer",
        name: "Offer / product",
        description:
          "Courses, cohorts, retainers, or products mapped to content that sells them.",
        kind: "data",
        notes:
          "Connects content ideas and slots to revenue-generating offers and funnels.",
      },
    ];

    const baseAgents: AgentDefinition[] = [
      {
        id: "tpl_agent_creator_hook",
        name: "Hook Architect",
        mission:
          "Turn raw ideas into platform-native hooks that stop scrolling and earn attention without cheap clickbait.",
        persona:
          "Creative but disciplined. Respects the creator’s voice and long-term brand more than short-term vanity metrics.",
        tools:
          "Content ideas, audience signals, distribution channels, examples of top-performing posts.",
        handoffs:
          "Hands off best hooks to Script Crafter or Carousel Architect; archives weaker variants but keeps them searchable.",
        model: "gpt-4.1-mini",
        temperature: 0.6,
      },
      {
        id: "tpl_agent_creator_script",
        name: "Script Crafter",
        mission:
          "Convert hooks into concise scripts, outlines, and talking points for video, threads, or deep dives.",
        persona:
          "Story-driven, pacing-aware, avoids jargon. Balances teaching, story, and subtle pitching.",
        tools:
          "Hooks from Hook Architect, drafts, offer library, audience signal history.",
        handoffs:
          "Sends final drafts to Slot Pilot for scheduling; sends long-form pieces to Repurpose Engine.",
        model: "gpt-4.1-mini",
        temperature: 0.5,
      },
      {
        id: "tpl_agent_creator_slot",
        name: "Slot Pilot",
        mission:
          "Keep the content calendar full and balanced across platforms, without burning out the creator.",
        persona:
          "Systems thinker, respects off-days and energy levels. Very aware of time zones and platform rhythms.",
        tools:
          "Content slots, distribution channels, drafts, creator constraints (days off, themes).",
        handoffs:
          "Confirms schedule with the creator when risk is high; fires final posts to platform APIs or a scheduler.",
        model: "gpt-4.1-mini",
        temperature: 0.35,
      },
      {
        id: "tpl_agent_creator_signal",
        name: "Signal Analyst",
        mission:
          "Continuously learn from what the audience actually does, not what the creator guesses.",
        persona:
          "Brutally honest analyst. Celebrates winners, dissects losers, surfaces new patterns every week.",
        tools:
          "Audience signals, offers, content slots, drafts, platform analytics APIs.",
        handoffs:
          "Feeds insights back to Hook Architect and Script Crafter; suggests experiments to Slot Pilot.",
        model: "gpt-4.1-mini",
        temperature: 0.3,
      },
      {
        id: "tpl_agent_creator_inbox",
        name: "Community Concierge",
        mission:
          "Turn comments and DMs into relationships, insights, and qualified leads—without sounding like a bot.",
        persona:
          "Warm, human, respects boundaries. Mirrors the creator’s tone and knows when to escalate.",
        tools:
          "Inbox events for social DMs/comments, audience signal store, offers, FAQ knowledge base.",
        handoffs:
          "Hands off warm leads to the creator or sales calendar; sends repeated questions back into the idea backlog.",
        model: "gpt-4.1-mini",
        temperature: 0.4,
      },
    ];

    setEntities(baseEntities);
    setAgents(baseAgents);
    onProjectMetaUpdate(project.id, {
      architecture: baseEntities,
      agents: baseAgents,
    });
  }

  /* ---- Codegen / tests / deploy ---- */

  async function handleRunCodegen() {
    setBuildLoading(true);
    try {
      const res = await fetch("/api/local-builder/codegen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: {
            id: project.id,
            title: project.title,
            description: project.description,
            buildType: project.buildType,
            architecture: entities,
            agents,
            branding,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Codegen failed");
      }

      const data = (await res.json()) as {
        ok: boolean;
        rootDir: string;
        files: string[];
      };

      setBuildDir(data.rootDir);
      setBuildFiles(data.files);
      onProjectMetaUpdate(project.id, {
        status: "built",
        lastBuildDir: data.rootDir,
      });
    } catch (err: any) {
      console.error("[BuildRail] codegen error:", err);
      alert(err.message || "Codegen failed");
    } finally {
      setBuildLoading(false);
    }
  }

  async function handleRunTests() {
    setTestsLoading(true);
    try {
      const res = await fetch("/api/local-builder/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          title: project.title,
          buildType: project.buildType,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Test run failed");
      }

      const data = (await res.json()) as {
        ok: boolean;
        report: TestReport;
      };

      setTestReport(data.report);
      onProjectMetaUpdate(project.id, {
        status: data.report.failed === 0 ? "tested" : project.status,
      });
    } catch (err: any) {
      console.error("[BuildRail] test error:", err);
      alert(err.message || "Test run failed");
    } finally {
      setTestsLoading(false);
    }
  }

  async function handleDeployPlan() {
    setDeployLoading(true);
    try {
      const res = await fetch("/api/local-builder/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          title: project.title,
          buildType: project.buildType,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Deploy plan failed");
      }

      const data = (await res.json()) as {
        ok: boolean;
        plan: DeployPlan;
      };

      setDeployPlan(data.plan);
      onProjectMetaUpdate(project.id, {
        status: "deploy_ready",
      });
    } catch (err: any) {
      console.error("[BuildRail] deploy error:", err);
      alert(err.message || "Deploy plan failed");
    } finally {
      setDeployLoading(false);
    }
  }

  /* ---- Agent runtime helpers ---- */

  function buildRuntimeConfigClient(): AgentRuntimeConfigClient {
    const nodes: AgentNodeConfig[] = agents.map((a) => ({
      id: a.id,
      name: a.name || "Unnamed agent",
      mission: a.mission || "",
      persona: a.persona || "",
      tools: Array.isArray(a.tools) ? a.tools.join(", ") : a.tools || "",
      handoffs: a.handoffs || "",
      model: a.model || "gpt-4.1-mini",
      temperature: a.temperature ?? 0.2,
    }));

    const edges: AgentEdgeConfig[] = [];
    return { nodes, edges };
  }

  function summarizeAgentStepText(
    node: AgentNodeConfig,
    previousOutput: string,
    userInput: string,
    stepIndex: number
  ): string {
    const inputSnippet =
      stepIndex === 0 ? userInput : previousOutput || userInput;

    const trimmed =
      inputSnippet.length > 200
        ? inputSnippet.slice(0, 197).trimEnd() + "..."
        : inputSnippet;

    return [
      `Agent "${node.name}" steps in.`,
      node.mission ? `Mission: ${node.mission}` : "",
      node.tools ? `Likely tools: ${node.tools}` : "",
      node.handoffs ? `Planned handoff: ${node.handoffs}` : "",
      trimmed
        ? `Given the current situation: ${trimmed}`
        : "Clarifies the situation before acting.",
    ]
      .filter(Boolean)
      .join(" ");
  }

  async function handleRunAgentsSimulation() {
    const trimmedInput = runInput.trim();
    if (!trimmedInput) {
      setRunError("Describe a concrete situation or prompt to start the OS.");
      setRunTrace(null);
      return;
    }

    const runtime = buildRuntimeConfigClient();
    if (!runtime.nodes.length) {
      setRunError(
        "No agents defined yet. Add some agent employees or load a Daily OS template."
      );
      setRunTrace(null);
      return;
    }

    setRunError(null);
    setRunLoading(true);
    try {
      const nodes = runtime.nodes;
      let startIndex = 0;

      if (runStartingAgentId !== "auto") {
        const idx = nodes.findIndex(
          (n) => n.id === runStartingAgentId || n.name === runStartingAgentId
        );
        if (idx >= 0) startIndex = idx;
      }

      const steps: AgentRunStep[] = [];
      const maxSteps = Math.min(4, nodes.length || 1);

      for (let i = 0; i < maxSteps; i++) {
        const node = nodes[(startIndex + i) % nodes.length];
        const output = summarizeAgentStepText(
          node,
          steps[i - 1]?.output ?? "",
          trimmedInput,
          i
        );

        steps.push({
          id: `step_${i}`,
          agentId: node.id,
          agentName: node.name,
          input: i === 0 ? trimmedInput : steps[i - 1].output,
          output,
        });
      }

      const trace: AgentRunTrace = {
        input: trimmedInput,
        steps,
      };
      setRunTrace(trace);
    } finally {
      setRunLoading(false);
    }
  }

  async function handleRunAgentsLive() {
    const trimmedInput = runInput.trim();
    if (!trimmedInput) {
      setRunError("Describe a concrete situation or prompt to start the OS.");
      setRunTrace(null);
      return;
    }

    const runtime = buildRuntimeConfigClient();
    if (!runtime.nodes.length) {
      setRunError(
        "No agents defined yet. Add some agent employees or load a Daily OS template."
      );
      setRunTrace(null);
      return;
    }

    setRunError(null);
    setRunLoading(true);
    try {
      const maxSteps = Math.min(4, runtime.nodes.length || 1);

      const res = await fetch("/api/agents/run-live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: runtime,
          input: trimmedInput,
          startAgentId:
            runStartingAgentId === "auto" ? null : runStartingAgentId,
          maxSteps,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg =
          data?.error ||
          "Live agent run failed. Check server logs or OPENAI_API_KEY.";
        setRunError(msg);
        setRunTrace(null);
        return;
      }

      const data = (await res.json()) as {
        ok: boolean;
        trace?: AgentRunTrace;
        error?: string;
      };

      if (!data.ok || !data.trace) {
        setRunError(
          data.error || "Live agent run returned no trace. Check server logs."
        );
        setRunTrace(null);
        return;
      }

      setRunTrace(data.trace);
    } catch (err: any) {
      console.error("[BuildRail] live agent error:", err);
      setRunError(err?.message || "Unexpected error during live agent run.");
      setRunTrace(null);
    } finally {
      setRunLoading(false);
    }
  }

  /* ---- Quality scan + docs handler ---- */

  async function handleQualityScan() {
    setQualityLoading(true);
    setQualityError(null);
    try {
      const res = await fetch("/api/builder/quality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: project.title,
          buildType: project.buildType,
          spec,
          architecture: entities,
          agents,
          testReport,
          deployPlan,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data?.error || "Quality scan failed. Check server logs."
        );
      }

      const data = (await res.json()) as {
        ok: boolean;
        mode?: "offline" | "online";
        result?: QualityScanResult;
        note?: string;
        error?: string;
      };

      if (!data.ok || !data.result) {
        throw new Error(
          data.error || "Quality scan returned no result. Check server logs."
        );
      }

      setQualityMode(data.mode ?? null);
      setQualityResult(data.result);

      if (data.mode === "offline" && data.note) {
        setQualityError(
          `Running in offline heuristic mode (no OPENAI_API_KEY yet): ${data.note}`
        );
      }
    } catch (err: any) {
      console.error("[BuildRail] quality scan error:", err);
      setQualityError(err?.message || "Quality scan failed.");
      setQualityResult(null);
      setQualityMode(null);
    } finally {
      setQualityLoading(false);
    }
  }

  async function handleExportDocsToRepo() {
    if (!qualityResult || !buildDir) return;
    setExportingDocs(true);
    try {
      const res = await fetch("/api/local-builder/export-docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rootDir: buildDir,
          projectTitle: project.title,
          docs: qualityResult.docs,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data?.error || "Failed to export docs to generated repo."
        );
      }

      const data = await res.json();
      console.log("Docs exported:", data);
      alert(
        "Docs exported into generated repo (README, ARCHITECTURE, RUNBOOK)."
      );
    } catch (err: any) {
      console.error("[BuildRail] export docs error:", err);
      alert(err?.message || "Failed to export docs.");
    } finally {
      setExportingDocs(false);
    }
  }

  /* ---- Blueprint export / import ---- */

  function applyBlueprintToCurrentProject(blueprint: any) {
    if (!blueprint || typeof blueprint !== "object") {
      alert("Invalid blueprint object.");
      return;
    }

    const bpProject = blueprint.project ?? blueprint;
    if (!bpProject) {
      alert("Blueprint is missing a 'project' field.");
      return;
    }

    const nextRawIdea: string = bpProject.rawIdea ?? "";
    const nextSpec: MultiLensSpec | null = bpProject.spec ?? null;
    const nextEntities: ArchitectureEntity[] = bpProject.architecture ?? [];
    const nextAgentsRaw: AgentDefinition[] = bpProject.agents ?? [];
    const nextBranding: BrandingConfig =
      bpProject.branding ?? defaultBranding();

    // Update local state
    setRawIdea(nextRawIdea);
    setSpec(nextSpec);
    setEntities(nextEntities);
    setAgents(
      (nextAgentsRaw as AgentDefinition[]).map((a) => ({
        model: a.model || "gpt-4.1-mini",
        temperature: a.temperature ?? 0.2,
        ...a,
      }))
    );
    setBranding(nextBranding);

    // Update project meta (keep title, optionally update description + buildType)
    onProjectMetaUpdate(project.id, {
      description: bpProject.description ?? project.description,
      buildType: (bpProject.buildType as BuildType) ?? project.buildType,
      rawIdea: nextRawIdea,
      spec: nextSpec ?? undefined,
      architecture: nextEntities,
      agents: nextAgentsRaw,
      branding: nextBranding,
    });

    // Clear local export/import buffers so it's obvious we've applied something new
    setBlueprintJson("");
    setBlueprintImportText("");
  }

  function handleImportBlueprintFromText() {
    const trimmed = blueprintImportText.trim();
    if (!trimmed) {
      alert("Paste a blueprint JSON first.");
      return;
    }

    try {
      const parsed = JSON.parse(trimmed);

      // If it's the full wrapper { kind, version, project: { ... } }
      if (parsed.kind === "zero17_builder_blueprint" && parsed.project) {
        applyBlueprintToCurrentProject(parsed);
        return;
      }

      // If someone pasted just the inner "project" object
      applyBlueprintToCurrentProject({ project: parsed });
    } catch (err) {
      console.error("[BuildRail] blueprint import error:", err);
      alert(
        "Could not parse blueprint JSON. Make sure you pasted a valid JSON object."
      );
    }
  }

  function handleExportBlueprintJson() {
    const blueprint = {
      version: 1,
      kind: "zero17_builder_blueprint",
      meta: {
        exportedAt: new Date().toISOString(),
      },
      project: {
        id: project.id,
        title: project.title,
        description: project.description,
        buildType: project.buildType,
        status: project.status ?? "idle",
        rawIdea,
        spec,
        architecture: entities,
        agents,
        branding,
      },
    };
    setBlueprintJson(JSON.stringify(blueprint, null, 2));
  }
  function handleApplyBlueprintTemplate(templateId: string) {
    const tpl = BUILDER_BLUEPRINT_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) {
      alert("Template not found.");
      return;
    }

    const nextRawIdea = tpl.project.rawIdea;
    const nextSpec = tpl.project.spec;
    const nextBranding = tpl.project.branding;
    const nextBuildType = tpl.project.buildType;
    const nextDescription = tpl.project.description;
    const nextEntities = tpl.project.architecture;
    const nextAgents = tpl.project.agents;

    // Local UI state
    setRawIdea(nextRawIdea);
    setSpec(nextSpec);
    setBranding(nextBranding);
    setEntities(nextEntities);
    setAgents(
      nextAgents.map((a) => ({
        model: a.model || "gpt-4.1-mini",
        temperature: a.temperature ?? 0.2,
        ...a,
      }))
    );

    // Persist into project meta
    onProjectMetaUpdate(project.id, {
      buildType: nextBuildType,
      description: nextDescription,
      rawIdea: nextRawIdea,
      spec: nextSpec,
      branding: nextBranding,
      architecture: nextEntities,
      agents: nextAgents,
    });
    // We intentionally leave entities + agents as-is for now.
    // Later we can introduce "full OS" presets that overwrite those too.
  }

  /* ---- OS cockpit metrics ---- */

  let specTotal = 0;
  let specFilled = 0;

  const bump = (val?: string) => {
    specTotal++;
    if (val && val.trim().length > 0) specFilled++;
  };

  if (spec) {
    bump(spec.founder.problem);
    bump(spec.founder.desiredOutcome);
    bump(spec.founder.coreUsers);

    bump(spec.product.keyFeatures);
    bump(spec.product.nonGoals);

    bump(spec.tech.stack);
    bump(spec.tech.dataModel);
    bump(spec.tech.constraints);

    bump(spec.ux.primaryFlows);
    bump(spec.ux.tone);

    bump(spec.launch.pricing);
    bump(spec.launch.successMetric);
  }

  const specPercent =
    specTotal > 0 ? Math.round((specFilled / specTotal) * 100) : 0;

  const entityCount = entities.length;
  const agentCount = agents.length;

  const testsPassed = testReport?.passed ?? 0;
  const testsFailed = testReport?.failed ?? 0;
  const testsTotal = testReport?.total ?? 0;

  const hasDeployPlan = !!deployPlan;
  const hasQuality = !!qualityResult;

  const qualityRisks =
    qualityResult?.sections.filter(
      (s: QualityScanSection) => s.level === "risk"
    ) ?? [];
  const qualityWarnings =
    qualityResult?.sections.filter(
      (s: QualityScanSection) => s.level === "warning"
    ) ?? [];
  const qualityOks =
    qualityResult?.sections.filter(
      (s: QualityScanSection) => s.level === "ok"
    ) ?? [];

  const nextActions =
    qualityResult?.sections
      .flatMap((s: QualityScanSection) => s.recommendations)
      .slice(0, 4) ?? [];

  const hasFounderTemplate = entities.some((e: ArchitectureEntity) =>
    e.id.startsWith("tpl_founder_")
  );
  const hasCreatorTemplate = entities.some((e: ArchitectureEntity) =>
    e.id.startsWith("tpl_creator_")
  );

  /* ---- Diagnostics + fix suggestions ---- */

  const diagnostics: {
    id: string;
    severity: "info" | "warning" | "risk";
    title: string;
    detail: string;
  }[] = [];

  if (specPercent < 60) {
    diagnostics.push({
      id: "spec_low",
      severity: "warning",
      title: "Spec is still under 60%",
      detail:
        "Fill in founder, product, tech, UX, and launch lenses until spec completeness crosses 80% for sharper builds.",
    });
  }

  if (entityCount === 0) {
    diagnostics.push({
      id: "no_entities",
      severity: "risk",
      title: "No architecture entities defined",
      detail:
        "Add at least workspace, user, task/artifact, agent, and run entities so codegen can emit real schema and flows.",
    });
  } else if (entityCount < 4) {
    diagnostics.push({
      id: "few_entities",
      severity: "warning",
      title: "Architecture graph is thin",
      detail:
        "Consider 5–12 core entities for a solid OS. Too few often means hidden complexity will leak into the UI or agents.",
    });
  }

  if (agentCount === 0) {
    diagnostics.push({
      id: "no_agents",
      severity: "risk",
      title: "No agents wired into this build",
      detail:
        "Add 3–7 agents with clear missions. You can use Founder/Creator Daily OS templates as a starting point.",
    });
  }

  if (!buildDir) {
    diagnostics.push({
      id: "no_build",
      severity: "warning",
      title: "No codegen run yet",
      detail:
        "Run codegen at least once to get the generated Next.js app, agent wiring, and repo layout.",
    });
  }

  if (testsTotal === 0) {
    diagnostics.push({
      id: "no_tests",
      severity: "warning",
      title: "No test sweep has been run",
      detail:
        "Run the virtual tests to get an early signal on reliability before wiring real infra.",
    });
  } else if (testsFailed > 0) {
    diagnostics.push({
      id: "tests_failed",
      severity: "warning",
      title: `${testsFailed} tests currently failing`,
      detail:
        "Treat failures as product feedback. Read the failing cases and adjust spec, architecture, or codegen config.",
    });
  }

  if (!hasDeployPlan) {
    diagnostics.push({
      id: "no_deploy",
      severity: "info",
      title: "Deploy blueprint not drafted",
      detail:
        "Draft the deploy plan to list Vercel/GitHub steps, env vars, and smoke tests. This protects you on launch day.",
    });
  }

  if (!hasQuality) {
    diagnostics.push({
      id: "no_quality",
      severity: "info",
      title: "Quality scan not run yet",
      detail:
        "Run the global quality scan to detect risks in founder fit, architecture, agents, tests, and deploy readiness.",
    });
  } else {
    if (qualityRisks.length > 0) {
      diagnostics.push({
        id: "quality_risks",
        severity: "risk",
        title: "Quality scan flagged risk sections",
        detail:
          "Review the red sections in the quality panel (risk level) first. They often hide structural problems.",
      });
    }
    if (qualityWarnings.length > 0) {
      diagnostics.push({
        id: "quality_warnings",
        severity: "warning",
        title: "Quality scan raised warnings",
        detail:
          "Warnings usually point to missing constraints, unclear ownership, or weak observability.",
      });
    }
  }

  if (runTrace && runTrace.steps.length === 0) {
    diagnostics.push({
      id: "no_run_steps",
      severity: "info",
      title: "No agent trace steps",
      detail:
        "Re-run agents with a more concrete scenario or ensure at least one agent has a mission and tools defined.",
    });
  }

  /* ---- Render ---- */

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-8">
      {/* Rail header */}
      <div className="flex items-center justify-between gap-3 mt-1">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1">
            <Hammer className="w-3.5 h-3.5 text-sky-600" />
            <span className="text-[10px] font-semibold text-sky-600">
              Build rail • {project.buildType.toUpperCase()}
            </span>
          </div>
          <h1 className="text-sm font-semibold text-slate-900">
            {project.title}
          </h1>
          {project.description && (
            <p className="text-[11px] text-slate-600 max-w-2xl">
              {project.description}
            </p>
          )}
        </div>
        <div className="text-[10px] text-slate-500 text-right">
          <p>Created: {new Date(project.createdAt).toLocaleString()}</p>
          <p>Updated: {new Date(project.updatedAt).toLocaleString()}</p>
          {project.status && (
            <p className="mt-0.5 text-sky-600">Status: {project.status}</p>
          )}
        </div>
      </div>

      {/* 0. Branding & logo micro-editor */}
      <section className="mt-2 rounded-2xl border border-slate-200 bg-white/90 shadow-sm px-4 py-3 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2">
            <ImageIcon className="w-3.5 h-3.5 text-sky-600" />
            <div>
              <p className="text-[11px] font-semibold text-slate-900">
                0. Branding & logo (preview sandbox)
              </p>
              <p className="text-[10px] text-slate-600">
                Drop a logo, set accent color and tagline. This flows into
                codegen and gives you a live hero preview.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-[minmax(0,1.3fr),minmax(0,1.7fr)] text-[10px]">
          {/* Controls */}
          <div className="space-y-2">
            <div className="space-y-1">
              <label className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                <Upload className="w-3 h-3" />
                <span>Upload logo</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoFileChange}
                className="block w-full text-[10px] text-slate-300 file:mr-2 file:rounded-md file:border file:border-slate-700 file:bg-slate-900 file:px-2 file:py-1 file:text-[10px] file:text-slate-200"
              />
              <p className="text-[9px] text-slate-500">
                PNG/SVG with transparent background works best.
              </p>
            </div>

            <div className="space-y-1">
              <label className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                <Palette className="w-3 h-3" />
                <span>Accent color</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={branding.accentColor}
                  onChange={(e) =>
                    updateBranding({ accentColor: e.target.value })
                  }
                  className="h-6 w-10 rounded-md border border-slate-700 bg-slate-900 p-0"
                />
                <input
                  type="text"
                  value={branding.accentColor}
                  onChange={(e) =>
                    updateBranding({ accentColor: e.target.value })
                  }
                  className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[10px] text-slate-100"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-500">Tagline</label>
              <input
                value={branding.tagline}
                onChange={(e) => updateBranding({ tagline: e.target.value })}
                placeholder="e.g. Your AI chief-of-staff that actually ships."
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[10px] text-slate-100"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-300">
                Logo size (preview)
              </label>
              <input
                type="range"
                min={0.6}
                max={1.4}
                step={0.05}
                value={branding.logoScale}
                onChange={(e) =>
                  updateBranding({ logoScale: parseFloat(e.target.value) })
                }
                className="w-full"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 px-3 py-3 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">
                  Zero17 • Builder preview
                </p>
                <h2 className="text-[13px] font-semibold text-slate-900">
                  {project.title || "Your product name"}
                </h2>
                <p className="text-[10px] text-slate-600 max-w-xs">
                  {branding.tagline ||
                    "Drop in your stack, agents, and OS — Zero17 does the heavy lifting from idea to live AI employee crew."}
                </p>
                <div className="mt-2 inline-flex items-center gap-2">
                  <span
                    className="inline-flex items-center rounded-full px-2 py-1 text-[9px] font-semibold"
                    style={{
                      backgroundColor: `${branding.accentColor}33`,
                      color: branding.accentColor,
                    }}
                  >
                    <Hammer className="w-3 h-3 mr-1" />
                    Prompt → MVP → OS
                  </span>
                  <span className="text-[9px] text-slate-500">
                    Builder Lab • {project.buildType.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div className="relative rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 min-w-[120px] min-h-[80px] flex items-center justify-center">
                  {branding.logoDataUrl ? (
                    <Image
                      src={branding.logoDataUrl}
                      alt="Logo preview"
                      width={96}
                      height={64}
                      style={{ transform: `scale(${branding.logoScale})` }}
                      className="max-h-16 max-w-[96px] object-contain"
                      unoptimized
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-[9px] text-slate-500">
                      <ImageIcon className="w-4 h-4 text-slate-500" />
                      <span>No logo yet</span>
                    </div>
                  )}
                  <div className="absolute -bottom-2 right-2 rounded-full border border-slate-700 bg-slate-900/80 px-2 py-0.5 text-[8px] text-slate-400">
                    Preview only
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-3 text-[9px] text-slate-500">
              This branding config is stored with the project and can flow into
              generated app headers, theme tokens, and marketing pages.
            </p>
          </div>
        </div>
      </section>

      {/* 1. Intent & Spec */}
      <section className="mt-2 rounded-2xl border border-slate-200 bg-white/90 shadow-sm px-4 py-3 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-sky-600" />
            <div>
              <p className="text-[11px] font-semibold text-slate-900">
                1. Intent & multi-lens spec
              </p>
              <p className="text-[10px] text-slate-600">
                Drop the raw idea once. Builder Lab turns it into founder /
                product / tech / UX / launch lenses.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleGenerateSpec}
            className="inline-flex items-center gap-1 rounded-full bg-sky-500 text-slate-950 px-3 py-1.5 text-[10px] font-semibold hover:bg-sky-400"
          >
            <Beaker className="w-3 h-3" />
            <span>Generate spec from idea</span>
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-[minmax(0,1.1fr),minmax(0,1.9fr)] text-[10px]">
          {/* Raw idea */}
          <div className="space-y-2">
            <label className="text-[10px] text-slate-300">
              Raw idea / brief
            </label>
            <textarea
              value={rawIdea}
              onChange={(e) => setRawIdea(e.target.value)}
              rows={7}
              placeholder="Describe what you want in founder language: who is this for, what pain is brutal, what would 'this was worth it' look like in 3 months?"
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-[10px] text-slate-100 resize-none"
            />
            {specError && (
              <p className="text-[9px] text-amber-300 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>{specError}</span>
              </p>
            )}
          </div>

          {/* Lenses */}
          <div className="grid gap-2 md:grid-cols-2">
            <SpecLensCard
              title="Founder lens"
              fields={[
                {
                  label: "Problem",
                  value: spec?.founder.problem ?? "",
                  onChange: (v) =>
                    handleSpecFieldChange("founder", { problem: v }),
                },
                {
                  label: "Desired outcome",
                  value: spec?.founder.desiredOutcome ?? "",
                  onChange: (v) =>
                    handleSpecFieldChange("founder", { desiredOutcome: v }),
                },
                {
                  label: "Core users",
                  value: spec?.founder.coreUsers ?? "",
                  onChange: (v) =>
                    handleSpecFieldChange("founder", { coreUsers: v }),
                },
              ]}
            />
            <SpecLensCard
              title="Product lens"
              fields={[
                {
                  label: "Key features",
                  value: spec?.product.keyFeatures ?? "",
                  onChange: (v) =>
                    handleSpecFieldChange("product", { keyFeatures: v }),
                },
                {
                  label: "Non-goals",
                  value: spec?.product.nonGoals ?? "",
                  onChange: (v) =>
                    handleSpecFieldChange("product", { nonGoals: v }),
                },
              ]}
            />
            <SpecLensCard
              title="Tech lens"
              fields={[
                {
                  label: "Stack",
                  value: spec?.tech.stack ?? "",
                  onChange: (v) => handleSpecFieldChange("tech", { stack: v }),
                },
                {
                  label: "Data model",
                  value: spec?.tech.dataModel ?? "",
                  onChange: (v) =>
                    handleSpecFieldChange("tech", { dataModel: v }),
                },
                {
                  label: "Constraints",
                  value: spec?.tech.constraints ?? "",
                  onChange: (v) =>
                    handleSpecFieldChange("tech", { constraints: v }),
                },
              ]}
            />
            <SpecLensCard
              title="UX & launch"
              fields={[
                {
                  label: "Primary flows",
                  value: spec?.ux.primaryFlows ?? "",
                  onChange: (v) =>
                    handleSpecFieldChange("ux", { primaryFlows: v }),
                },
                {
                  label: "Tone",
                  value: spec?.ux.tone ?? "",
                  onChange: (v) => handleSpecFieldChange("ux", { tone: v }),
                },
                {
                  label: "Pricing",
                  value: spec?.launch.pricing ?? "",
                  onChange: (v) =>
                    handleSpecFieldChange("launch", { pricing: v }),
                },
                {
                  label: "Success metric",
                  value: spec?.launch.successMetric ?? "",
                  onChange: (v) =>
                    handleSpecFieldChange("launch", { successMetric: v }),
                },
              ]}
            />
          </div>
        </div>
      </section>

      {/* 2. Architecture & Agent employees */}
      <section className="mt-2 rounded-2xl border border-slate-200 bg-white/90 shadow-sm px-4 py-3 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2">
            <Boxes className="w-3.5 h-3.5 text-violet-600" />
            <div>
              <p className="text-[11px] font-semibold text-slate-900">
                2. Architecture & agent employees
              </p>
              <p className="text-[10px] text-slate-600">
                Map entities and services, then define your AI employees with
                missions, tools, and models.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadFounderDailyOsTemplate}
              className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-[10px] text-violet-600 hover:bg-violet-100"
            >
              <UserCircle2 className="w-3 h-3" />
              Founder Daily OS
            </button>
            <button
              type="button"
              onClick={loadCreatorDailyOsTemplate}
              className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-[10px] text-violet-600 hover:bg-violet-100"
            >
              <UserCircle2 className="w-3 h-3" />
              Creator Daily OS
            </button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 text-[10px]">
          {/* Entities */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-slate-200">
                Architecture entities
              </span>
              <button
                type="button"
                onClick={addEntity}
                className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900 px-2 py-1 text-[9px] text-slate-200 hover:border-slate-500"
              >
                <Plus className="w-3 h-3" />
                Add entity
              </button>
            </div>
            {entities.length === 0 ? (
              <p className="text-[10px] text-slate-500">
                No entities yet. Start with workspace, user, task/artifact,
                agent, run, and any external integrations.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {entities.map((e) => (
                  <div
                    key={e.id}
                    className="rounded-xl border border-slate-200 bg-white/90 px-2.5 py-1.5 space-y-1"
                  >
                    <div className="flex items-center gap-1.5">
                      <input
                        value={e.name}
                        onChange={(ev) =>
                          updateEntityField(e.id, "name", ev.target.value)
                        }
                        placeholder="Entity name"
                        className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[10px] text-slate-100"
                      />
                      <select
                        value={e.kind}
                        onChange={(ev) =>
                          updateEntityField(e.id, "kind", ev.target.value)
                        }
                        className="rounded-md border border-slate-700 bg-slate-900 px-1.5 py-1 text-[9px] text-slate-200"
                      >
                        <option value="data">data</option>
                        <option value="service">service</option>
                        <option value="external">external</option>
                      </select>
                    </div>
                    <textarea
                      value={e.description}
                      onChange={(ev) =>
                        updateEntityField(e.id, "description", ev.target.value)
                      }
                      rows={2}
                      placeholder="What is this responsible for?"
                      className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[10px] text-slate-100 resize-none"
                    />
                    <textarea
                      value={e.notes}
                      onChange={(ev) =>
                        updateEntityField(e.id, "notes", ev.target.value)
                      }
                      rows={2}
                      placeholder="Notes: relationships, constraints, where data comes from, etc."
                      className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[10px] text-slate-100 resize-none"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Agents */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-slate-200">
                Agent employees (with models)
              </span>
              <button
                type="button"
                onClick={addAgent}
                className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900 px-2 py-1 text-[9px] text-slate-200 hover:border-slate-500"
              >
                <Plus className="w-3 h-3" />
                Add agent
              </button>
            </div>
            {agents.length === 0 ? (
              <p className="text-[10px] text-slate-500">
                Define 3–7 agents that own clear missions: briefing, execution,
                calendar, inbox, analytics, etc.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {agents.map((a) => (
                  <div
                    key={a.id}
                    className="rounded-xl border border-slate-200 bg-white/90 px-2.5 py-1.5 space-y-1.5"
                  >
                    <div className="flex items-center gap-1.5">
                      <input
                        value={a.name}
                        onChange={(ev) =>
                          updateAgentField(a.id, "name", ev.target.value)
                        }
                        placeholder="Agent name"
                        className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[10px] text-slate-100"
                      />
                      <select
                        value={a.model || "gpt-4.1-mini"}
                        onChange={(ev) =>
                          updateAgentField(a.id, "model", ev.target.value)
                        }
                        className="rounded-md border border-slate-700 bg-slate-900 px-1.5 py-1 text-[9px] text-slate-200"
                      >
                        <option value="gpt-4.1-mini">gpt-4.1-mini</option>
                        <option value="gpt-4.1">gpt-4.1</option>
                        <option value="gpt-4o-mini">gpt-4o-mini</option>
                        <option value="gpt-4o">gpt-4o</option>
                      </select>
                      <div className="flex items-center gap-1">
                        <span className="text-[8px] text-slate-500">temp</span>
                        <input
                          type="number"
                          min={0}
                          max={1}
                          step={0.05}
                          value={a.temperature ?? 0.2}
                          onChange={(ev) =>
                            updateAgentField(
                              a.id,
                              "temperature",
                              ev.target.value
                            )
                          }
                          className="w-14 rounded-md border border-slate-700 bg-slate-900 px-1 py-0.5 text-[9px] text-slate-100"
                        />
                      </div>
                    </div>
                    <textarea
                      value={a.mission}
                      onChange={(ev) =>
                        updateAgentField(a.id, "mission", ev.target.value)
                      }
                      rows={2}
                      placeholder="Mission: what does this agent own, and how do we know it's winning?"
                      className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[10px] text-slate-100 resize-none"
                    />
                    <textarea
                      value={a.persona}
                      onChange={(ev) =>
                        updateAgentField(a.id, "persona", ev.target.value)
                      }
                      rows={2}
                      placeholder="Persona: tone, decision style, how it speaks to humans."
                      className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[10px] text-slate-100 resize-none"
                    />
                    <textarea
                      value={a.tools}
                      onChange={(ev) =>
                        updateAgentField(a.id, "tools", ev.target.value)
                      }
                      rows={2}
                      placeholder="Tools: APIs, DB tables, queues, knowledge bases this agent can touch."
                      className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[10px] text-slate-100 resize-none"
                    />
                    <textarea
                      value={a.handoffs}
                      onChange={(ev) =>
                        updateAgentField(a.id, "handoffs", ev.target.value)
                      }
                      rows={2}
                      placeholder="Handoffs: who does this pass work to (agent or human) in which situations?"
                      className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[10px] text-slate-100 resize-none"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. Codegen / tests / deploy */}
      <section className="mt-2 rounded-2xl border border-slate-200 bg-white/90 shadow-sm px-4 py-3 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2">
            <TerminalSquare className="w-3.5 h-3.5 text-sky-600" />
            <div>
              <p className="text-[11px] font-semibold text-slate-900">
                3–5. Codegen, tests, deploy blueprint
              </p>
              <p className="text-[10px] text-slate-600">
                Generate a full stack, simulate tests, and draft a deploy plan
                ready for GitHub / Vercel.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3 text-[10px]">
          {/* Codegen */}
          <div className="rounded-xl border border-slate-200 bg-sky-50 px-3 py-2 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5">
                <FileCode2 className="w-3 h-3 text-sky-600" />
                <span className="text-[10px] font-semibold text-sky-600">
                  3. Codegen
                </span>
              </div>
            </div>
            <p className="text-[10px] text-slate-600">
              Build Next.js app + agent wiring from your spec, architecture, and
              agents.
            </p>
            <button
              type="button"
              onClick={handleRunCodegen}
              disabled={buildLoading}
              className="inline-flex items-center gap-1 rounded-full bg-emerald-500 text-slate-950 px-3 py-1.5 text-[10px] font-semibold hover:bg-emerald-400 disabled:opacity-60"
            >
              {buildLoading ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Generating…</span>
                </>
              ) : (
                <>
                  <Hammer className="w-3 h-3" />
                  <span>Generate app</span>
                </>
              )}
            </button>
            {buildDir && (
              <p className="text-[9px] text-slate-500 mt-1">
                Last build dir:{" "}
                <span className="text-slate-700">{buildDir}</span>
              </p>
            )}
            {buildFiles.length > 0 && (
              <details className="mt-1">
                <summary className="cursor-pointer text-[9px] text-slate-600">
                  Files
                </summary>
                <ul className="mt-1 max-h-24 overflow-y-auto space-y-0.5">
                  {buildFiles.map((f) => (
                    <li key={f} className="text-[9px] text-slate-500">
                      {f}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>

          {/* Tests */}
          <div className="rounded-xl border border-slate-200 bg-emerald-50 px-3 py-2 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span className="text-[10px] font-semibold text-emerald-600">
                  4. Virtual tests
                </span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500">
              Run a synthetic test sweep (mirroring Jest/Playwright hooks).
            </p>
            <button
              type="button"
              onClick={handleRunTests}
              disabled={testsLoading}
              className="inline-flex items-center gap-1 rounded-full bg-emerald-600 text-white px-3 py-1.5 text-[10px] font-semibold hover:bg-emerald-500 disabled:opacity-60"
            >
              {testsLoading ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Running…</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3 h-3" />
                  <span>Run tests</span>
                </>
              )}
            </button>
            {testReport && (
              <div className="mt-1 space-y-1">
                <p className="text-[9px] text-slate-600">
                  Total: {testReport.total} •{" "}
                  <span className="text-emerald-600">
                    Passed: {testReport.passed}
                  </span>{" "}
                  •{" "}
                  <span
                    className={
                      testReport.failed > 0
                        ? "text-amber-300"
                        : "text-slate-400"
                    }
                  >
                    Failed: {testReport.failed}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Deploy plan */}
          <div className="rounded-xl border border-slate-200 bg-amber-50 px-3 py-2 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5">
                <Rocket className="w-3 h-3 text-amber-600" />
                <span className="text-[10px] font-semibold text-amber-600">
                  5. Deploy blueprint
                </span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500">
              Draft a deploy checklist for Vercel/GitHub, envs, migrations, and
              smoke tests.
            </p>
            <button
              type="button"
              onClick={handleDeployPlan}
              disabled={deployLoading}
              className="inline-flex items-center gap-1 rounded-full bg-amber-600 text-white px-3 py-1.5 text-[10px] font-semibold hover:bg-amber-500 disabled:opacity-60"
            >
              {deployLoading ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Drafting…</span>
                </>
              ) : (
                <>
                  <Rocket className="w-3 h-3" />
                  <span>Deploy plan</span>
                </>
              )}
            </button>
            {deployPlan && (
              <p className="mt-1 text-[9px] text-slate-600">
                Target:{" "}
                <span className="text-slate-700">{deployPlan.targetEnv}</span>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 6. Run agents – sim + live */}
      <section className="mt-2 rounded-2xl border border-slate-200 bg-white/90 shadow-sm px-4 py-3 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-violet-600" />
            <div>
              <p className="text-[11px] font-semibold text-slate-900">
                6. Run agents (simulation + live)
              </p>
              <p className="text-[10px] text-slate-600">
                Feed a scenario to your employee crew, simulate the path, or
                call a real model (per-agent model + temp).
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-2 py-1 text-[9px] text-slate-300">
            <span className="text-slate-400">Mode</span>
            <button
              type="button"
              onClick={() => setRunMode("sim")}
              className={`px-2 py-0.5 rounded-full ${
                runMode === "sim"
                  ? "bg-emerald-500 text-slate-950"
                  : "bg-transparent text-slate-300"
              }`}
            >
              Simulation
            </button>
            <button
              type="button"
              onClick={() => setRunMode("live")}
              className={`px-2 py-0.5 rounded-full ${
                runMode === "live"
                  ? "bg-sky-500 text-slate-950"
                  : "bg-transparent text-slate-300"
              }`}
            >
              Live (AI)
            </button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-[minmax(0,1.3fr),minmax(0,1.7fr)] text-[10px]">
          {/* Left: input + controls */}
          <div className="space-y-2">
            <label className="text-[10px] text-slate-300">
              Situation / prompt to the OS
            </label>
            <textarea
              value={runInput}
              onChange={(e) => setRunInput(e.target.value)}
              rows={5}
              placeholder="e.g. Tomorrow I have 5 back-to-back investor meetings, 90 unread emails, and a product deadline. Re-plan my day and surface only what truly matters."
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-[10px] text-slate-100 resize-none"
            />
            <div className="flex items-center justify-between gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-300">
                  Starting agent
                </label>
                <select
                  value={runStartingAgentId}
                  onChange={(e) => setRunStartingAgentId(e.target.value)}
                  className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[10px] text-slate-100"
                >
                  <option value="auto">Auto (first agent)</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name || a.id}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-300">Run</span>
                <button
                  type="button"
                  onClick={
                    runMode === "sim"
                      ? handleRunAgentsSimulation
                      : handleRunAgentsLive
                  }
                  disabled={runLoading}
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-500 text-slate-950 px-3 py-1.5 text-[10px] font-semibold hover:bg-emerald-400 disabled:opacity-60"
                >
                  {runLoading ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>
                        {runMode === "sim" ? "Simulating…" : "Running live…"}
                      </span>
                    </>
                  ) : (
                    <>
                      <Cpu className="w-3 h-3" />
                      <span>
                        {runMode === "sim" ? "Run simulation" : "Run live (AI)"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
            {runError && (
              <p className="text-[10px] text-amber-300 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>{runError}</span>
              </p>
            )}
          </div>

          {/* Right: trace */}
          <div className="rounded-xl border border-slate-200 bg-white/90 px-3 py-2 space-y-1 max-h-60 overflow-y-auto">
            {!runTrace ? (
              <p className="text-[10px] text-slate-500">
                No run yet. Once you execute, you’ll see a step-by-step trace of
                how agents move the situation, with simulated or real outputs.
              </p>
            ) : (
              <>
                <p className="text-[10px] text-slate-600 mb-1">
                  Input:{" "}
                  <span className="text-slate-700">{runTrace.input}</span>
                </p>
                <ul className="space-y-1.5">
                  {runTrace.steps.map((s, idx) => (
                    <li
                      key={s.id}
                      className="rounded-lg border border-slate-200 bg-white/90 px-2.5 py-1.5"
                    >
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-[9px] text-slate-400">
                          Step {idx + 1}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[9px] text-emerald-300">
                          <Cpu className="w-3 h-3" />
                          <span>{s.agentName}</span>
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-300 whitespace-pre-wrap">
                        {s.output}
                      </p>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 7. Quality scan + docs */}
      <section className="mt-3 rounded-2xl border border-slate-200 bg-white/90 shadow-sm px-4 py-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <div>
              <p className="text-[11px] font-semibold text-slate-900">
                7. Quality scan & docs (global standard)
              </p>
              <p className="text-[10px] text-slate-600">
                One click to scan for gaps/risks and generate README,
                architecture notes, and a runbook.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleQualityScan}
              disabled={qualityLoading}
              className="inline-flex items-center gap-1 rounded-full bg-indigo-500 text-slate-950 px-3 py-1.5 text-[10px] font-semibold hover:bg-indigo-400 disabled:opacity-60"
            >
              {qualityLoading ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Scanning…</span>
                </>
              ) : (
                <>
                  <FileText className="w-3 h-3" />
                  <span>Run quality scan</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleExportDocsToRepo}
              disabled={
                !qualityResult || !buildDir || exportingDocs || qualityLoading
              }
              className="inline-flex items-center gap-1 rounded-full bg-slate-800 text-slate-100 px-3 py-1.5 text-[10px] font-semibold hover:bg-slate-700 disabled:opacity-50"
            >
              {exportingDocs ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Exporting…</span>
                </>
              ) : (
                <>
                  <Upload className="w-3 h-3" />
                  <span>Export docs to repo</span>
                </>
              )}
            </button>
          </div>
        </div>

        {qualityError && (
          <p className="text-[10px] text-amber-300 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>{qualityError}</span>
          </p>
        )}

        <div className="grid gap-3 md:grid-cols-[minmax(0,1.4fr),minmax(0,1.6fr)] text-[10px] mt-1">
          {/* Left: sections summary */}
          <div className="space-y-1.5">
            {!qualityResult ? (
              <p className="text-[10px] text-slate-500">
                No scan yet. Once you run it, you’ll see sections for founder
                fit, architecture, agents, tests, and deploy readiness with
                concrete suggestions.
              </p>
            ) : (
              <>
                {qualityMode && (
                  <p className="text-[10px] text-slate-600 mb-1">
                    Mode:{" "}
                    <span
                      className={
                        qualityMode === "online"
                          ? "text-emerald-300"
                          : "text-amber-300"
                      }
                    >
                      {qualityMode === "online"
                        ? "LLM-powered (OPENAI_API_KEY active)"
                        : "Offline heuristic (no OPENAI_API_KEY yet)"}
                    </span>
                  </p>
                )}
                <ul className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {qualityResult.sections.map((s) => (
                    <li
                      key={s.id}
                      className="rounded-lg border border-slate-200 bg-white/90 px-2.5 py-1.5 space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-semibold text-slate-100">
                          {s.title}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[9px]">
                          {s.level === "ok" && (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                              <span className="text-emerald-300">OK</span>
                            </>
                          )}
                          {s.level === "warning" && (
                            <>
                              <AlertTriangle className="w-3 h-3 text-amber-300" />
                              <span className="text-amber-300">Warning</span>
                            </>
                          )}
                          {s.level === "risk" && (
                            <>
                              <AlertTriangle className="w-3 h-3 text-red-400" />
                              <span className="text-red-400">Risk</span>
                            </>
                          )}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300">{s.summary}</p>
                      {s.recommendations.length > 0 && (
                        <ul className="mt-1 space-y-0.5">
                          {s.recommendations.map((r, idx) => (
                            <li
                              key={idx}
                              className="text-[9px] text-slate-400 flex gap-1"
                            >
                              <span>•</span>
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* Right: docs preview */}
          <div className="space-y-1.5">
            {!qualityResult ? (
              <p className="text-[10px] text-slate-500">
                After a scan, you’ll get three doc skeletons you can drop
                straight into your repo: README, architecture notes, and a
                runbook.
              </p>
            ) : (
              <div className="space-y-1.5">
                <DocPreviewCard
                  title="README (team-facing)"
                  content={qualityResult.docs.readme}
                />
                <DocPreviewCard
                  title="Architecture notes"
                  content={qualityResult.docs.architecture}
                />
                <DocPreviewCard
                  title="Runbook (ops & incidents)"
                  content={qualityResult.docs.runbook}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 8. OS cockpit – daily view for founders/creators */}
      <section className="mt-3 rounded-2xl border border-slate-200 bg-white/90 shadow-sm px-4 py-3 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5 text-violet-600" />
            <div>
              <p className="text-[11px] font-semibold text-slate-900">
                8. OS cockpit • founder / creator view
              </p>
              <p className="text-[10px] text-slate-600">
                A single cockpit that tells you: how defined is this build,
                where the risks are, and what to do next.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-[minmax(0,1.4fr),minmax(0,1.6fr)] text-[10px]">
          {/* Metrics strip */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-slate-200 bg-white/90 px-2.5 py-2 space-y-1">
                <p className="text-[9px] text-slate-400">Spec completeness</p>
                <p className="text-[12px] font-semibold text-slate-50">
                  {specPercent}%
                </p>
                <div className="h-1.5 w-full rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${specPercent}%` }}
                  />
                </div>
                <p className="text-[8px] text-slate-500">
                  {specTotal === 0
                    ? "Fill the raw idea and generate lenses."
                    : `${specFilled}/${specTotal} core fields filled.`}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white/90 px-2.5 py-2 space-y-1">
                <p className="text-[9px] text-slate-400">System graph</p>
                <p className="text-[12px] font-semibold text-slate-50">
                  {entityCount} entities · {agentCount} agents
                </p>
                <p className="text-[8px] text-slate-500">
                  Aim for 5–12 entities and 3–7 agents for a sharp OS. Too many
                  usually means chaos.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white/90 px-2.5 py-2 space-y-1">
                <p className="text-[9px] text-slate-400">Tests signal</p>
                {testsTotal === 0 ? (
                  <>
                    <p className="text-[12px] font-semibold text-slate-50">
                      No runs
                    </p>
                    <p className="text-[8px] text-slate-500">
                      Kick off at least one test sweep to get reliability
                      signal.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-[12px] font-semibold text-slate-50">
                      {testsPassed}/{testsTotal} passing
                    </p>
                    <p className="text-[8px] text-slate-500">
                      Fails:{" "}
                      <span
                        className={
                          testsFailed > 0 ? "text-amber-300" : "text-slate-400"
                        }
                      >
                        {testsFailed}
                      </span>
                      . Treat fails as design feedback, not shame.
                    </p>
                  </>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 bg-white/90 px-2.5 py-2 space-y-1">
                <p className="text-[9px] text-slate-400">
                  Production readiness
                </p>
                <p className="text-[12px] font-semibold text-slate-50 flex items-center gap-1">
                  {hasDeployPlan ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Deploy plan drafted</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
                      <span>Not yet drafted</span>
                    </>
                  )}
                </p>
                <p className="text-[8px] text-slate-500">
                  Deploy blueprint + docs + tests = minimum stack before real
                  users.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white/90 px-2.5 py-2 space-y-1.5">
              <p className="text-[9px] text-slate-400">Quality risk radar</p>
              {!hasQuality ? (
                <p className="text-[9px] text-slate-500">
                  Run a quality scan to see risk pockets across founder fit,
                  architecture, agents, tests, and deploy.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/60 bg-emerald-500/10 px-2 py-0.5 text-[9px] text-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    OK: {qualityOks.length}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/60 bg-amber-500/10 px-2 py-0.5 text-[9px] text-amber-200">
                    <AlertTriangle className="w-3 h-3" />
                    Warnings: {qualityWarnings.length}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-red-400/60 bg-red-500/10 px-2 py-0.5 text-[9px] text-red-200">
                    <AlertTriangle className="w-3 h-3" />
                    Risks: {qualityRisks.length}
                  </span>
                </div>
              )}
              {nextActions.length > 0 && (
                <div className="space-y-0.5 mt-1">
                  <p className="text-[9px] text-slate-400">
                    Next 3 moves from the scanner:
                  </p>
                  <ul className="space-y-0.5">
                    {nextActions.slice(0, 3).map((a, idx) => (
                      <li
                        key={idx}
                        className="text-[9px] text-slate-300 flex gap-1"
                      >
                        <span>•</span>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* OS flavour detection */}
          <div className="space-y-2">
            <div className="rounded-xl border border-slate-200 bg-white/90 px-2.5 py-2 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[9px] font-semibold text-slate-100">
                  Founder Daily OS pattern
                </p>
                {hasFounderTemplate ? (
                  <span className="inline-flex items-center gap-1 text-[9px] text-emerald-300">
                    <CheckCircle2 className="w-3 h-3" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[9px] text-slate-400">
                    <AlertTriangle className="w-3 h-3" />
                    Not wired
                  </span>
                )}
              </div>
              <p className="text-[9px] text-slate-400">
                Detects the founder workspace, meeting snapshots, inbox events,
                metrics, and focus blocks pattern.
              </p>
              {!hasFounderTemplate ? (
                <button
                  type="button"
                  onClick={loadFounderDailyOsTemplate}
                  className="inline-flex items-center gap-1 rounded-full border border-emerald-500/60 bg-emerald-500/10 px-2.5 py-1 text-[9px] text-emerald-100 hover:bg-emerald-500/20"
                >
                  <UserCircle2 className="w-3 h-3" />
                  Load Founder OS entities + agents
                </button>
              ) : (
                <p className="text-[8px] text-slate-500">
                  This build has the Founder OS skeleton. Codegen will wire
                  agents like Briefing Chief, Execution Ranger, and Calendar
                  Guardian into your app/OS.
                </p>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white/90 px-2.5 py-2 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[9px] font-semibold text-slate-100">
                  Creator Daily OS pattern
                </p>
                {hasCreatorTemplate ? (
                  <span className="inline-flex items-center gap-1 text-[9px] text-emerald-300">
                    <CheckCircle2 className="w-3 h-3" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[9px] text-slate-400">
                    <AlertTriangle className="w-3 h-3" />
                    Not wired
                  </span>
                )}
              </div>
              <p className="text-[9px] text-slate-400">
                Looks for content ideas, slots, signals, offers, and a squad of
                hook/script/slot/signal agents.
              </p>
              {!hasCreatorTemplate ? (
                <button
                  type="button"
                  onClick={loadCreatorDailyOsTemplate}
                  className="inline-flex items-center gap-1 rounded-full border border-sky-500/60 bg-sky-500/10 px-2.5 py-1 text-[9px] text-sky-100 hover:bg-sky-500/20"
                >
                  <UserCircle2 className="w-3 h-3" />
                  Load Creator OS entities + agents
                </button>
              ) : (
                <p className="text-[8px] text-slate-500">
                  Creator OS pattern is active. Codegen will output a content
                  system with Hook Architect, Script Crafter, Slot Pilot, and
                  more.
                </p>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white/90 px-2.5 py-2 space-y-1">
              <p className="text-[9px] font-semibold text-slate-100">
                OS snapshot for today
              </p>
              <p className="text-[9px] text-slate-400">
                Use this cockpit as your control room: spec → graph → agents →
                tests → deploy → scan. Once this is green across the board, the
                OS is safe to put in front of real founders/creators.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Blueprint export & clone */}
      <section className="mt-3 rounded-2xl border border-slate-200 bg-white/90 shadow-sm px-4 py-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-emerald-300" />
            <div>
              <p className="text-[11px] font-semibold text-slate-900">
                9. Blueprint export & clone
              </p>
              <p className="text-[10px] text-slate-600">
                Turn this build into a shareable JSON blueprint, or clone it as
                a new project inside Builder Lab.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportBlueprintJson}
              className="inline-flex items-center gap-1 rounded-full bg-emerald-500 text-slate-950 px-3 py-1.5 text-[10px] font-semibold hover:bg-emerald-400"
            >
              <FileText className="w-3 h-3" />
              <span>Export blueprint JSON</span>
            </button>
            <button
              type="button"
              onClick={() => onCloneProject(project.id)}
              className="inline-flex items-center gap-1 rounded-full bg-slate-800 text-slate-100 px-3 py-1.5 text-[10px] font-semibold hover:bg-slate-700"
            >
              <Plus className="w-3 h-3" />
              <span>Clone this build</span>
            </button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 mt-1 text-[10px]">
          {/* Left: export view */}
          <div className="space-y-1.5">
            <p className="text-[9px] text-slate-500">
              Blueprint JSON includes: spec, architecture, agents (with models),
              branding, and meta. You can sell/share it, or use it as a template
              library.
            </p>
            {blueprintJson ? (
              <div className="mt-1 rounded-xl border border-slate-200 bg-white/90 px-2.5 py-2">
                <p className="text-[9px] text-slate-400 mb-1">
                  Copy this JSON as your Zero17 Builder blueprint:
                </p>
                <pre className="text-[9px] text-slate-200 whitespace-pre-wrap max-h-40 overflow-y-auto pr-1">
                  {blueprintJson}
                </pre>
              </div>
            ) : (
              <p className="text-[9px] text-slate-500">
                Click “Export blueprint JSON” to generate the blueprint
                snapshot.
              </p>
            )}
          </div>

          {/* Right: import into current project */}
          <div className="space-y-1.5">
            <p className="text-[9px] text-slate-500">
              Import a blueprint into this project. We&apos;ll overwrite spec,
              architecture, agents, and branding. Your current title stays, and
              you can always clone after.
            </p>
            <textarea
              value={blueprintImportText}
              onChange={(e) => setBlueprintImportText(e.target.value)}
              rows={7}
              placeholder='Paste the JSON you exported earlier ({"kind":"zero17_builder_blueprint", ...}) or just the inner "project" object.'
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-[9px] text-slate-100 resize-none"
            />
            <button
              type="button"
              onClick={handleImportBlueprintFromText}
              className="inline-flex items-center gap-1 rounded-full bg-slate-800 text-slate-100 px-3 py-1.5 text-[10px] font-semibold hover:bg-slate-700"
            >
              <FileText className="w-3 h-3" />
              <span>Apply blueprint to this build</span>
            </button>
            <p className="text-[8px] text-slate-500">
              Tip: if you want a separate copy, clone this build first, then
              apply the blueprint to the clone. This is the same mechanism
              we&apos;ll use for a public template library.
            </p>
          </div>
        </div>
        {/* Zero17 quick blueprints */}
        <div className="mt-3 border-t border-slate-800 pt-2 text-[10px]">
          <p className="text-[9px] text-slate-500 mb-1">
            Or jump-start this build from a Zero17 preset blueprint. This
            applies spec + branding; you can still customize architecture and
            agents above.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleApplyBlueprintTemplate("founder-os-saas")}
              className="inline-flex items-center gap-1 rounded-full border border-emerald-500/60 bg-emerald-500/10 px-3 py-1.5 text-[9px] text-emerald-100 hover:bg-emerald-500/20"
            >
              <Hammer className="w-3 h-3" />
              <span>Founder OS – SaaS</span>
            </button>
            <button
              type="button"
              onClick={() => handleApplyBlueprintTemplate("creator-os")}
              className="inline-flex items-center gap-1 rounded-full border border-sky-500/60 bg-sky-500/10 px-3 py-1.5 text-[9px] text-sky-100 hover:bg-sky-500/20"
            >
              <Cpu className="w-3 h-3" />
              <span>Creator OS – Content</span>
            </button>
          </div>
        </div>
      </section>

      {/* 10. Diagnostics & fix suggestions */}
      <section className="mt-3 rounded-2xl border border-slate-200 bg-white/90 shadow-sm px-4 py-3 space-y-2">
        <div className="inline-flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
          <div>
            <p className="text-[11px] font-semibold text-slate-900">
              10. Diagnostics & fix suggestions
            </p>
            <p className="text-[10px] text-slate-600">
              A quick health check of this build, with concrete moves to push it
              to global standard.
            </p>
          </div>
        </div>

        {diagnostics.length === 0 ? (
          <p className="text-[10px] text-emerald-300 mt-1">
            This build currently has no major flags. Ship it, gather real-world
            data, and then iterate the spec and agents from there.
          </p>
        ) : (
          <ul className="mt-1 space-y-1.5">
            {diagnostics.map((d) => (
              <li
                key={d.id}
                className="rounded-lg border border-slate-200 bg-white/90 px-2.5 py-1.5 flex gap-2"
              >
                <div className="pt-0.5">
                  {d.severity === "risk" && (
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  )}
                  {d.severity === "warning" && (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
                  )}
                  {d.severity === "info" && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-100">
                    {d.title}
                  </p>
                  <p className="text-[9px] text-slate-400">{d.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className="text-[9px] text-slate-500 mt-1">
          Use this panel like a CTO checklist: clear all warnings/risks, then go
          back up the rail to refine spec, entities, agents, tests, and deploy
          until the OS feels boringly reliable.
        </p>
      </section>

      <p className="text-[10px] text-slate-500 mt-2">
        The rail now behaves like a full squad around each build: branding →
        intent/spec → architecture → agent employees → codegen → tests → deploy
        → live runs →{" "}
        <span className="text-emerald-300">
          scan + docs + repo export → cockpit → blueprint export/clone →
          diagnostics
        </span>
        . This is the “prompt-to-OS” loop you can reuse and sell as blueprints,
        not just apps.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Spec lens card                                                            */
/* -------------------------------------------------------------------------- */

function SpecLensCard({
  title,
  fields,
}: {
  title: string;
  fields: { label: string; value: string; onChange: (v: string) => void }[];
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white/90 px-2.5 py-2 space-y-1.5">
      <p className="text-[10px] font-semibold text-slate-100">{title}</p>
      {fields.map((f) => (
        <div key={f.label} className="space-y-0.5">
          <label className="text-[9px] text-slate-400">{f.label}</label>
          <textarea
            value={f.value}
            onChange={(e) => f.onChange(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[9px] text-slate-100 resize-none"
          />
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Doc preview card                                                          */
/* -------------------------------------------------------------------------- */

function DocPreviewCard({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  const short =
    content.length > 420 ? content.slice(0, 417).trimEnd() + "..." : content;

  return (
    <div className="rounded-xl border border-slate-200 bg-white/90 px-2.5 py-2 space-y-1">
      <p className="text-[10px] font-semibold text-slate-100">{title}</p>
      <pre className="text-[9px] text-slate-300 whitespace-pre-wrap max-h-28 overflow-y-auto pr-1">
        {short}
      </pre>
    </div>
  );
}

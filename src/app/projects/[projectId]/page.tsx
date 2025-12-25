"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FlaskConical,
  Hammer,
  Rocket,
  LineChart,
  Activity,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ChevronDown,
} from "lucide-react";

type Project = {
  id: string;
  name: string;
  kind: string;
  status: string;
  created_at: string;
  last_step?: string | null;
};

type QaRun = {
  id: string;
  label: string | null;
  status: string;
  score: number | null;
  created_at: string;
};

type LedgerEntry = {
  id: string;
  entry_type: string;
  hash: string | null;
  created_at: string;
};

type ProjectResponse = { ok: boolean; project?: Project; error?: string };
type QaResponse = { ok: boolean; qaRuns?: QaRun[]; error?: string };
type LedgerResponse = { ok: boolean; entries?: LedgerEntry[]; error?: string };

function formatDate(value: string | null | undefined) {
  if (!value) return "";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return value;
  return dt.toLocaleString();
}

const STATUS_STEPS = [
  "draft",
  "building",
  "launched",
  "growing",
  "archived",
] as const;
const STATUS_OPTIONS = ["draft", "building", "launched", "growing"] as const;

const STEP_OPTIONS = [
  "idea",
  "score",
  "blueprint",
  "arena",
  "build",
  "qa",
  "launch",
  "growth",
] as const;

const STEP_LABELS: Record<string, string> = {
  idea: "Idea",
  score: "Score",
  blueprint: "Blueprint",
  arena: "Arena",
  build: "Build",
  qa: "QA",
  launch: "Launch",
  growth: "Growth",
};

function getStepIndex(status: string) {
  const u = status.toLowerCase();
  const idx = STATUS_STEPS.indexOf(u as any);
  if (idx === -1) return 0;
  return Math.min(idx, 3);
}

function getStepLabel(raw: string | null | undefined) {
  if (!raw) return "Idea";
  const key = raw.toLowerCase();
  return STEP_LABELS[key] || "Idea";
}

export default function ProjectOverviewPage({
  params,
}: {
  params: { projectId: string };
}) {
  const { projectId } = params;

  const [project, setProject] = useState<Project | null>(null);
  const [qaRuns, setQaRuns] = useState<QaRun[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState("");

  async function fetchAll() {
    try {
      setLoading(true);
      setErrorMsg(null);

      const projRes = await fetch(`/api/z17/projects/${projectId}`, {
        cache: "no-store",
      });
      const projJson = (await projRes.json()) as ProjectResponse;
      if (!projJson.ok || !projJson.project) {
        throw new Error(projJson.error || "Project not found");
      }

      const qaRes = await fetch(`/api/z17/projects/${projectId}/qa`);
      const qaJson = (await qaRes.json()) as QaResponse;
      if (!qaJson.ok) throw new Error(qaJson.error || "Failed to load QA runs");

      const ledgerRes = await fetch(`/api/z17/projects/${projectId}/ledger`);
      const ledgerJson = (await ledgerRes.json()) as LedgerResponse;
      if (!ledgerJson.ok)
        throw new Error(ledgerJson.error || "Failed to load ledger entries");

      setProject(projJson.project);
      setTempName(projJson.project.name || "Untitled Zero17 Project");
      setQaRuns(qaJson.qaRuns || []);
      setLedgerEntries(ledgerJson.entries || []);
    } catch (err: any) {
      setErrorMsg(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function patchProject(payload: {
    name?: string;
    status?: string;
    lastStep?: string;
  }) {
    if (!project) return;
    try {
      const res = await fetch(`/api/z17/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Update failed");
      setProject(json.project);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to update project");
    }
  }

  const stepIndex = getStepIndex(project?.status || "draft");
  const lastStepLabel = getStepLabel(project?.last_step);

  return (
    <div className="min-h-[calc(100vh-56px)]">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-black"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to projects
          </Link>
          <div className="text-[11px] uppercase text-slate-500">
            Idea → Build → Launch → Growth
          </div>
        </div>

        {/* Header */}
        <header className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <div className="text-[11px] uppercase text-slate-500">
                ZERO17 • PROJECT OVERVIEW
              </div>

              {/* Name (inline edit) */}
              <div
                className="flex items-center gap-2 cursor-text"
                onClick={() => {
                  if (!editingName && project) {
                    setEditingName(true);
                  }
                }}
              >
                {editingName ? (
                  <input
                    autoFocus
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onBlur={() => {
                      setEditingName(false);
                      const trimmed =
                        tempName.trim() || "Untitled Zero17 Project";
                      if (trimmed !== project?.name) {
                        patchProject({ name: trimmed });
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        (e.currentTarget as HTMLInputElement).blur();
                      } else if (e.key === "Escape") {
                        setEditingName(false);
                        setTempName(project?.name || "");
                      }
                    }}
                    className="bg-transparent border-b border-slate-200 text-2xl font-bold outline-none w-full max-w-xl"
                  />
                ) : (
                  <h1 className="text-2xl font-bold">
                    {project
                      ? project.name || "Untitled Zero17 Project"
                      : "Loading…"}
                  </h1>
                )}
              </div>

              {/* Meta chips */}
              {project && (
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white">
                    {project.kind}
                  </span>

                  {/* status dropdown */}
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    <span>Status:</span>
                    <select
                      value={project.status}
                      onChange={(e) => patchProject({ status: e.target.value })}
                      className="bg-transparent text-[11px] outline-none border-none focus:ring-0 cursor-pointer"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3" />
                  </div>

                  {/* last active step dropdown */}
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Last: </span>
                    <select
                      value={(project.last_step || "idea").toLowerCase()}
                      onChange={(e) =>
                        patchProject({ lastStep: e.target.value })
                      }
                      className="bg-transparent text-[11px] outline-none border-none focus:ring-0 cursor-pointer"
                    >
                      {STEP_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {STEP_LABELS[s]}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3" />
                  </div>

                  <span className="text-slate-500">
                    Created: {formatDate(project.created_at)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-2 text-xs">
              <div className="text-[11px] uppercase text-slate-500">
                Overall progress
              </div>
              <ProgressRail activeIndex={stepIndex} />
            </div>
          </div>

          {/* Journey navigation */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <JourneyButton
              href="/lab"
              label="Idea"
              active={stepIndex === 0}
              icon={FlaskConical}
            />
            <div className="h-px w-6 bg-slate-200" />
            <JourneyButton
              href="/builder/arena"
              label="Build"
              active={stepIndex === 1}
              icon={Hammer}
            />
            <div className="h-px w-6 bg-slate-200" />
            <JourneyButton
              href="/launch"
              label="Launch"
              active={stepIndex === 2}
              icon={Rocket}
            />
            <div className="h-px w-6 bg-slate-200" />
            <JourneyButton
              href="/growth"
              label="Growth"
              active={stepIndex === 3}
              icon={LineChart}
            />
          </div>
        </header>

        {/* Error / loading */}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading project timeline…
          </div>
        )}

        {errorMsg && !loading && (
          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Main content */}
        {!loading && !errorMsg && project && (
          <div className="grid md:grid-cols-3 gap-4">
            {/* LEFT */}
            <div className="md:col-span-2 space-y-4">
              {/* Research */}
              <section className="z17-card bg-white/85 p-4 space-y-2">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-sky-600" />
                    <div className="text-sm font-semibold">
                      Research & Blueprint
                    </div>
                  </div>
                  <Link
                    href="/lab"
                    className="text-[11px] text-slate-500 hover:text-black"
                  >
                    Open Research Lab →
                  </Link>
                </div>
                <p className="text-xs text-slate-600">
                  This panel will mirror your latest blueprint and Smart Scores
                  from the Research Lab. Use it as the single source of truth
                  for what you&apos;re building and why it matters.
                </p>
              </section>

              {/* Build & QA */}
              <section className="z17-card bg-white/85 p-4 space-y-2">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <Hammer className="w-4 h-4 text-slate-800" />
                    <div className="text-sm font-semibold">
                      Build & QA (Arena + Build Factory)
                    </div>
                  </div>
                  <Link
                    href="/builder/arena"
                    className="text-[11px] text-slate-500 hover:text-black"
                  >
                    Open Builder Arena →
                  </Link>
                </div>
                <p className="text-xs text-slate-600 mb-2">
                  Use Arena to choose your scaffold, then run Build Factory
                  Lite. Every QA run and report will surface here as a traceable
                  history.
                </p>

                {qaRuns.length === 0 ? (
                  <div className="text-[11px] text-slate-500">
                    No QA runs logged yet. Run Build Factory Lite for this
                    project to see a report here.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {qaRuns.map((run) => (
                      <div
                        key={run.id}
                        className="flex items-center justify-between gap-3 rounded-xl border bg-white px-3 py-2"
                      >
                        <div className="flex flex-col gap-0.5">
                          <div className="text-xs font-semibold">
                            {run.label || "QA run"}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {formatDate(run.created_at)}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {run.score != null && (
                            <div className="text-xs font-semibold">
                              Score: {run.score}
                            </div>
                          )}
                          <StatusBadge status={run.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Launch & Proof */}
              <section className="z17-card bg-white/85 p-4 space-y-2">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <Rocket className="w-4 h-4 text-emerald-600" />
                    <div className="text-sm font-semibold">
                      Launch & Proof-of-Work
                    </div>
                  </div>
                  <Link
                    href="/launch"
                    className="text-[11px] text-slate-500 hover:text-black"
                  >
                    Open Launch Engine →
                  </Link>
                </div>
                <p className="text-xs text-slate-600 mb-2">
                  Every time you run Preflight, generate a Proof Pack or
                  notarise a build, a Truth Ledger entry is created. Those
                  entries live here.
                </p>

                {ledgerEntries.length === 0 ? (
                  <div className="text-[11px] text-slate-500">
                    No ledger entries yet. Once you complete a Launch Engine run
                    for this project, hashes and proof events will show here.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {ledgerEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between gap-3 rounded-xl border bg-white px-3 py-2"
                      >
                        <div className="flex flex-col gap-0.5">
                          <div className="text-xs font-semibold">
                            {entry.entry_type}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {formatDate(entry.created_at)}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-0.5">
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 max-w-[180px] truncate">
                            <Activity className="w-3 h-3" />
                            <span title={entry.hash || ""}>
                              {entry.hash
                                ? entry.hash.slice(0, 10) + "…"
                                : "no-hash"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* RIGHT */}
            <div className="space-y-4">
              {/* Growth snapshot */}
              <section className="z17-card bg-white/85 p-4 space-y-2">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <LineChart className="w-4 h-4 text-amber-600" />
                    <div className="text-sm font-semibold">Growth snapshot</div>
                  </div>
                  <Link
                    href="/growth"
                    className="text-[11px] text-slate-500 hover:text-black"
                  >
                    Open Growth OS →
                  </Link>
                </div>
                <p className="text-xs text-slate-600">
                  As you define ICP, offers, content and performance experiments
                  in Growth OS, a compressed summary for this project will live
                  here.
                </p>
              </section>

              {/* Agent overview stub */}
              <section className="z17-card bg-white/85 p-4 space-y-2">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-600" />
                    <div className="text-sm font-semibold">
                      Agent Employees (overview)
                    </div>
                  </div>
                  <Link
                    href="/agents"
                    className="text-[11px] text-slate-500 hover:text-black"
                  >
                    Open Agent hub →
                  </Link>
                </div>
                <p className="text-xs text-slate-600">
                  Assign Growth, Performance, Content or CTO agents to this
                  project. Their tasks and insights will be surfaced here as the
                  agent system is wired in.
                </p>
              </section>

              {/* Suggested moves */}
              <section className="z17-card bg-white/85 p-4 space-y-2">
                <div className="text-sm font-semibold flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Suggested next moves
                </div>
                <ul className="text-[11px] text-slate-700 list-disc pl-4 space-y-1">
                  <li>
                    Run the <span className="font-semibold">Score</span> step in
                    Research Lab and export a fresh blueprint PDF.
                  </li>
                  <li>
                    Choose a scaffold in{" "}
                    <span className="font-semibold">Builder Arena</span> and run
                    Build Factory Lite once.
                  </li>
                  <li>
                    Use <span className="font-semibold">Launch Engine</span> to
                    generate a Proof Pack + Ledger entry.
                  </li>
                  <li>
                    Create one focused experiment in{" "}
                    <span className="font-semibold">Growth OS</span> and run it
                    for 7–14 days.
                  </li>
                </ul>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---- UI helpers ---- */

function JourneyButton({
  href,
  label,
  active,
  icon: Icon,
}: {
  href: string;
  label: string;
  active: boolean;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] border ${
        active
          ? "bg-black text-white border-black"
          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
      }`}
    >
      <Icon className="w-3 h-3" />
      <span>{label}</span>
    </Link>
  );
}

function ProgressRail({ activeIndex }: { activeIndex: number }) {
  const steps = [
    { label: "Idea", icon: FlaskConical },
    { label: "Build", icon: Hammer },
    { label: "Launch", icon: Rocket },
    { label: "Growth", icon: LineChart },
  ];
  const clamped = Math.min(Math.max(activeIndex, 0), steps.length - 1);

  return (
    <div className="flex items-center gap-2">
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const done = idx <= clamped;
        return (
          <div key={step.label} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] border ${
                done
                  ? "bg-black text-white border-black"
                  : "bg-white text-slate-500 border-slate-200"
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{step.label}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className="h-px w-4 bg-slate-200" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  let cls = "bg-slate-100 text-slate-700 border border-slate-200";
  if (s === "passed") {
    cls = "bg-emerald-100 text-emerald-700 border border-emerald-200";
  } else if (s === "failed") {
    cls = "bg-red-100 text-red-700 border border-red-200";
  } else if (s === "running" || s === "pending") {
    cls = "bg-amber-100 text-amber-700 border border-amber-200";
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-[11px] ${cls}`}>
      {status}
    </span>
  );
}

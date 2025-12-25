"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import Link from "next/link";
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
  GitBranch,
  ShieldAlert,
  BadgeCheck,
} from "lucide-react";

// ✅ PHASE IMPORTS (canonical)
import Phase1SpecCard from "@/app/builder/components/Phase1SpecCard";
import Phase2ArchitectureCard from "@/app/builder/components/Phase2ArchitectureCard";
import Phase35Cards from "@/app/builder/components/Phase35Cards";
import Phase7Cards from "@/app/builder/components/Phase7Cards";
import Phase8Cockpit from "@/app/builder/components/Phase8Cockpit";
import Phase9Docs from "@/app/builder/components/Phase9Docs";
import Phase10Diagnostics from "@/app/builder/components/Phase10Diagnostics";

// ✅ Canonical Registry
import CanonicalRegistryPanel from "@/app/builder/components/CanonicalRegistryPanel";

// ✅ Agent hero card (star feature highlight)
import AgentHeroCard from "@/app/builder/components/AgentHeroCard";

type BuildType = "app" | "agent" | "dashboard" | "workflow";

type BuilderProject = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  build_type: BuildType;
  status: string;

  spec_json: any | null;
  architecture_json: any | null;

  test_plan_json: any | null;
  scan_report_json: any | null;
  deployment_plan_json: any | null;
  docs_pack_json: any | null;
  diagnostics_json: any | null;
  export_plan_json: any | null;

  repo_url?: string | null;
  preview_url?: string | null;
  production_url?: string | null;

  created_at: string;
  updated_at: string;

  // Note: frozen/freezeReason/agents/ledger may exist in your runtime objects,
  // but they are not required for this page to compile.
};

function buildTypeMeta(t: BuildType) {
  switch (t) {
    case "app":
      return { label: "App / MVP", icon: FileCode2 };
    case "agent":
      return { label: "Agent", icon: Cpu };
    case "dashboard":
      return { label: "Dashboard", icon: BarChart3 };
    case "workflow":
      return { label: "Workflow", icon: Workflow };
  }
}

function isLocked(p: BuilderProject) {
  return String(p?.status ?? "").toLowerCase() === "locked";
}

function isFrozen(p: BuilderProject | null) {
  return !!(p as any)?.frozen;
}

function freezeReason(p: BuilderProject | null) {
  const r = (p as any)?.freezeReason;
  return typeof r === "string" ? r : "";
}

// Agent approvals are stored defensively under project.agents[]
// We look for any agent with `approvalRequired === true` OR `approvalStatus === "required"`.
function pendingApprovalsCount(p: BuilderProject | null) {
  const agents = (p as any)?.agents;
  if (!Array.isArray(agents)) return 0;

  let n = 0;
  for (const a of agents) {
    const req =
      !!a?.approvalRequired ||
      String(a?.approvalStatus ?? "").toLowerCase() === "required";
    const status = String(a?.status ?? "").toLowerCase();
    // treat "draft"/"shadow" requiring approval as pending
    if (req && status !== "production") n += 1;
  }
  return n;
}

function StatusPill({ p }: { p: BuilderProject }) {
  const locked = isLocked(p);
  if (locked) {
    return (
      <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
        LOCKED
      </span>
    );
  }

  return (
    <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-600">
      {p.status}
    </span>
  );
}

function FrozenPill() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
      <ShieldAlert className="h-3 w-3" />
      FROZEN
    </span>
  );
}

function ApprovalPill({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
      <BadgeCheck className="h-3 w-3" />
      APPROVAL{count > 0 ? ` • ${count}` : ""}
    </span>
  );
}

export default function BuilderPage() {
  const [projects, setProjects] = useState<BuilderProject[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeId) ?? null,
    [projects, activeId]
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [buildType, setBuildType] = useState<BuildType>("app");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function safeJson(res: Response) {
    return res.json().catch(() => ({}));
  }

  function normalizeProjects(json: any) {
    // supports: {projects:[...]} OR [...]
    const list = Array.isArray(json)
      ? json
      : Array.isArray(json?.projects)
        ? json.projects
        : [];
    return list;
  }

  async function refresh() {
    try {
      setLoading(true);
      setErr(null);

      const res = await fetch("/api/builder/projects", { cache: "no-store" });
      const json = await safeJson(res);

      if (!res.ok) {
        console.error("Load projects failed:", res.status, json);
        throw new Error(json?.error || "Failed to load projects");
      }

      const list = normalizeProjects(json);
      setProjects(list);

      // ✅ active project auto-recovery (no ghost selection)
      setActiveId((prev) => {
        if (!prev) return list[0]?.id ?? null;
        const exists = list.some((p: any) => p.id === prev);
        return exists ? prev : (list[0]?.id ?? null);
      });
    } catch (e: any) {
      setErr(e?.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createProject(e: FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setErr("Give this build a title so you recognize it later.");
      return;
    }

    setCreating(true);
    setErr(null);

    try {
      const res = await fetch("/api/builder/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmed,
          description: description.trim() || null,
          build_type: buildType,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error("Create failed:", res.status, json);
        throw new Error(json?.error || "Failed to create project");
      }

      const p = json?.project as BuilderProject | undefined;
      if (!p) throw new Error("Create returned no project.");

      setProjects((prev) => [p, ...prev]);
      setActiveId(p.id);

      setTitle("");
      setDescription("");
      setBuildType("app");
    } catch (e: any) {
      setErr(e?.message || "Failed to create project");
    } finally {
      setCreating(false);
    }
  }

  async function forkProject(id: string) {
    setErr(null);
    try {
      const res = await fetch(`/api/builder/projects/${id}/clone`, {
        method: "POST",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error("Fork failed:", res.status, json);
        throw new Error(json?.error || "Failed to fork project");
      }

      const p = json?.project as BuilderProject | undefined;
      if (!p) throw new Error("Fork returned no project.");

      setProjects((prev) => [p, ...prev]);
      setActiveId(p.id);
    } catch (e: any) {
      setErr(e?.message || "Failed to fork project");
    }
  }

  async function deleteProject(id: string) {
    if (!confirm("Delete this build? This cannot be undone.")) return;
    setErr(null);

    try {
      const res = await fetch(`/api/builder/projects/${id}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error("Delete failed:", res.status, json);
        throw new Error(json?.error || "Failed to delete project");
      }

      setProjects((prev) => {
        const next = prev.filter((p) => p.id !== id);
        setActiveId((cur) => {
          if (cur !== id) return cur;
          return next[0]?.id ?? null;
        });
        return next;
      });
    } catch (e: any) {
      setErr(e?.message || "Failed to delete project");
    }
  }

  const activeFrozen = isFrozen(activeProject);
  const activeFreezeReason = freezeReason(activeProject);
  const activeApprovals = pendingApprovalsCount(activeProject);

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-100 via-rose-50 to-slate-100 text-slate-900">
      <div className="mx-auto mt-4 max-w-[1400px] rounded-3xl border border-slate-200 bg-white/80 px-4 py-4 shadow-xl backdrop-blur md:px-6 md:py-6">
        {/* Header */}
        <header className="relative flex items-center justify-between border-b border-slate-200 bg-white/90 px-6 py-4">
          <div className="pointer-events-none absolute -top-8 -right-10 h-32 w-32 rounded-full bg-sky-200/60 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-4 h-36 w-36 rounded-full bg-amber-200/70 blur-3xl" />

          <div className="flex items-center gap-3">
            <div className="relative rounded-3xl border border-slate-200 bg-white/90 px-4 py-4 shadow-sm md:px-6 md:py-6">
              <Hammer className="h-4 w-4 text-sky-600" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-sky-600">
                Zero17 • Builder Lab
              </div>
              <div className="text-sm font-semibold text-slate-900">
                Intent → Spec → Architecture → Codegen → Tests → Deploy → Scan →
                Cockpit → Docs → Diagnostics
              </div>

              {/* ✅ Global guard signal (surfaced at top) */}
              <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-600">
                {activeProject ? (
                  <>
                    {activeFrozen && (
                      <span className="inline-flex items-center gap-1 text-rose-700">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        Freeze guard active: promotions blocked until unfrozen.
                      </span>
                    )}
                    {!activeFrozen && activeApprovals > 0 && (
                      <span className="inline-flex items-center gap-1 text-indigo-700">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        Approval required: {activeApprovals} agent(s) pending.
                      </span>
                    )}
                  </>
                ) : (
                  <span>Select a build to start.</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <Link
              href="/research"
              className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-sky-600 hover:bg-sky-100"
            >
              <Beaker className="h-3.5 w-3.5" />
              Back to Research Lab
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-amber-600 hover:bg-amber-100"
            >
              <Rocket className="h-3.5 w-3.5" />
              All Projects
            </Link>
          </div>
        </header>

        {/* Body */}
        <div className="flex">
          {/* Left rail */}
          <aside className="w-80 flex-shrink-0 border-r border-slate-200 bg-slate-50/80 p-3">
            <section className="rounded-2xl border border-slate-200 bg-white/90 px-3.5 py-3 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5 text-sky-600" />
                  <span className="text-[11px] font-semibold text-slate-900">
                    New build
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">
                  Stable Supabase rail
                </span>
              </div>

              <form className="space-y-2.5" onSubmit={createProject}>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500">
                    Title <span className="text-sky-600">*</span>
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Founder OS dashboard v1"
                    className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[11px] outline-none focus:border-sky-400"
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
                    className="w-full resize-none rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[11px] outline-none focus:border-sky-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500">
                    Build type
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                    <BuildTypeChip
                      value="app"
                      current={buildType}
                      onSelect={setBuildType}
                    />
                    <BuildTypeChip
                      value="agent"
                      current={buildType}
                      onSelect={setBuildType}
                    />
                    <BuildTypeChip
                      value="dashboard"
                      current={buildType}
                      onSelect={setBuildType}
                    />
                    <BuildTypeChip
                      value="workflow"
                      current={buildType}
                      onSelect={setBuildType}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-500 disabled:bg-slate-300"
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating…
                    </>
                  ) : (
                    "Create Builder Project"
                  )}
                </button>
              </form>

              {err && (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {err}
                </div>
              )}
            </section>

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-semibold text-slate-800">
                  Your builder projects
                </p>
                <button
                  onClick={refresh}
                  className="text-[10px] text-slate-500 hover:text-slate-800"
                >
                  Refresh
                </button>
              </div>

              {loading ? (
                <div className="rounded-xl border border-slate-200 bg-white/70 px-3 py-3 text-xs text-slate-600">
                  Loading…
                </div>
              ) : projects.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white/70 px-3 py-3 text-xs text-slate-600">
                  No builds yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {projects.map((p) => {
                    const active = p.id === activeId;
                    const frozen = isFrozen(p);
                    const approvals = pendingApprovalsCount(p);

                    return (
                      <button
                        key={p.id}
                        onClick={() => setActiveId(p.id)}
                        className={[
                          "w-full rounded-2xl border px-3 py-2 text-left shadow-sm",
                          active
                            ? "border-sky-300 bg-sky-50"
                            : "border-slate-200 bg-white/90 hover:bg-white",
                        ].join(" ")}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[11px] font-semibold text-slate-900">
                            {p.title}
                          </p>
                          <div className="flex items-center gap-1.5">
                            {frozen && <FrozenPill />}
                            {approvals > 0 && (
                              <ApprovalPill count={approvals} />
                            )}
                            <StatusPill p={p} />
                          </div>
                        </div>

                        <p className="mt-1 line-clamp-2 text-[10px] text-slate-600">
                          {p.description || "—"}
                        </p>

                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className="text-[10px] text-slate-500">
                            {p.build_type}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                forkProject(p.id);
                              }}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-800 hover:bg-slate-50"
                              title="Create an editable fork of this build"
                            >
                              <GitBranch className="h-3 w-3" />
                              Fork
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                deleteProject(p.id);
                              }}
                              className="text-[10px] text-rose-600 hover:text-rose-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {/* ✅ Freeze guard explanation (rail-level) */}
                        {frozen && (
                          <div className="mt-2 rounded-xl border border-rose-200 bg-rose-50 px-2 py-1 text-[10px] text-rose-800">
                            Freeze guard: promotions + risky actions blocked.
                          </div>
                        )}

                        {/* ✅ Approval required explanation */}
                        {approvals > 0 && !frozen && (
                          <div className="mt-2 rounded-xl border border-indigo-200 bg-indigo-50 px-2 py-1 text-[10px] text-indigo-800">
                            Approval required: {approvals} agent(s) pending
                            sign-off.
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>

          {/* Main rail */}
          <section className="flex-1 px-6 py-4">
            {!activeProject ? (
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 text-sm text-slate-700">
                Select a build on the left (or create one).
              </div>
            ) : (
              <div className="space-y-4">
                {/* ✅ Star feature highlight (shown once a project exists) */}
                <AgentHeroCard />

                {/* Top meta */}
                <div className="rounded-2xl border border-slate-200 bg-white/90 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-900">
                        {activeProject.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-600">
                        {activeProject.description || "—"}
                      </p>
                      <div className="mt-2 text-[11px] text-slate-500">
                        Created:{" "}
                        {new Date(activeProject.created_at).toLocaleString()}
                        <span className="mx-2">•</span>
                        Updated:{" "}
                        {new Date(activeProject.updated_at).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        {activeFrozen && <FrozenPill />}
                        {activeApprovals > 0 && (
                          <ApprovalPill count={activeApprovals} />
                        )}
                        <StatusPill p={activeProject} />
                      </div>

                      {activeFrozen && (
                        <div className="max-w-[360px] rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-900">
                          <div className="font-semibold">Freeze mode ON</div>
                          <div className="mt-0.5 text-rose-800">
                            {activeFreezeReason ||
                              "Stability lock: only safe actions allowed."}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ✅ PHASES 1 → 10 */}
                <Phase1SpecCard
                  project={activeProject as any}
                  onProjectUpdatedAction={(p: any) => {
                    setProjects((prev) =>
                      prev.map((x) => (x.id === p.id ? (p as any) : x))
                    );
                  }}
                />

                <Phase2ArchitectureCard
                  project={activeProject as any}
                  onProjectUpdatedAction={(p: any) => {
                    setProjects((prev) =>
                      prev.map((x) => (x.id === p.id ? (p as any) : x))
                    );
                  }}
                />

                <Phase35Cards
                  activeProject={activeProject as any}
                  setProjectsAction={setProjects as any}
                />

                <Phase7Cards
                  activeProject={activeProject as any}
                  setProjectsAction={setProjects as any}
                />

                <Phase8Cockpit activeProject={activeProject as any} />

                <Phase9Docs
                  activeProject={activeProject as any}
                  setProjectsAction={setProjects as any}
                />

                <Phase10Diagnostics
                  activeProject={activeProject as any}
                  setProjectsAction={setProjects as any}
                />

                {/* ✅ Canonical Registry (anti-chaos) */}
                <CanonicalRegistryPanel project={activeProject as any} />
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function BuildTypeChip({
  value,
  current,
  onSelect,
}: {
  value: BuildType;
  current: BuildType;
  onSelect: (t: BuildType) => void;
}) {
  const meta = buildTypeMeta(value);
  const Icon = meta.icon;
  const active = current === value;

  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={[
        "inline-flex items-center gap-1.5 rounded-xl border px-2 py-1.5 text-[10px]",
        active
          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
      ].join(" ")}
    >
      <Icon className="h-3.5 w-3.5" />
      {meta.label}
    </button>
  );
}

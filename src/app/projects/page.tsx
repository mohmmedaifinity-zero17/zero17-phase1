"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Hammer,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

const ZERO17_BUILDER_PROJECTS_KEY = "zero17_builder_projects_v1";

interface BuilderProjectSummary {
  id: string;
  title: string;
  description?: string;
  buildType?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  // optional: spec completeness, entities, agents if present
  specCompleteness?: number;
  entitiesCount?: number;
  agentsCount?: number;
}

function loadBuilderProjects(): BuilderProjectSummary[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ZERO17_BUILDER_PROJECTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as any[];
    return parsed.map((p) => ({
      id: p.id,
      title: p.title ?? "Untitled build",
      description: p.description ?? "",
      buildType: p.buildType,
      status: p.status ?? "idle",
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      specCompleteness: p.specCompleteness,
      entitiesCount: Array.isArray(p.architecture)
        ? p.architecture.length
        : undefined,
      agentsCount: Array.isArray(p.agents) ? p.agents.length : undefined,
    }));
  } catch (err) {
    console.error("[Projects] failed to load builder projects:", err);
    return [];
  }
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<BuilderProjectSummary[]>([]);

  useEffect(() => {
    setProjects(loadBuilderProjects());
  }, []);

  const hasProjects = projects.length > 0;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <header className="flex items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-emerald-400/80">
              Zero17 / Projects
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-50">
              Builder Projects
            </h1>
            <p className="mt-1 text-sm text-slate-400 max-w-2xl">
              Every build you create in Builder Lab shows up here as an asset.
              Open in Builder to continue editing, or treat the blueprint as
              something you can sell, clone, or wire into Growth OS.
            </p>
          </div>
          <Link
            href="/builder"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-[13px] font-semibold text-slate-950 hover:bg-emerald-400"
          >
            <Hammer className="w-4 h-4" />
            <span>Open Builder Lab</span>
          </Link>
        </header>

        {!hasProjects ? (
          <div className="mt-12 rounded-2xl border border-slate-800 bg-slate-950/80 px-6 py-10 text-center">
            <BarChart3 className="mx-auto mb-3 h-6 w-6 text-slate-500" />
            <p className="text-sm font-medium text-slate-100">
              No Builder projects found yet.
            </p>
            <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">
              Start in Builder Lab, create your first build, and it will appear
              here automatically. Projects are stored locally in your browser
              for now.
            </p>
            <div className="mt-4">
              <Link
                href="/builder"
                className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-4 py-1.5 text-[12px] text-slate-100 hover:bg-slate-700"
              >
                <Hammer className="w-3 h-3" />
                <span>Create first Builder project</span>
              </Link>
            </div>
          </div>
        ) : (
          <section className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>{projects.length} Builder projects</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Sorted by last updated</span>
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {projects
                .slice()
                .sort((a, b) => {
                  const aTime = a.updatedAt ? Date.parse(a.updatedAt) : 0;
                  const bTime = b.updatedAt ? Date.parse(b.updatedAt) : 0;
                  return bTime - aTime;
                })
                .map((p) => {
                  const status = p.status ?? "idle";
                  const entitiesCount = p.entitiesCount ?? 0;
                  const agentsCount = p.agentsCount ?? 0;
                  const specPct = p.specCompleteness ?? 0;

                  const statusChip =
                    status === "built" || status === "deployed" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300 border border-emerald-500/40">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{status}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 border border-slate-700">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        <span>{status}</span>
                      </span>
                    );

                  return (
                    <div
                      key={p.id}
                      className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-50">
                            {p.title}
                          </p>
                          {p.buildType && (
                            <p className="mt-0.5 text-[11px] text-slate-400">
                              {p.buildType.toUpperCase()}
                            </p>
                          )}
                          {p.description && (
                            <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                              {p.description}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {statusChip}
                          {(p.updatedAt || p.createdAt) && (
                            <p className="text-[9px] text-slate-500">
                              {p.updatedAt
                                ? `Updated ${new Date(p.updatedAt).toLocaleDateString()}`
                                : `Created ${new Date(p.createdAt!).toLocaleDateString()}`}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
                        <div className="flex flex-wrap gap-3">
                          <span>
                            Spec:{" "}
                            <span className="text-slate-100">
                              {specPct ? `${specPct}%` : "—"}
                            </span>
                          </span>
                          <span>
                            Entities:{" "}
                            <span className="text-slate-100">
                              {entitiesCount}
                            </span>
                          </span>
                          <span>
                            Agents:{" "}
                            <span className="text-slate-100">
                              {agentsCount}
                            </span>
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href="/builder"
                            className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-3 py-1 text-[10px] text-slate-100 hover:bg-slate-700"
                          >
                            <Hammer className="w-3 h-3" />
                            <span>Open in Builder</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

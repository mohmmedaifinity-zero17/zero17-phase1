// src/components/growth/BuilderOsGallery.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Cpu, Rocket, Sparkles } from "lucide-react";

const ZERO17_BUILDER_PROJECTS_KEY = "zero17_builder_projects_v1";

interface BuilderProjectOS {
  id: string;
  title: string;
  description?: string;
  buildType?: string;
  entitiesCount?: number;
  agentsCount?: number;
  updatedAt?: string;
}

function loadOsProjects(): BuilderProjectOS[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(ZERO17_BUILDER_PROJECTS_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as any[];

    return parsed
      .filter((p) => p.buildType === "dashboard") // treat dashboards as OS candidates
      .map((p) => ({
        id: p.id,
        title: p.title ?? "Untitled OS",
        description: p.description ?? "",
        buildType: p.buildType,
        entitiesCount: Array.isArray(p.architecture)
          ? p.architecture.length
          : 0,
        agentsCount: Array.isArray(p.agents) ? p.agents.length : 0,
        updatedAt: p.updatedAt,
      }));
  } catch (err) {
    console.error("[BuilderOsGallery] failed to load OS projects:", err);
    return [];
  }
}

export default function BuilderOsGallery() {
  const [osProjects, setOsProjects] = useState<BuilderProjectOS[] | null>(null);

  useEffect(() => {
    const projects = loadOsProjects();
    // Sort by last updated, newest first
    projects.sort((a, b) => {
      const aTime = a.updatedAt ? Date.parse(a.updatedAt) : 0;
      const bTime = b.updatedAt ? Date.parse(b.updatedAt) : 0;
      return bTime - aTime;
    });
    setOsProjects(projects);
  }, []);

  const loading = osProjects === null;
  const hasOs = !!osProjects && osProjects.length > 0;

  return (
    <section className="rounded-3xl border border-amber-200/70 bg-white/80 shadow-sm backdrop-blur-sm px-4 py-5 space-y-4">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <LayoutDashboard className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
              Builder Lab · Operating Systems
            </p>
            <h2 className="text-sm font-semibold text-slate-900">
              Live OS graphs designed in Zero17
            </h2>
            <p className="text-[11px] text-slate-500">
              Any dashboard-style build in Builder Lab (Founder OS, Creator OS,
              etc.) appears here as a Growth OS tile.
            </p>
          </div>
        </div>

        <Link
          href="/builder"
          className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1.5 text-[11px] font-semibold text-slate-950 shadow-sm hover:bg-amber-400"
        >
          <Cpu className="h-3.5 w-3.5" />
          <span>Design a new OS in Builder</span>
        </Link>
      </header>

      {loading && (
        <div className="rounded-2xl border border-amber-100 bg-amber-50/80 px-4 py-6 text-center text-[11px] text-amber-800">
          <Sparkles className="mx-auto mb-2 h-4 w-4" />
          Loading Builder OS projects…
        </div>
      )}

      {!loading && !hasOs && (
        <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/60 px-4 py-6 text-center text-[11px] text-amber-900">
          <LayoutDashboard className="mx-auto mb-2 h-4 w-4" />
          <p className="font-medium">No operating systems detected yet.</p>
          <p className="mt-1 max-w-md mx-auto text-[11px] text-amber-800">
            Create a <span className="font-semibold">dashboard</span>-type
            project in Builder Lab (like Founder OS or Creator OS). Once you
            save it, it will appear here as a Growth OS tile.
          </p>
          <div className="mt-3">
            <Link
              href="/builder"
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-amber-50 hover:bg-slate-800"
            >
              <Rocket className="h-3.5 w-3.5" />
              <span>Start in Builder Lab</span>
            </Link>
          </div>
        </div>
      )}

      {!loading && hasOs && (
        <div className="grid gap-3 md:grid-cols-2">
          {osProjects!.map((p) => (
            <article
              key={p.id}
              className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 flex flex-col justify-between shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {p.title}
                  </h3>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    Operating System · {p.buildType ?? "dashboard"}
                  </p>
                  {p.description && (
                    <p className="mt-1 text-[11px] text-slate-600 line-clamp-2">
                      {p.description}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 text-[10px] text-slate-500">
                  <span>
                    Entities:{" "}
                    <span className="font-semibold text-slate-900">
                      {p.entitiesCount ?? 0}
                    </span>
                  </span>
                  <span>
                    Agents:{" "}
                    <span className="font-semibold text-slate-900">
                      {p.agentsCount ?? 0}
                    </span>
                  </span>
                  {p.updatedAt && (
                    <span className="text-[9px]">
                      Updated {new Date(p.updatedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500">
                <p className="max-w-xs">
                  Open this OS in Builder Lab to tweak the graph, run agents,
                  and ship new growth experiments.
                </p>
                <Link
                  href="/builder"
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-[10px] font-semibold text-amber-50 hover:bg-slate-800"
                >
                  <Rocket className="h-3 w-3" />
                  <span>Open in Builder</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

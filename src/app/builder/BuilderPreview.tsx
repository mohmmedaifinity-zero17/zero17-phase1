// src/app/builder/BuilderPreview.tsx

"use client";

import { useMemo, useState } from "react";
import type {
  BuilderProject,
  BuilderStatus,
  MultiLensSpec,
  ArchitectureMap,
  ArchitectureScreen,
  ArchitectureEntity,
} from "@/lib/builder/types";

interface BuilderPreviewProps {
  project: BuilderProject | null;
  spec: MultiLensSpec | null;
  architecture: ArchitectureMap | null;
  onArchitectureChange?: (arch: ArchitectureMap) => void;
}

const BUILT_OR_BEYOND: BuilderStatus[] = [
  "built",
  "refined",
  "tested",
  "scanned",
  "deployed",
  "handed_off",
];

function isBuiltOrBeyond(status: BuilderStatus) {
  return BUILT_OR_BEYOND.includes(status);
}

export default function BuilderPreview({
  project,
  spec,
  architecture,
  onArchitectureChange,
}: BuilderPreviewProps) {
  const [activeScreenId, setActiveScreenId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [newScreenName, setNewScreenName] = useState("");
  const [newEntityName, setNewEntityName] = useState("");

  const hasPreview = !!project && !!spec && !!architecture;

  const initialScreenId = useMemo(() => {
    if (!architecture || architecture.screens.length === 0) return null;
    return architecture.screens[0].id;
  }, [architecture]);

  const effectiveActiveScreenId = activeScreenId ?? initialScreenId ?? null;

  const activeScreen: ArchitectureScreen | null =
    architecture && effectiveActiveScreenId
      ? (architecture.screens.find((s) => s.id === effectiveActiveScreenId) ??
        architecture.screens[0] ??
        null)
      : null;

  if (!project) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-300">
        <p className="text-[11px] uppercase tracking-wide text-slate-500">
          Preview
        </p>
        <p className="mt-1">
          Select a project on the left to see its Builder preview.
        </p>
      </div>
    );
  }

  if (!hasPreview) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-300">
        <p className="text-[11px] uppercase tracking-wide text-slate-500">
          Preview
        </p>
        <p className="mt-1">
          Generate and save a Multi-Lens Spec and Architecture Map to activate
          the live Builder preview for{" "}
          <span className="font-semibold">{project.title}</span>.
        </p>
      </div>
    );
  }

  const built = isBuiltOrBeyond(project.status);

  function applyRenameScreen() {
    if (!architecture || !activeScreen || !renameValue.trim()) return;
    if (!onArchitectureChange) return;

    const updated: ArchitectureMap = {
      ...architecture,
      screens: architecture.screens.map((s) =>
        s.id === activeScreen.id ? { ...s, name: renameValue.trim() } : s
      ),
    };

    onArchitectureChange(updated);
    setRenameValue("");
  }

  function applyNewScreen() {
    if (!architecture || !newScreenName.trim()) return;
    if (!onArchitectureChange) return;

    const id = `screen_${architecture.screens.length + 1}`;
    const newScreen: ArchitectureScreen = {
      id,
      name: newScreenName.trim(),
      purpose: "Additional view created from Preview Surgery.",
    };

    const updated: ArchitectureMap = {
      ...architecture,
      screens: [...architecture.screens, newScreen],
    };

    onArchitectureChange(updated);
    setNewScreenName("");
    setActiveScreenId(id);
  }

  function applyNewEntity() {
    if (!architecture || !newEntityName.trim()) return;
    if (!onArchitectureChange) return;

    const name = newEntityName.trim();
    if (architecture.entities.some((e) => e.name === name)) {
      setNewEntityName("");
      return;
    }

    const newEntity: ArchitectureEntity = {
      name,
      fields: [
        { name: "id", type: "uuid" },
        { name: "userId", type: "uuid" },
        { name: "title", type: "text" },
        { name: "data", type: "jsonb", nullable: true },
        { name: "createdAt", type: "timestamptz" },
      ],
    };

    const updated: ArchitectureMap = {
      ...architecture,
      entities: [...architecture.entities, newEntity],
    };

    onArchitectureChange(updated);
    setNewEntityName("");
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
      {/* App header */}
      <div className="border-b border-slate-800 bg-gradient-to-r from-sky-900/80 via-slate-950 to-slate-950 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wide text-sky-300/80">
              Zero17 · Builder Preview
            </p>
            <h3 className="truncate text-sm font-semibold text-slate-50">
              {project.title}
            </h3>
            {project.description && (
              <p className="truncate text-[11px] text-slate-300/80">
                {project.description}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="rounded-full border border-slate-600 bg-slate-900/70 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-300">
              {project.build_type}
            </span>
            <span
              className={[
                "rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide",
                built
                  ? "bg-emerald-900/50 text-emerald-200 border border-emerald-500/70"
                  : "bg-slate-900/50 text-slate-300 border border-slate-600/70",
              ].join(" ")}
            >
              {project.status}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Left: Screen nav */}
        <aside className="border-b border-slate-800 bg-slate-950/90 px-3 py-3 md:h-full md:w-44 md:border-b-0 md:border-r">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Screens
          </p>
          <div className="flex flex-row gap-1 overflow-x-auto md:flex-col md:gap-1.5">
            {architecture!.screens.map((screen) => {
              const active = screen.id === effectiveActiveScreenId;
              return (
                <button
                  key={screen.id}
                  type="button"
                  onClick={() => setActiveScreenId(screen.id)}
                  className={[
                    "shrink-0 rounded-lg border px-2 py-1 text-left text-[11px] transition-colors",
                    active
                      ? "border-sky-500 bg-sky-900/40 text-sky-50"
                      : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500 hover:text-slate-50",
                  ].join(" ")}
                >
                  {screen.name}
                </button>
              );
            })}
            {architecture!.screens.length === 0 && (
              <p className="text-[11px] text-slate-500">
                No screens defined yet.
              </p>
            )}
          </div>
        </aside>

        {/* Main: Active screen preview + surgery */}
        <main className="flex-1 bg-slate-950 px-4 py-3 text-xs text-slate-200">
          {!activeScreen ? (
            <p className="text-[11px] text-slate-500">
              Define at least one screen in the Architecture Map to see the
              preview.
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">
                    Active Screen
                  </p>
                  <h4 className="text-sm font-semibold text-slate-50">
                    {activeScreen.name}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {activeScreen.purpose}
                  </p>
                </div>
                {built ? (
                  <span className="rounded-full bg-emerald-900/40 px-2 py-0.5 text-[10px] text-emerald-200">
                    Build Engine v1 · Virtual
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] text-slate-400">
                    Preview before full build
                  </span>
                )}
              </div>

              {/* Layout mock: hero + side cards */}
              <div className="grid gap-3 md:grid-cols-[minmax(0,1.6fr),minmax(0,1.1fr)]">
                {/* Hero area */}
                <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Hero View
                  </p>
                  <p className="text-[11px] text-slate-300">
                    This area approximates how the main content of{" "}
                    <span className="font-semibold">{activeScreen.name}</span>{" "}
                    will feel. Build Engine v2 can later map this 1:1 to actual
                    React components.
                  </p>

                  {spec && (
                    <div className="mt-2 space-y-2 rounded-lg border border-slate-800 bg-slate-950/80 p-2">
                      <p className="text-[11px] font-semibold text-slate-300">
                        Core Outcome
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {spec.founderLens.problem}
                      </p>
                      {spec.founderLens.coreFlows?.length > 0 && (
                        <ul className="mt-1 list-disc pl-4 text-[11px] text-slate-400">
                          {spec.founderLens.coreFlows.map((flow, idx) => (
                            <li key={idx}>{flow}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>

                {/* Side: Entities + APIs summary */}
                <div className="space-y-3">
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Entities
                    </p>
                    {architecture.entities.length === 0 ? (
                      <p className="mt-1 text-[11px] text-slate-500">
                        No entities defined yet. Add them in the Architecture
                        Map or via Preview Surgery.
                      </p>
                    ) : (
                      <ul className="mt-1 space-y-1 text-[11px] text-slate-300">
                        {architecture.entities.map((entity) => (
                          <li
                            key={entity.name}
                            className="flex items-center justify-between gap-2"
                          >
                            <span>{entity.name}</span>
                            <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] text-slate-500">
                              {entity.fields.length} fields
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      APIs
                    </p>
                    {architecture.apis.length === 0 ? (
                      <p className="mt-1 text-[11px] text-slate-500">
                        No APIs defined yet. Add them in a later iteration.
                      </p>
                    ) : (
                      <ul className="mt-1 space-y-1 text-[11px] text-slate-300">
                        {architecture.apis.map((api) => (
                          <li key={api.path}>
                            <span className="font-mono text-[10px] text-slate-400">
                              [{api.method}] {api.path}
                            </span>
                            {api.summary && (
                              <p className="text-[10px] text-slate-500">
                                {api.summary}
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* Infra pill row */}
              <div className="mt-1 flex flex-wrap gap-1.5">
                <Badge label={`DB: ${architecture.infra.database}`} />
                <Badge label={`Hosting: ${architecture.infra.hosting}`} />
                <Badge label={`Auth: ${architecture.infra.authProvider}`} />
                {architecture.infra.billingProvider && (
                  <Badge
                    label={`Billing: ${architecture.infra.billingProvider}`}
                  />
                )}
              </div>

              {/* Preview Surgery */}
              <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950 p-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Preview Surgery (Ultra-Light)
                </p>
                <p className="mb-2 text-[11px] text-slate-500">
                  Make quick structural tweaks directly from the preview. These
                  edits write back into the Architecture Map.
                </p>

                <div className="space-y-2">
                  {/* Rename active screen */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-400">
                      Rename{" "}
                      <span className="font-semibold">{activeScreen.name}</span>
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        placeholder="e.g. Command Deck"
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/60"
                      />
                      <button
                        type="button"
                        onClick={applyRenameScreen}
                        disabled={!renameValue.trim() || !onArchitectureChange}
                        className="rounded-lg bg-sky-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-700"
                      >
                        Apply
                      </button>
                    </div>
                  </div>

                  {/* Add new screen */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-400">
                      Add Screen
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={newScreenName}
                        onChange={(e) => setNewScreenName(e.target.value)}
                        placeholder="e.g. Tasks HQ"
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/60"
                      />
                      <button
                        type="button"
                        onClick={applyNewScreen}
                        disabled={
                          !newScreenName.trim() || !onArchitectureChange
                        }
                        className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Add helper entity */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-400">
                      Add Helper Entity
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={newEntityName}
                        onChange={(e) => setNewEntityName(e.target.value)}
                        placeholder="e.g. Task, AgentSession"
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/60"
                      />
                      <button
                        type="button"
                        onClick={applyNewEntity}
                        disabled={
                          !newEntityName.trim() || !onArchitectureChange
                        }
                        className="rounded-lg bg-indigo-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-[10px] text-slate-300">
      {label}
    </span>
  );
}

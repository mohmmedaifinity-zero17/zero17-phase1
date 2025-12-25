// src/lib/builder/server/store.ts
import type {
  BuilderProject,
  BuilderBuildType,
  PatchEntry,
  AgentEmployee,
  BrandingOverrides,
} from "@/lib/builder/types";

type DevDb = Record<string, BuilderProject[]>;

declare global {
  // eslint-disable-next-line no-var
  var __Z17_BUILDER_DEV_DB__: DevDb | undefined;
}

const db: DevDb = global.__Z17_BUILDER_DEV_DB__ ?? {};
global.__Z17_BUILDER_DEV_DB__ = db;

function uid(prefix = "z17") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now()
    .toString(36)
    .slice(2)}`;
}

export function devListProjects(userId: string) {
  if (!db[userId]) db[userId] = [];
  return db[userId];
}

export function devCreateProject(opts: {
  userId: string;
  title: string;
  description?: string;
  kind?: BuilderBuildType;
}) {
  const now = new Date().toISOString();
  const p: BuilderProject = {
    id: uid("proj"),
    user_id: opts.userId,
    title: opts.title,
    description: opts.description || "",
    kind: opts.kind || "app",
    status: "draft",
    created_at: now,
    updated_at: now,

    frozen: false,
    freezeReason: "",

    // canonical artifacts start empty
    spec_json: null,
    architecture_json: null,
    api_json: null,
    ui_json: null,
    ops_json: null,
    docs_json: null,
    diagnostics_json: null,
    export_plan_json: null,

    // NEW
    patches: [],
    agents: [],
    branding: {
      theme: "midnight",
      appName: opts.title,
      tagline: "",
      logoDataUrl: "",
    },
  };

  devListProjects(opts.userId).unshift(p);
  return p;
}

export function devFindProject(userId: string, id: string) {
  const list = devListProjects(userId);
  return list.find((x) => x.id === id) || null;
}

export function devUpdateProject(
  userId: string,
  id: string,
  update: Partial<BuilderProject>
) {
  const list = devListProjects(userId);
  const idx = list.findIndex((x) => x.id === id);
  if (idx === -1) return null;

  const current = list[idx];
  const next: BuilderProject = {
    ...current,
    ...update,
    updated_at: new Date().toISOString(),
  };

  list[idx] = next;
  return next;
}

export function devAddPatch(
  userId: string,
  projectId: string,
  patch: PatchEntry
) {
  const p = devFindProject(userId, projectId);
  if (!p) return null;

  const patches = Array.isArray(p.patches) ? p.patches : [];
  patches.unshift(patch);

  return devUpdateProject(userId, projectId, { patches });
}

export function devRollbackToPatch(
  userId: string,
  projectId: string,
  patchId: string
) {
  const p = devFindProject(userId, projectId);
  if (!p) return null;

  const patches = Array.isArray(p.patches) ? p.patches : [];
  const target = patches.find((x) => x.id === patchId);
  if (!target) return null;

  // Apply snapshot conservatively: merge snapshot on top of current
  const snapshot = target.snapshot || {};
  const next = devUpdateProject(userId, projectId, {
    ...snapshot,
    // Keep history & identity stable:
    id: p.id,
    user_id: p.user_id,
    created_at: p.created_at,
    patches,
  });

  return next;
}

export function devUpsertAgent(
  userId: string,
  projectId: string,
  agent: AgentEmployee
) {
  const p = devFindProject(userId, projectId);
  if (!p) return null;

  const agents = Array.isArray(p.agents) ? p.agents : [];
  const idx = agents.findIndex((a) => a.id === agent.id);

  if (idx === -1) agents.unshift(agent);
  else agents[idx] = agent;

  return devUpdateProject(userId, projectId, { agents });
}

export function devSetBranding(
  userId: string,
  projectId: string,
  branding: BrandingOverrides
) {
  const p = devFindProject(userId, projectId);
  if (!p) return null;

  const current = p.branding || {};
  return devUpdateProject(userId, projectId, {
    branding: { ...current, ...branding },
  });
}

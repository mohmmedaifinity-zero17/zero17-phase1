// src/app/api/builder/projects/[id]/patch/route.ts
import { NextResponse } from "next/server";
import { getUserIdOrDev } from "@/lib/builder/server/auth";
import {
  devFindProject,
  devUpdateProject,
  devAddPatch,
} from "@/lib/builder/server/store";

export const dynamic = "force-dynamic";

/**
 * Canonical artifact fields that power the Builder phases.
 * One authoritative allowlist for module wiring.
 */
const CANONICAL_ARTIFACT_KEYS = [
  "spec_json",
  "architecture_json",
  "api_json",
  "ui_json",
  "ops_json",
  "docs_json",
  "diagnostics_json",
  "export_plan_json",
  "test_plan_json", // ✅ added for Phase 5
] as const;

type CanonicalArtifactKey = (typeof CANONICAL_ARTIFACT_KEYS)[number];

type PatchBody = {
  status?: string;

  frozen?: boolean;
  freezeReason?: string;

  artifacts?: Partial<Record<CanonicalArtifactKey, any>>;

  spec_json?: any;
  architecture_json?: any;
  api_json?: any;
  ui_json?: any;
  ops_json?: any;
  docs_json?: any;
  diagnostics_json?: any;
  export_plan_json?: any;
  test_plan_json?: any;

  branding?: any;
  agents?: any;
  patches?: any;

  meta?: {
    module?: string;
    note?: string;
    actor?: string;
  };
};

function nowIso() {
  return new Date().toISOString();
}

function uid(prefix = "patch") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now()
    .toString(36)
    .slice(2)}`;
}

function pickCanonicalArtifacts(body: PatchBody) {
  const next: Partial<Record<CanonicalArtifactKey, any>> = {};

  if (body.artifacts && typeof body.artifacts === "object") {
    for (const k of CANONICAL_ARTIFACT_KEYS) {
      if (k in body.artifacts) next[k] = (body.artifacts as any)[k];
    }
  }

  for (const k of CANONICAL_ARTIFACT_KEYS) {
    if (k in body) (next as any)[k] = (body as any)[k];
  }

  return next;
}

function frozenGuard(project: any, update: Record<string, any>) {
  const isFrozen = !!project?.frozen;
  if (!isFrozen) return;

  // Only allow safe fields while frozen
  const SAFE_WHEN_FROZEN = new Set(["frozen", "freezeReason", "status"]);

  for (const key of Object.keys(update)) {
    if (!SAFE_WHEN_FROZEN.has(key)) {
      throw new Error(
        `Project is frozen. Update blocked for "${key}". Unfreeze to modify artifacts.`
      );
    }
  }
}

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  try {
    const { userId } = await getUserIdOrDev();
    const id = String(ctx?.params?.id || "").trim();
    if (!id) {
      return NextResponse.json(
        { error: "Missing project id" },
        { status: 400 }
      );
    }

    let body: PatchBody;
    try {
      body = (await req.json()) as PatchBody;
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const project = devFindProject(userId, id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const update: Record<string, any> = {};

    if ("status" in body) update.status = String(body.status || "draft");
    if ("frozen" in body) update.frozen = !!body.frozen;
    if ("freezeReason" in body)
      update.freezeReason = String(body.freezeReason || "");

    const artifacts = pickCanonicalArtifacts(body);
    for (const k of CANONICAL_ARTIFACT_KEYS) {
      if (k in artifacts) update[k] = (artifacts as any)[k];
    }

    if ("branding" in body) update.branding = body.branding ?? null;
    if ("agents" in body) update.agents = body.agents ?? [];
    if ("patches" in body) update.patches = body.patches ?? [];

    frozenGuard(project, update);

    const touchedArtifacts = Object.keys(update).filter((k) =>
      (CANONICAL_ARTIFACT_KEYS as readonly string[]).includes(k)
    );

    const updated = devUpdateProject(userId, id, update);
    if (!updated) {
      return NextResponse.json(
        { error: "Failed to update project" },
        { status: 500 }
      );
    }

    // Auto patch record on artifact updates
    if (touchedArtifacts.length > 0) {
      const meta = body.meta || {};
      const patchEntry = {
        id: uid("patch"),
        created_at: nowIso(),
        kind: "artifact_update",
        module: meta.module || "unknown_module",
        note:
          meta.note ||
          `Updated: ${touchedArtifacts.map((x) => x.replace("_json", "")).join(", ")}`,
        actor: meta.actor || "user",
        snapshot: {
          status: updated.status,
          frozen: updated.frozen,
          freezeReason: updated.freezeReason,
          spec_json: (updated as any).spec_json ?? null,
          architecture_json: (updated as any).architecture_json ?? null,
          api_json: (updated as any).api_json ?? null,
          ui_json: (updated as any).ui_json ?? null,
          ops_json: (updated as any).ops_json ?? null,
          docs_json: (updated as any).docs_json ?? null,
          diagnostics_json: (updated as any).diagnostics_json ?? null,
          export_plan_json: (updated as any).export_plan_json ?? null,
          test_plan_json: (updated as any).test_plan_json ?? null,
        },
      };

      const withPatch = devAddPatch(userId, id, patchEntry as any);
      if (withPatch) {
        return NextResponse.json(
          { project: withPatch, patch: patchEntry, touchedArtifacts },
          { status: 200 }
        );
      }
    }

    return NextResponse.json(
      { project: updated, touchedArtifacts },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}

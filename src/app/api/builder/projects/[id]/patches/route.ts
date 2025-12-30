// src/app/api/builder/projects/[id]/patches/route.ts
import { NextResponse } from "next/server";
import { getCtx } from "@/app/api/builder/_shared";
import {
  devFindProject,
  devAddPatch,
  devRollbackToPatch,
} from "@/lib/builder/server/store";
import type { PatchEntry, BuilderProject } from "@/lib/builder/types";

export const dynamic = "force-dynamic";

function uid(prefix = "patch") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now()
    .toString(36)
    .slice(2)}`;
}

function snapshotProject(p: BuilderProject): Partial<BuilderProject> {
  // Snapshot only what matters for “time travel” (safe + stable)
  return {
    title: p.title,
    description: p.description,
    kind: p.kind,
    status: p.status,
    frozen: p.frozen,
    freezeReason: p.freezeReason,

    spec_json: p.spec_json,
    architecture_json: p.architecture_json,
    api_json: p.api_json,
    ui_json: p.ui_json,
    ops_json: p.ops_json,
    docs_json: p.docs_json,
    diagnostics_json: p.diagnostics_json,
    export_plan_json: p.export_plan_json,

    branding: p.branding,
    agents: p.agents,
  };
}

export async function GET(_: Request, ctx: { params: { id: string } }) {
  try {
    const { userId } = await getCtx();
    const id = ctx.params.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const project = devFindProject(userId, id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(
      { patches: Array.isArray(project.patches) ? project.patches : [] },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request, ctx: { params: { id: string } }) {
  try {
    const { userId } = await getCtx();
    const id = ctx.params.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const action = String(body?.action || "create");

    const project = devFindProject(userId, id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (action === "rollback") {
      const patchId = String(body?.patchId || "");
      if (!patchId) {
        return NextResponse.json(
          { error: "patchId required" },
          { status: 400 }
        );
      }

      const next = devRollbackToPatch(userId, id, patchId);
      if (!next) {
        return NextResponse.json({ error: "Rollback failed" }, { status: 500 });
      }

      return NextResponse.json({ project: next }, { status: 200 });
    }

    // default: create patch snapshot
    const label = String(body?.label || "Snapshot");
    const note = String(body?.note || "");

    const entry: PatchEntry = {
      id: uid("patch"),
      label,
      note,
      createdAt: new Date().toISOString(),
      author: userId,
      snapshot: snapshotProject(project),
    };

    const next = devAddPatch(userId, id, entry);
    if (!next) {
      return NextResponse.json(
        { error: "Failed to create patch" },
        { status: 500 }
      );
    }

    return NextResponse.json({ patch: entry, project: next }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}

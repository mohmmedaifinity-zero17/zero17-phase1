// src/app/api/builder/projects/[id]/route.ts
import { NextResponse } from "next/server";
import { getUserIdOrDev } from "@/app/api/builder/_shared";
import type { BuilderProject } from "@/lib/builder/types";

// Optional dev fallback
import { devFindProject, devUpdateProject } from "@/lib/builder/server/store";

export const dynamic = "force-dynamic";

const ALLOWED_KEYS = new Set<string>([
  "title",
  "description",
  "kind",
  "status",
  "frozen",
  "freezeReason",

  "spec_json",
  "architecture_json",
  "api_json",
  "ui_json",
  "ops_json",
  "export_plan_json",
  "deployment_plan_json",
  "test_plan_json",
  "scan_report_json",
  "docs_pack_json",
  "diagnostics_json",

  "patches",
  "agents",
  "branding",
]);

function pickAllowed(body: any) {
  const out: Record<string, any> = {};
  if (!body || typeof body !== "object") return out;
  for (const [k, v] of Object.entries(body)) {
    if (ALLOWED_KEYS.has(k)) out[k] = v;
  }
  return out;
}

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const { supabase, userId } = await getUserIdOrDev();
  const id = ctx.params.id;

  if (userId) {
    const { data, error } = await supabase
      .from("builder_projects")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("[GET /api/builder/projects/[id]] error:", error);
      return NextResponse.json(
        { error: "Failed to load project" },
        { status: 500 }
      );
    }
    if (!data)
      return NextResponse.json({ error: "Project not found" }, { status: 404 });

    return NextResponse.json({ project: data }, { status: 200 });
  }

  // DEV fallback
  const p = devFindProject("dev", id);
  if (!p)
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  return NextResponse.json({ project: p }, { status: 200 });
}

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const { supabase, userId } = await getUserIdOrDev();
  const id = ctx.params.id;

  const body = await req.json().catch(() => ({}));
  const update = pickAllowed(body);

  if (Object.keys(update).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 }
    );
  }

  // Normalize
  if ("freezeReason" in update)
    update.freezeReason = String(update.freezeReason || "");
  if ("status" in update) update.status = String(update.status || "");
  update.updated_at = new Date().toISOString();

  if (userId) {
    const { data, error } = await supabase
      .from("builder_projects")
      .update(update)
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) {
      console.error("[PATCH /api/builder/projects/[id]] error:", error);
      return NextResponse.json(
        { error: "Failed to update project" },
        { status: 500 }
      );
    }

    return NextResponse.json({ project: data }, { status: 200 });
  }

  // DEV fallback
  const p = devUpdateProject("dev", id, update as Partial<BuilderProject>);
  if (!p)
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  return NextResponse.json({ project: p }, { status: 200 });
}

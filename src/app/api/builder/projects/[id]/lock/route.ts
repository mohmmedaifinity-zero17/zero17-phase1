import { NextResponse } from "next/server";
import {
  requireUserOrDemo,
  getProjectOrThrow,
} from "@/app/api/builder/_shared";
import type { BuilderProject } from "@/lib/builder/types";

type Body = {
  locked?: boolean; // optional: if omitted, we toggle
};

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { supabase, userId } = await requireUserOrDemo();

  const id = params?.id;
  if (!id) {
    return NextResponse.json({ error: "Missing project id" }, { status: 400 });
  }

  let body: Body = {};
  try {
    body = await req.json();
  } catch {
    // body is optional, ignore
  }

  const loaded = await getProjectOrThrow({
    supabase,
    projectId: id,
    userId,
    caller: "POST /api/builder/projects/[id]/lock",
  });
  if (loaded.res) return loaded.res;

  const project = loaded.project as BuilderProject;
  const isLocked = String(project.status || "").toLowerCase() === "locked";

  const nextLocked = typeof body.locked === "boolean" ? body.locked : !isLocked;

  const nextStatus = nextLocked ? "locked" : "draft";

  const { data: updated, error: updateError } = await supabase
    .from("builder_projects")
    .update({ status: nextStatus })
    .eq("id", project.id)
    .eq("user_id", userId)
    .select("*")
    .maybeSingle();

  if (updateError || !updated) {
    console.error("[lock] update error:", updateError);
    return NextResponse.json(
      { error: "Failed to toggle lock (RLS/policy or update failed)" },
      { status: 500 }
    );
  }

  // Optional run log (safe if builder_runs exists)
  try {
    await supabase.from("builder_runs").insert({
      project_id: project.id,
      phase: "lock",
      status: "success",
      meta_json: { locked: nextLocked },
    });
  } catch {}

  // ✅ CANONICAL: return { project }
  return NextResponse.json({ project: updated }, { status: 200 });
}

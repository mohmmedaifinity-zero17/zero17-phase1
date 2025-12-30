import { NextResponse } from "next/server";
import {
  loadProjectOrRes,
  updateProjectOrRes,
} from "@/app/api/builder/_project";
import type { BuilderProject } from "@/lib/builder/types";

type Body = {
  locked?: boolean; // optional: if omitted, we toggle
};

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
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

  const loaded = await loadProjectOrRes({
    projectId: id,
    caller: "POST /api/builder/projects/[id]/lock",
  });

  if (loaded.res) return loaded.res;

  const { project, userId, supabase } = loaded;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isLocked = String(project.status || "").toLowerCase() === "locked";
  const nextLocked = typeof body.locked === "boolean" ? body.locked : !isLocked;
  const nextStatus = nextLocked ? "locked" : "draft";

  const res = await updateProjectOrRes({
    projectId: project.id,
    userId,
    supabase,
    patch: { status: nextStatus },
    caller: "POST /api/builder/projects/[id]/lock",
  });

  if (res.res) return res.res;

  // Optional run log (safe if builder_runs exists)
  try {
    await supabase.from("builder_runs").insert({
      project_id: project.id,
      phase: "lock",
      status: "success",
      meta_json: { locked: nextLocked },
    });
  } catch {}

  return NextResponse.json({ project: res.project }, { status: 200 });
}

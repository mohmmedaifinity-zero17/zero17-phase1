import { NextResponse } from "next/server";
import { requireCtx } from "@/app/api/builder/_shared";
import type { BuilderProject } from "@/lib/builder/types";

export const dynamic = "force-dynamic";

export async function loadProjectOrRes(opts: {
  projectId: string;
  caller: string;
}) {
  const ctx = await requireCtx();
  if (ctx.res) return { res: ctx.res };

  const { supabase, userId } = ctx;

  console.log(
    `[${opts.caller}] ctx.userId=${userId} projectId=${opts.projectId}`
  );

  const { data: project, error } = await supabase
    .from("builder_projects")
    .select("*")
    .eq("id", opts.projectId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error(`[${opts.caller}] load error:`, error);
    return {
      res: NextResponse.json(
        { error: "Failed to load project", details: error.message },
        { status: 500 }
      ),
    };
  }

  if (!project) {
    return {
      res: NextResponse.json(
        { error: "Project not found", details: `No row for (id,user_id)` },
        { status: 404 }
      ),
    };
  }

  return { project: project as BuilderProject, supabase, userId, res: null };
}

export async function updateProjectOrRes(opts: {
  projectId: string;
  userId: string;
  supabase: any;
  patch: Record<string, any>;
  caller: string;
}) {
  const { data: updated, error } = await opts.supabase
    .from("builder_projects")
    .update({ ...opts.patch, updated_at: new Date().toISOString() })
    .eq("id", opts.projectId)
    .eq("user_id", opts.userId)
    .select("*")
    .single();

  if (error || !updated) {
    console.error(`[${opts.caller}] update error:`, error);
    return {
      res: NextResponse.json(
        {
          error: "Failed to update project",
          details: error?.message ?? "unknown",
        },
        { status: 500 }
      ),
    };
  }

  return { project: updated as BuilderProject, res: null };
}

// src/app/api/builder/_projects.ts
import { NextResponse } from "next/server";
import type { BuilderProject } from "@/lib/builder/types";
import { getUserIdOrDev } from "@/app/api/builder/_shared";
import {
  devFindProject,
  devUpdateProject,
  devListProjects,
} from "@/lib/builder/server/store";

/**
 * World-class contract:
 * - Signed-in => Supabase persistent project
 * - Signed-out => Demo mode (in-memory) project
 */

export type ProjectCtx =
  | {
      mode: "supabase";
      userId: string;
      supabase: any;
      project: BuilderProject;
    }
  | {
      mode: "demo";
      userId: "dev";
      supabase: null;
      project: BuilderProject;
    };

export async function requireProject(projectId: string) {
  const { supabase, userId } = await getUserIdOrDev();

  // ✅ DEMO MODE: signed-out uses dev store (so phases work)
  if (!userId) {
    const p = devFindProject("dev", projectId);
    if (!p) {
      return {
        ok: false as const,
        res: NextResponse.json(
          {
            error:
              "Project not found (Demo Mode). Demo projects reset on refresh. Sign in to persist.",
          },
          { status: 404 }
        ),
      };
    }

    return {
      ok: true as const,
      ctx: {
        mode: "demo",
        userId: "dev" as const,
        supabase: null,
        project: p,
      } satisfies ProjectCtx,
    };
  }

  // ✅ SUPABASE MODE: signed-in persistent
  const { data, error } = await supabase
    .from("builder_projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[requireProject] supabase fetch error:", error);
    return {
      ok: false as const,
      res: NextResponse.json(
        { error: "Failed to load project" },
        { status: 500 }
      ),
    };
  }

  if (!data) {
    return {
      ok: false as const,
      res: NextResponse.json({ error: "Project not found" }, { status: 404 }),
    };
  }

  return {
    ok: true as const,
    ctx: {
      mode: "supabase",
      userId,
      supabase,
      project: data as BuilderProject,
    } satisfies ProjectCtx,
  };
}

export async function saveProjectUpdate(
  ctx: ProjectCtx,
  update: Partial<BuilderProject>
) {
  // ✅ DEMO MODE update
  if (ctx.mode === "demo") {
    const updated = devUpdateProject("dev", ctx.project.id, update);
    if (!updated) {
      return {
        ok: false as const,
        res: NextResponse.json({ error: "Project not found" }, { status: 404 }),
      };
    }
    return { ok: true as const, project: updated };
  }

  // ✅ SUPABASE update
  const { data, error } = await ctx.supabase
    .from("builder_projects")
    .update({ ...update, updated_at: new Date().toISOString() })
    .eq("id", ctx.project.id)
    .eq("user_id", ctx.userId)
    .select("*")
    .single();

  if (error) {
    console.error("[saveProjectUpdate] supabase update error:", error);
    return {
      ok: false as const,
      res: NextResponse.json(
        { error: "Failed to save project" },
        { status: 500 }
      ),
    };
  }

  return { ok: true as const, project: data as BuilderProject };
}

export function listDemoProjects() {
  return devListProjects("dev");
}

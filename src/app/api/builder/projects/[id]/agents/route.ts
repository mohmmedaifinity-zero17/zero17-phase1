// src/app/api/builder/projects/[id]/agents/route.ts
import { NextResponse } from "next/server";
import { getUserIdOrDev } from "@/lib/builder/server/auth";
import { devFindProject, devUpsertAgent } from "@/lib/builder/server/store";
import type { AgentEmployee, AgentMode } from "@/lib/builder/types";

export const dynamic = "force-dynamic";

function uid(prefix = "agent") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now()
    .toString(36)
    .slice(2)}`;
}

export async function GET(_: Request, ctx: { params: { id: string } }) {
  const { userId } = await getUserIdOrDev();
  const project = devFindProject(userId, ctx.params.id);
  if (!project)
    return NextResponse.json({ error: "Project not found" }, { status: 404 });

  return NextResponse.json(
    { agents: Array.isArray(project.agents) ? project.agents : [] },
    { status: 200 }
  );
}

export async function POST(req: Request, ctx: { params: { id: string } }) {
  try {
    const { userId } = await getUserIdOrDev();
    const projectId = ctx.params.id;

    const project = devFindProject(userId, projectId);
    if (!project)
      return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const body = await req.json().catch(() => ({}));

    const name = String(body?.name || "").trim();
    const role = String(body?.role || "").trim();
    const objective = String(body?.objective || "").trim();

    if (!name || !role || !objective) {
      return NextResponse.json(
        { error: "name, role, objective are required" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const agent: AgentEmployee = {
      id: uid("agent"),
      name,
      role,
      objective,
      mode: "draft",
      createdAt: now,
      updatedAt: now,
      config:
        body?.config && typeof body.config === "object" ? body.config : {},
      signals: {
        shadowRuns: 0,
        passRate: 0,
        lastRunAt: "",
        notes: "",
      },
    };

    const next = devUpsertAgent(userId, projectId, agent);
    if (!next)
      return NextResponse.json(
        { error: "Failed to create agent" },
        { status: 500 }
      );

    return NextResponse.json({ agent, project: next }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}

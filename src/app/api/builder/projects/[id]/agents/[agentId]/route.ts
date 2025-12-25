// src/app/api/builder/projects/[id]/agents/[agentId]/route.ts
import { NextResponse } from "next/server";
import { getUserIdOrDev } from "@/lib/builder/server/auth";
import { devFindProject, devUpsertAgent } from "@/lib/builder/server/store";
import type { AgentEmployee, AgentMode } from "@/lib/builder/types";

export const dynamic = "force-dynamic";

function nextMode(mode: AgentMode): AgentMode {
  if (mode === "draft") return "shadow";
  if (mode === "shadow") return "production";
  return "production";
}

export async function PATCH(
  req: Request,
  ctx: { params: { id: string; agentId: string } }
) {
  try {
    const { userId } = await getUserIdOrDev();
    const projectId = ctx.params.id;
    const agentId = ctx.params.agentId;

    const project = devFindProject(userId, projectId);
    if (!project)
      return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const agents = Array.isArray(project.agents) ? project.agents : [];
    const current = agents.find((a) => a.id === agentId);
    if (!current)
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const action = String(body?.action || "promote");

    let updated: AgentEmployee = {
      ...current,
      updatedAt: new Date().toISOString(),
    };

    if (action === "setMode") {
      const mode = String(body?.mode || "") as AgentMode;
      if (!["draft", "shadow", "production"].includes(mode)) {
        return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
      }
      updated.mode = mode;
    } else if (action === "promote") {
      updated.mode = nextMode(current.mode);
    } else if (action === "update") {
      if ("name" in body) updated.name = String(body.name || "");
      if ("role" in body) updated.role = String(body.role || "");
      if ("objective" in body) updated.objective = String(body.objective || "");
      if ("signals" in body && typeof body.signals === "object") {
        updated.signals = { ...(updated.signals || {}), ...body.signals };
      }
      if ("config" in body && typeof body.config === "object") {
        updated.config = { ...(updated.config || {}), ...body.config };
      }
    } else {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    const next = devUpsertAgent(userId, projectId, updated);
    if (!next)
      return NextResponse.json(
        { error: "Failed to update agent" },
        { status: 500 }
      );

    return NextResponse.json(
      { agent: updated, project: next },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}

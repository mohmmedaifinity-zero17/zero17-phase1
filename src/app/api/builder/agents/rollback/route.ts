// src/app/api/builder/agents/rollback/route.ts

import { NextResponse } from "next/server";
import { getUserIdOrDev } from "@/lib/builder/server/auth";
import { devListProjects } from "@/lib/builder/server/store";
import { appendLedgerEvent } from "@/lib/builder/server/ledger";

export async function POST(req: Request) {
  const { userId } = await getUserIdOrDev();
  const body = await req.json().catch(() => ({}));

  const { projectId, agentId, toStatus } = body;

  if (!projectId || !agentId || !toStatus) {
    return NextResponse.json(
      { error: "Missing rollback data" },
      { status: 400 }
    );
  }

  if (!["shadow", "draft"].includes(toStatus)) {
    return NextResponse.json(
      { error: "Invalid rollback target" },
      { status: 400 }
    );
  }

  const projects = devListProjects(userId);
  const project = projects.find((p) => p.id === projectId);

  if (!project || !project.agents) {
    return NextResponse.json(
      { error: "Project or agents not found" },
      { status: 404 }
    );
  }

  const agent = project.agents.find((a: any) => a.id === agentId);
  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  const previousStatus = agent.status;
  agent.status = toStatus;
  project.updated_at = new Date().toISOString();

  appendLedgerEvent(project, {
    type: "agent_rollback",
    payload: {
      agentId,
      from: previousStatus,
      to: toStatus,
    },
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, status: toStatus }, { status: 200 });
}

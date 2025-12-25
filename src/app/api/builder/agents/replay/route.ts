// src/app/api/builder/agents/replay/route.ts

import { NextResponse } from "next/server";
import { getUserIdOrDev } from "@/lib/builder/server/auth";
import { devListProjects } from "@/lib/builder/server/store";
import { appendLedgerEvent } from "@/lib/builder/server/ledger";
import { replayShadowRun } from "@/lib/builder/server/agentShadow";

export async function POST(req: Request) {
  const { userId } = await getUserIdOrDev();
  const body = await req.json().catch(() => ({}));

  const { projectId, runId } = body;

  if (!projectId || !runId) {
    return NextResponse.json(
      { error: "Missing projectId or runId" },
      { status: 400 }
    );
  }

  const project = devListProjects(userId).find((p) => p.id === projectId);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const evt = (project.ledger || []).find(
    (e: any) => e.type === "agent_shadow_run" && e.payload?.runId === runId
  );

  if (!evt?.payload?.seed || !evt?.payload?.tasks) {
    return NextResponse.json(
      { error: "Run not replayable (missing seed/tasks)" },
      { status: 400 }
    );
  }

  const replay = replayShadowRun({
    agentName: evt.payload.agentName || "AI Employee",
    tasks: evt.payload.tasks,
    seed: Number(evt.payload.seed),
    agentId: evt.payload.agentId,
  });

  appendLedgerEvent(project, {
    type: "agent_run_replay",
    payload: {
      originalRunId: runId,
      replaySeed: replay.seed,
      replayKpis: replay.kpis,
      replayLogs: replay.logs,
    },
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, replay }, { status: 200 });
}

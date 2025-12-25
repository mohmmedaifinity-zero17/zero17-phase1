// src/app/api/builder/agents/shadow/route.ts

import { NextResponse } from "next/server";
import { getUserIdOrDev } from "@/lib/builder/server/auth";
import { devListProjects } from "@/lib/builder/server/store";
import { appendLedgerEvent } from "@/lib/builder/server/ledger";
import { getAgentRunsFromLedger } from "@/lib/builder/agentInsights";
import { detectRegression } from "@/lib/builder/server/agentRegression";
import { shouldAutoDemote } from "@/lib/builder/server/agentAutoDemotion";
import { runAgentInShadowModeDeterministic } from "@/lib/builder/server/agentShadow";

export async function POST(req: Request) {
  const { userId } = await getUserIdOrDev();
  const body = await req.json().catch(() => ({}));

  const { projectId, agentId, agentName, tasks, seed } = body;

  if (!projectId || !tasks?.length) {
    return NextResponse.json(
      { error: "Missing projectId or tasks" },
      { status: 400 }
    );
  }

  const project = devListProjects(userId).find((p) => p.id === projectId);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const realSeed = Number.isFinite(Number(seed)) ? Number(seed) : Date.now();

  const result = runAgentInShadowModeDeterministic({
    agentName: agentName || "AI Employee",
    tasks,
    seed: realSeed,
    agentId,
    mode: "shadow",
  });

  appendLedgerEvent(project, {
    type: "agent_shadow_run",
    payload: result,
    createdAt: new Date().toISOString(),
  });

  // Regression detection + auto-demotion (only if that agent is production)
  const prodAgent = project.agents?.find(
    (a: any) =>
      (agentId ? a.id === agentId : a.name === (agentName || "AI Employee")) &&
      a.status === "production"
  );

  if (prodAgent) {
    const runs = getAgentRunsFromLedger(project.ledger);
    if (runs.length >= 2) {
      const baseline = runs[runs.length - 2];
      const regression = detectRegression(baseline, result);

      if (regression.regressed) {
        appendLedgerEvent(project, {
          type: "agent_regression_alert",
          payload: {
            agentId: prodAgent.id,
            agentName: prodAgent.name,
            regression,
          },
          createdAt: new Date().toISOString(),
        });

        const demotion = shouldAutoDemote(baseline, result);
        if (demotion.demote) {
          prodAgent.status = "shadow";
          appendLedgerEvent(project, {
            type: "agent_auto_demoted",
            payload: {
              agentId: prodAgent.id,
              agentName: prodAgent.name,
              reason: demotion.reason,
            },
            createdAt: new Date().toISOString(),
          });
        }
      }
    }
  }

  project.updated_at = new Date().toISOString();

  return NextResponse.json({ ok: true, result }, { status: 200 });
}

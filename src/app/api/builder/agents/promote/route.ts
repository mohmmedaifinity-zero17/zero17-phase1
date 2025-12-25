// src/app/api/builder/agents/promote/route.ts

import { NextResponse } from "next/server";
import { getUserIdOrDev } from "@/lib/builder/server/auth";
import { devListProjects } from "@/lib/builder/server/store";
import { getAgentRunsFromLedger } from "@/lib/builder/agentInsights";
import { evaluatePromotionTrend } from "@/lib/builder/server/agentTrendGate";
import { appendLedgerEvent } from "@/lib/builder/server/ledger";
import { createApproval } from "@/lib/builder/server/approvals";

export async function POST(req: Request) {
  const { userId } = await getUserIdOrDev();
  const body = await req.json().catch(() => ({}));

  const { projectId, agentId } = body;

  if (!projectId || !agentId) {
    return NextResponse.json(
      { error: "Missing projectId or agentId" },
      { status: 400 }
    );
  }

  const project = devListProjects(userId).find((p) => p.id === projectId);
  if (!project || !(project as any).agents) {
    return NextResponse.json(
      { error: "Project or agents not found" },
      { status: 404 }
    );
  }

  // ✅ Freeze guard (server-enforced)
  if ((project as any).frozen) {
    appendLedgerEvent(project, {
      type: "action_blocked_frozen",
      payload: {
        action: "agent_promote_request",
        agentId,
        freezeReason: (project as any).freezeReason || "",
      },
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(
      { error: "Project is frozen. Promotion actions are blocked." },
      { status: 423 }
    );
  }

  const agent = (project as any).agents.find((a: any) => a.id === agentId);
  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  const runs = getAgentRunsFromLedger((project as any).ledger);
  const decision = evaluatePromotionTrend(runs);

  if (!decision.ok) {
    appendLedgerEvent(project, {
      type: "agent_promotion_blocked",
      payload: { agentId, reason: decision.reason, metrics: decision.metrics },
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(
      { ok: false, reason: decision.reason, metrics: decision.metrics },
      { status: 200 }
    );
  }

  const requestId = `apr_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const approval = createApproval(project, {
    id: requestId,
    type: "agent_promotion",
    agentId,
    createdAt: new Date().toISOString(),
    metrics: decision.metrics,
    reason: "Trend gate passed. Human approval required.",
  });

  appendLedgerEvent(project, {
    type: "agent_promotion_requested",
    payload: { requestId, agentId, metrics: decision.metrics },
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json(
    { ok: true, pending: true, approval },
    { status: 200 }
  );
}

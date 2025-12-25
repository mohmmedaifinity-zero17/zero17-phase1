// src/app/api/builder/agents/approve/route.ts

import { NextResponse } from "next/server";
import { getUserIdOrDev } from "@/lib/builder/server/auth";
import { devListProjects } from "@/lib/builder/server/store";
import { appendLedgerEvent } from "@/lib/builder/server/ledger";
import { resolveApproval } from "@/lib/builder/server/approvals";

export async function POST(req: Request) {
  const { userId } = await getUserIdOrDev();
  const body = await req.json().catch(() => ({}));

  const { projectId, requestId, decision } = body;

  if (!projectId || !requestId || !["approved", "denied"].includes(decision)) {
    return NextResponse.json(
      { error: "Invalid approval request" },
      { status: 400 }
    );
  }

  const project = devListProjects(userId).find((p) => p.id === projectId);
  if (!project || !(project as any).agents) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // ✅ Freeze guard (server-enforced)
  if ((project as any).frozen) {
    appendLedgerEvent(project, {
      type: "action_blocked_frozen",
      payload: {
        action: "agent_promotion_approval",
        requestId,
        decision,
        freezeReason: (project as any).freezeReason || "",
      },
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(
      { error: "Project is frozen. Approval actions are blocked." },
      { status: 423 }
    );
  }

  const reqObj = resolveApproval(project, requestId, decision);
  if (!reqObj) {
    return NextResponse.json(
      { error: "Approval request not found" },
      { status: 404 }
    );
  }

  const agent = (project as any).agents.find(
    (a: any) => a.id === reqObj.agentId
  );
  if (!agent) {
    return NextResponse.json(
      { error: "Agent not found for approval" },
      { status: 404 }
    );
  }

  if (decision === "approved") {
    agent.status = "production";
    appendLedgerEvent(project, {
      type: "agent_promotion_approved",
      payload: { requestId, agentId: agent.id },
      createdAt: new Date().toISOString(),
    });
  } else {
    appendLedgerEvent(project, {
      type: "agent_promotion_denied",
      payload: { requestId, agentId: agent.id },
      createdAt: new Date().toISOString(),
    });
  }

  (project as any).updated_at = new Date().toISOString();

  return NextResponse.json(
    { ok: true, status: reqObj.status, agentStatus: agent.status },
    { status: 200 }
  );
}

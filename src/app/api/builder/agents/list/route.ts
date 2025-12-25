// src/app/api/builder/agents/list/route.ts

import { NextResponse } from "next/server";
import { getUserIdOrDev } from "@/lib/builder/server/auth";
import { devListProjects } from "@/lib/builder/server/store";

export async function GET() {
  const { userId } = await getUserIdOrDev();
  const projects = devListProjects(userId);

  const rows: any[] = [];

  for (const p of projects) {
    const approvals = (p as any).approvals || [];
    const agents = (p as any).agents || [];

    for (const a of agents) {
      const pending = approvals.some(
        (x: any) =>
          x.type === "agent_promotion" &&
          x.agentId === a.id &&
          x.status === "pending"
      );

      rows.push({
        projectId: p.id,
        projectTitle: p.title,
        agentId: a.id,
        agentName: a.name,
        role: a.role || "",
        status: a.status,
        pendingApproval: pending,
      });
    }
  }

  return NextResponse.json({ ok: true, rows }, { status: 200 });
}

// src/app/api/builder/agents/compare/route.ts

import { NextResponse } from "next/server";
import { getUserIdOrDev } from "@/lib/builder/server/auth";
import { devListProjects } from "@/lib/builder/server/store";
import { getAgentRunsFromLedger } from "@/lib/builder/agentInsights";

export async function GET() {
  const { userId } = await getUserIdOrDev();
  const projects = devListProjects(userId);

  const rows: any[] = [];

  for (const p of projects) {
    const agents = p.agents || [];
    const runs = getAgentRunsFromLedger(p.ledger);

    for (const a of agents) {
      // latest run for this agent (match by agentId if present)
      const last = [...runs].reverse().find((r: any) => {
        if (r.agentId) return r.agentId === a.id;
        return r.agentName === a.name;
      });

      rows.push({
        projectId: p.id,
        projectTitle: p.title,
        agentId: a.id,
        agentName: a.name,
        status: a.status,
        lastRunId: last?.runId || null,
        successRate: last?.kpis?.successRate ?? null,
        confidenceScore: last?.kpis?.confidenceScore ?? null,
        avgLatencyMs: last?.kpis?.avgLatencyMs ?? null,
        lastRunAt: last?.createdAt ?? null,
      });
    }
  }

  return NextResponse.json({ ok: true, rows }, { status: 200 });
}

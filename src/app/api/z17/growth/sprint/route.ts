// src/app/api/z17/growth/sprint/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { label, agentType } = body as {
    label?: string;
    agentType?: string;
  };

  return NextResponse.json({
    ok: true,
    enhancedLabel:
      label && agentType
        ? `${label} (driven by ${agentType} with sharper copy and a clear success metric)`
        : label || "Refine this task with clearer outcome and metric.",
  });
}

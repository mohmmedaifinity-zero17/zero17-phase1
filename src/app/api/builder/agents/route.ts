// src/app/api/builder/agents/route.ts

import { NextResponse } from "next/server";
import {
  buildAgentFromJD,
  evaluateAgent,
} from "@/lib/builder/server/agentFactory";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const jd = body.jobDescription || "";

  if (!jd.trim()) {
    return NextResponse.json(
      { error: "Missing job description" },
      { status: 400 }
    );
  }

  const agent = buildAgentFromJD(jd);
  const evaluation = evaluateAgent(agent);

  return NextResponse.json({ agent, evaluation }, { status: 200 });
}

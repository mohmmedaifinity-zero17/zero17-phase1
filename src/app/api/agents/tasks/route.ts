// src/app/api/agents/tasks/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

export const dynamic = "force-dynamic";

type Task = {
  id: string;
  agentId: string;
  source: string;
  summary: string;
  status: "open" | "in-progress" | "done";
  createdAt: number;
};

// In-memory stub (OK for dev; later you can swap to Supabase)
const tasks: Task[] = [];

export async function GET() {
  // newest first
  const sorted = [...tasks].sort((a, b) => b.createdAt - a.createdAt);
  return NextResponse.json({ tasks: sorted }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const { agentId, source, summary } = await req.json();

  if (!agentId || !summary) {
    return NextResponse.json(
      { error: "agentId and summary are required" },
      { status: 400 }
    );
  }

  const task: Task = {
    id: crypto.randomBytes(8).toString("hex"),
    agentId: String(agentId),
    source: String(source || "unknown"),
    summary: String(summary),
    status: "open",
    createdAt: Date.now(),
  };

  tasks.push(task);

  return NextResponse.json({ task }, { status: 201 });
}

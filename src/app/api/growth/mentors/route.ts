// src/app/api/growth/mentors/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const pack = {
    cmo: [
      "Clarify the core promise in one sentence you can repeat everywhere.",
      "Pick one primary channel for 30 days instead of 5 channels for 3 days each.",
    ],
    growth: [
      "Define one activation metric (e.g. created first project) and aim to improve only that.",
      "Ship one small experiment per week instead of planning a big launch every quarter.",
    ],
    copy: [
      "Write your homepage headline around outcome, not features.",
      "Use screenshots or GIFs showing before/after, not just UI shots.",
    ],
    sales: [
      "List 20 ideal prospects by name and send 1:1 messages instead of generic blasts.",
      "Offer a time-boxed pilot instead of asking for big commitments upfront.",
    ],
    retention: [
      "Add a quick in-app check-in after 3 days of inactivity.",
      "Ask canceled users one question: 'What made this not worth paying for yet?'",
    ],
  };

  return NextResponse.json(pack, { status: 200 });
}

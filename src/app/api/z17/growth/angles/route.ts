// src/app/api/z17/growth/angles/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// This is a stub: later you can swap the logic to call OpenAI / any LLM.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}) as any);
  const goal = (body.goal as string) || "Leads";
  const icp = (body.icp as string) || "your ideal customers";
  const offer = (body.offer as string) || "your core offer";
  const baseAngle =
    (body.baseAngle as string) ||
    "Launch an MVP faster than hiring a full dev team.";

  // Very simple transformations to make the UI work end-to-end.
  const clarity = `Get ${goal.toLowerCase()} from ${icp} by offering ${offer} — no fluff, just a clear path from first click to result.`;
  const premium = `A private, done-for-you ${offer} for ${icp} who value speed, precision and white-glove execution more than saving a few rupees.`;
  const bold = `${baseAngle} — or we work with you until it does. No complex funnels, no bloated ad spend, just aggressive focus on what moves the metric.`;
  const contrarian = `Stop chasing more traffic. Use ${offer} to turn the tiny audience you already have into a ${goal.toLowerCase()} engine by fixing the offer, not the algorithm.`;

  return NextResponse.json(
    {
      ok: true,
      angles: {
        clarity,
        premium,
        bold,
        contrarian,
      },
    },
    { status: 200 }
  );
}

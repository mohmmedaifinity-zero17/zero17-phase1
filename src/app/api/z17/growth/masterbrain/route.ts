// src/app/api/z17/growth/masterbrain/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { idea, icp, stage } = body;

  const summary =
    "Masterbrain suggests focusing this week on tightening ICP → offer → proof, then running one channel experiment instead of 5 scattered tactics.";

  return NextResponse.json({
    ok: true,
    summary,
    icp: icp || "Solo founders building AI products",
    stage: stage || "prelaunch",
    priorities: [
      "Lock one flagship offer for a single ICP.",
      "Ship one undeniable proof asset (case study or demo).",
      "Run a single-channel experiment and measure one core metric.",
    ],
  });
}

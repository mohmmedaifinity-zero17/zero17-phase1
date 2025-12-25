// src/app/api/z17/growth/oracle/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { idea, stage } = body as { idea?: string; stage?: string };

  const trimmed = (idea || "your product").slice(0, 200);

  const opportunities = [
    `Own a narrow wedge of the market where ${trimmed} solves a painful workflow in days, not months.`,
    "Bundle growth services or templates around the core product to charge higher ACV.",
    "Leverage public build-in-public content to convert attention directly into trials.",
  ];

  const threats = [
    "Commoditization as more AI tools appear with similar features.",
    "Dependence on a single channel (e.g. X or paid ads) for all new users.",
  ];

  const angles = [
    "Position as the ‘growth operating system’ rather than yet another AI app.",
    "Sell outcomes and proof, not features – lead with transformations.",
  ];

  const summary = `For a ${stage || "prelaunch"} product like ${
    trimmed || "yours"
  }, the Oracle recommends focusing on a sharp wedge, proofs that feel undeniable, and at least one compounding loop to avoid being copied to death.`;

  return NextResponse.json({
    ok: true,
    summary,
    opportunities,
    threats,
    angles,
  });
}

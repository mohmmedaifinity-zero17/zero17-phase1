// src/app/api/growth/kpi/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const pricePerMonth = Number(body.pricePerMonth ?? 49);
  const grossMargin = Number(body.grossMargin ?? 0.8);
  const churnMonthly = Number(body.churnMonthly ?? 0.08);
  const cac = Number(body.cac ?? 120);
  const monthlyBurn = Number(body.monthlyBurn ?? 1000);
  const cashInBank = Number(body.cashInBank ?? 5000);

  // Very simple modeling (stub; can be replaced with something more precise later)
  const ltv =
    churnMonthly > 0
      ? (pricePerMonth * grossMargin) / churnMonthly
      : pricePerMonth * grossMargin * 36;
  const paybackMonths = cac / (pricePerMonth * grossMargin || 1);
  const runwayMonths =
    monthlyBurn > 0 ? cashInBank / monthlyBurn : Number.POSITIVE_INFINITY;

  const notes: string[] = [];

  if (paybackMonths <= 6) {
    notes.push("Payback period is healthy for self-funded growth.");
  } else {
    notes.push(
      "Payback period is long; consider raising prices or reducing CAC."
    );
  }

  if (runwayMonths < 6) {
    notes.push("Runway is short; keep fixed costs low until revenue grows.");
  } else {
    notes.push(
      "Runway is decent; focus on activation and retention for the next few months."
    );
  }

  if (ltv / cac < 3) {
    notes.push(
      "LTV/CAC ratio is low; test pricing or reduce acquisition costs."
    );
  } else {
    notes.push("LTV/CAC ratio is solid; scaling acquisition could be viable.");
  }

  return NextResponse.json(
    {
      cac,
      ltv,
      paybackMonths,
      runwayMonths,
      notes,
    },
    { status: 200 }
  );
}

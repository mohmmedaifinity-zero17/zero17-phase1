// src/app/api/launch/room/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const snapshot = {
    visitors: 184,
    signups: 37,
    errors: 2,
    conversionRate: (37 / 184) * 100,
    topCountries: ["India", "United States", "Germany", "Brazil", "Singapore"],
  };

  return NextResponse.json({ snapshot }, { status: 200 });
}

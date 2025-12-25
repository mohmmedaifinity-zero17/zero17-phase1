import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function POST(req: NextRequest) {
  return NextResponse.json(
    {
      perf: 82,
      a11y: 76,
      security: 88,
      codeQuality: 70,
      issues: ["long function", "missing aria-label"],
    },
    { status: 200 }
  );
}

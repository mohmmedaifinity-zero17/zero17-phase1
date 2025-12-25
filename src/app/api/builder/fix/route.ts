import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function POST(req: NextRequest) {
  return NextResponse.json(
    {
      applied: ["function shortened", "added aria-label"],
      success: true,
    },
    { status: 200 }
  );
}

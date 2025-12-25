// src/app/builder/scan/route.ts
import { NextResponse } from "next/server";
import { runSecurityScan } from "@/lib/builder/server/scan";

export async function POST(req: Request) {
  try {
    const { code = "" } = await req.json().catch(() => ({}));
    const result = runSecurityScan(code);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", error: err?.message ?? "unknown" },
      { status: 500 }
    );
  }
}

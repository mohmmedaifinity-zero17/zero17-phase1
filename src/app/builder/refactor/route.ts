// src/app/builder/refactor/route.ts
import { NextResponse } from "next/server";
import { runRefactorStub } from "@/lib/builder/server/refactor";

export async function POST(req: Request) {
  try {
    const { code = "" } = await req.json().catch(() => ({}));
    const result = runRefactorStub(code);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", error: err?.message ?? "unknown" },
      { status: 500 }
    );
  }
}
